import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authMiddleware, requireAuth, requireRole } from "../middleware/auth";

export const tests = new Hono<{ Variables: { user: any; session: any } }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const rows = await db.select().from(schema.tests);
    return c.json({ tests: rows }, 200);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const [test] = await db.select().from(schema.tests).where(eq(schema.tests.id, id));
    if (!test) return c.json({ message: "Not found" }, 404);
    const qs = await db.select().from(schema.questions).where(eq(schema.questions.testId, id)).orderBy(schema.questions.order);
    // hide correct answers from students
    const safeQuestions = qs.map(({ correctAnswer, ...rest }) => rest);
    return c.json({ test, questions: safeQuestions }, 200);
  })
  .post("/", requireAuth, requireRole("admin"), async (c) => {
    const body = await c.req.json();
    const [row] = await db.insert(schema.tests).values(body).returning();
    return c.json({ test: row }, 201);
  })
  .delete("/:id", requireAuth, requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.questions).where(eq(schema.questions.testId, id));
    await db.delete(schema.tests).where(eq(schema.tests.id, id));
    return c.json({ ok: true }, 200);
  })
  .post("/:id/questions", requireAuth, requireRole("admin"), async (c) => {
    const testId = Number(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.insert(schema.questions).values({ ...body, testId }).returning();
    return c.json({ question: row }, 201);
  })
  .delete("/questions/:qid", requireAuth, requireRole("admin"), async (c) => {
    const qid = Number(c.req.param("qid"));
    await db.delete(schema.questions).where(eq(schema.questions.id, qid));
    return c.json({ ok: true }, 200);
  })
  .post("/:id/submit", requireAuth, async (c) => {
    const testId = Number(c.req.param("id"));
    const user = c.get("user") as any;
    const body = await c.req.json<{ answers: Record<string, string[]> }>();

    const qs = await db.select().from(schema.questions).where(eq(schema.questions.testId, testId));
    const [test] = await db.select().from(schema.tests).where(eq(schema.tests.id, testId));
    if (!test) return c.json({ message: "Not found" }, 404);

    let correct = 0;
    for (const q of qs) {
      const given = new Set((body.answers[String(q.id)] ?? []).map((a) => a.trim().toLowerCase()));
      const expected = new Set((q.correctAnswer ?? []).map((a) => a.trim().toLowerCase()));
      if (given.size === expected.size && [...given].every((g) => expected.has(g))) correct++;
    }
    const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
    const passed = score >= test.passScore;

    const [attempt] = await db
      .insert(schema.testAttempts)
      .values({ userId: user.id, testId, score, passed, answers: body.answers })
      .returning();

    return c.json({ attempt, score, passed, correct, total: qs.length }, 201);
  })
  .get("/me/attempts", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const rows = await db.select().from(schema.testAttempts).where(eq(schema.testAttempts.userId, user.id));
    return c.json({ attempts: rows }, 200);
  });
