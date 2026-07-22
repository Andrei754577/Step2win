import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authMiddleware, requireAuth } from "../middleware/auth";

export const projects = new Hono<{ Variables: { user: any; session: any } }>()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const rows =
      user.role === "admin"
        ? await db.select().from(schema.projects)
        : await db.select().from(schema.projects).where(eq(schema.projects.ownerId, user.id));
    return c.json({ projects: rows }, 200);
  })
  .get("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    if (!project) return c.json({ message: "Not found" }, 404);
    const updates = await db.select().from(schema.projectUpdates).where(eq(schema.projectUpdates.projectId, id));
    return c.json({ project, updates }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const body = await c.req.json();
    const [row] = await db.insert(schema.projects).values({ ...body, ownerId: user.id }).returning();
    return c.json({ project: row }, 201);
  })
  .put("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const [row] = await db.update(schema.projects).set(body).where(eq(schema.projects.id, id)).returning();
    return c.json({ project: row }, 200);
  })
  .delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.projectUpdates).where(eq(schema.projectUpdates.projectId, id));
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
    return c.json({ ok: true }, 200);
  })
  .post("/:id/updates", requireAuth, async (c) => {
    const projectId = Number(c.req.param("id"));
    const user = c.get("user") as any;
    const body = await c.req.json<{ message: string }>();
    const [row] = await db
      .insert(schema.projectUpdates)
      .values({ projectId, authorId: user.id, message: body.message })
      .returning();
    return c.json({ update: row }, 201);
  });
