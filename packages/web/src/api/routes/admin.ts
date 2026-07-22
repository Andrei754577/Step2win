import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authMiddleware, requireAuth, requireRole } from "../middleware/auth";

export const admin = new Hono<{ Variables: { user: any; session: any } }>()
  .use("*", authMiddleware)
  .use("*", requireAuth, requireRole("admin"))
  .get("/users", async (c) => {
    const rows = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        role: schema.user.role,
        xp: schema.user.xp,
        grade: schema.user.grade,
        direction: schema.user.direction,
        createdAt: schema.user.createdAt,
      })
      .from(schema.user);
    return c.json({ users: rows }, 200);
  })
  .put("/users/:id/role", async (c) => {
    const id = c.req.param("id");
    const { role } = await c.req.json<{ role: string }>();
    const [row] = await db.update(schema.user).set({ role }).where(eq(schema.user.id, id)).returning();
    return c.json({ user: row }, 200);
  })
  .get("/stats", async (c) => {
    const users = await db.select().from(schema.user);
    const coursesRows = await db.select().from(schema.courses);
    const projectsRows = await db.select().from(schema.projects);
    const eventsRows = await db.select().from(schema.events);
    return c.json(
      {
        totalUsers: users.length,
        students: users.filter((u) => u.role === "student").length,
        totalCourses: coursesRows.length,
        totalProjects: projectsRows.length,
        totalEvents: eventsRows.length,
      },
      200
    );
  });
