import { createMiddleware } from "hono/factory";
import { auth } from "../auth";

type Env = { Variables: { user: any; session: any } };

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  if (!c.get("user")) return c.json({ message: "Unauthorized" }, 401);
  return next();
});

export const requireRole = (...roles: string[]) =>
  createMiddleware<Env>(async (c, next) => {
    const user = c.get("user") as any;
    if (!user) return c.json({ message: "Unauthorized" }, 401);
    if (!roles.includes(user.role ?? "student")) {
      return c.json({ message: "Forbidden" }, 403);
    }
    return next();
  });
