import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authMiddleware, requireAuth, requireRole } from "../middleware/auth";

export const courses = new Hono<{ Variables: { user: any; session: any } }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const rows = await db.select().from(schema.courses);
    return c.json({ courses: rows }, 200);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, id));
    if (!course) return c.json({ message: "Not found" }, 404);
    const lessonRows = await db
      .select()
      .from(schema.lessons)
      .where(eq(schema.lessons.courseId, id))
      .orderBy(schema.lessons.order);
    return c.json({ course, lessons: lessonRows }, 200);
  })
  .post("/", requireAuth, requireRole("admin"), async (c) => {
    const body = await c.req.json();
    const user = c.get("user") as any;
    const [row] = await db
      .insert(schema.courses)
      .values({ ...body, createdBy: user.id })
      .returning();
    return c.json({ course: row }, 201);
  })
  .put("/:id", requireAuth, requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.update(schema.courses).set(body).where(eq(schema.courses.id, id)).returning();
    return c.json({ course: row }, 200);
  })
  .delete("/:id", requireAuth, requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.lessons).where(eq(schema.lessons.courseId, id));
    await db.delete(schema.courses).where(eq(schema.courses.id, id));
    return c.json({ ok: true }, 200);
  })
  // lessons nested
  .post("/:id/lessons", requireAuth, requireRole("admin"), async (c) => {
    const courseId = Number(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.insert(schema.lessons).values({ ...body, courseId }).returning();
    return c.json({ lesson: row }, 201);
  })
  .put("/lessons/:lessonId", requireAuth, requireRole("admin"), async (c) => {
    const lessonId = Number(c.req.param("lessonId"));
    const body = await c.req.json();
    const [row] = await db.update(schema.lessons).set(body).where(eq(schema.lessons.id, lessonId)).returning();
    return c.json({ lesson: row }, 200);
  })
  .delete("/lessons/:lessonId", requireAuth, requireRole("admin"), async (c) => {
    const lessonId = Number(c.req.param("lessonId"));
    await db.delete(schema.lessons).where(eq(schema.lessons.id, lessonId));
    return c.json({ ok: true }, 200);
  })
  // enrollment
  .post("/:id/enroll", requireAuth, async (c) => {
    const courseId = Number(c.req.param("id"));
    const user = c.get("user") as any;
    const [existing] = await db
      .select()
      .from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, user.id), eq(schema.enrollments.courseId, courseId)));
    if (existing) return c.json({ enrollment: existing }, 200);
    const [row] = await db.insert(schema.enrollments).values({ userId: user.id, courseId }).returning();
    return c.json({ enrollment: row }, 201);
  })
  .get("/:id/enrollment", requireAuth, async (c) => {
    const courseId = Number(c.req.param("id"));
    const user = c.get("user") as any;
    const [enrollment] = await db
      .select()
      .from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, user.id), eq(schema.enrollments.courseId, courseId)));
    const progressRows = await db
      .select()
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.userId, user.id));
    return c.json({ enrollment: enrollment ?? null, completedLessonIds: progressRows.filter(p => p.completed).map(p => p.lessonId) }, 200);
  })
  .post("/lessons/:lessonId/complete", requireAuth, async (c) => {
    const lessonId = Number(c.req.param("lessonId"));
    const user = c.get("user") as any;
    const [lesson] = await db.select().from(schema.lessons).where(eq(schema.lessons.id, lessonId));
    if (!lesson) return c.json({ message: "Not found" }, 404);

    const [existing] = await db
      .select()
      .from(schema.lessonProgress)
      .where(and(eq(schema.lessonProgress.userId, user.id), eq(schema.lessonProgress.lessonId, lessonId)));

    if (!existing) {
      await db.insert(schema.lessonProgress).values({
        userId: user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
      await db
        .update(schema.user)
        .set({ xp: (user.xp ?? 0) + lesson.xpReward })
        .where(eq(schema.user.id, user.id));
    }

    // recompute course progress
    const allLessons = await db.select().from(schema.lessons).where(eq(schema.lessons.courseId, lesson.courseId));
    const progressRows = await db
      .select()
      .from(schema.lessonProgress)
      .where(and(eq(schema.lessonProgress.userId, user.id), eq(schema.lessonProgress.completed, true)));
    const completedIds = new Set(progressRows.map((p) => p.lessonId));
    const completedInCourse = allLessons.filter((l) => completedIds.has(l.id)).length;
    const percent = allLessons.length ? Math.round((completedInCourse / allLessons.length) * 100) : 0;

    const [enrollment] = await db
      .select()
      .from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, user.id), eq(schema.enrollments.courseId, lesson.courseId)));

    if (enrollment) {
      await db
        .update(schema.enrollments)
        .set({ progress: percent, status: percent >= 100 ? "completed" : "active" })
        .where(eq(schema.enrollments.id, enrollment.id));

      if (percent >= 100) {
        const [existingCert] = await db
          .select()
          .from(schema.certificates)
          .where(and(eq(schema.certificates.userId, user.id), eq(schema.certificates.courseId, lesson.courseId)));
        if (!existingCert) {
          await db.insert(schema.certificates).values({
            userId: user.id,
            courseId: lesson.courseId,
            code: `S2W-${lesson.courseId}-${user.id.slice(0, 6)}-${Date.now().toString(36).toUpperCase()}`,
          });
        }
      }
    }

    return c.json({ ok: true, progress: percent, xpEarned: lesson.xpReward }, 200);
  })
  .get("/me/enrollments", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const rows = await db.select().from(schema.enrollments).where(eq(schema.enrollments.userId, user.id));
    return c.json({ enrollments: rows }, 200);
  })
  .get("/me/certificates", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const rows = await db.select().from(schema.certificates).where(eq(schema.certificates.userId, user.id));
    return c.json({ certificates: rows }, 200);
  });
