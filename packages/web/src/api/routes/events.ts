import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { authMiddleware, requireAuth, requireRole } from "../middleware/auth";

export const events = new Hono<{ Variables: { user: any; session: any } }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const rows = await db.select().from(schema.events).orderBy(schema.events.date);
    return c.json({ events: rows }, 200);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const [event] = await db.select().from(schema.events).where(eq(schema.events.id, id));
    if (!event) return c.json({ message: "Not found" }, 404);
    const regs = await db.select().from(schema.eventRegistrations).where(eq(schema.eventRegistrations.eventId, id));
    return c.json({ event, registeredCount: regs.length }, 200);
  })
  .post("/", requireAuth, requireRole("admin"), async (c) => {
    const body = await c.req.json();
    const [row] = await db.insert(schema.events).values(body).returning();
    return c.json({ event: row }, 201);
  })
  .delete("/:id", requireAuth, requireRole("admin"), async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.eventRegistrations).where(eq(schema.eventRegistrations.eventId, id));
    await db.delete(schema.events).where(eq(schema.events.id, id));
    return c.json({ ok: true }, 200);
  })
  .post("/:id/register", requireAuth, async (c) => {
    const eventId = Number(c.req.param("id"));
    const user = c.get("user") as any;
    const [existing] = await db
      .select()
      .from(schema.eventRegistrations)
      .where(and(eq(schema.eventRegistrations.eventId, eventId), eq(schema.eventRegistrations.userId, user.id)));
    if (existing) return c.json({ registration: existing }, 200);
    const [row] = await db.insert(schema.eventRegistrations).values({ eventId, userId: user.id }).returning();
    return c.json({ registration: row }, 201);
  })
  .get("/me/registrations", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const rows = await db.select().from(schema.eventRegistrations).where(eq(schema.eventRegistrations.userId, user.id));
    return c.json({ registrations: rows }, 200);
  });
