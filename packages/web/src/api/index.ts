import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { authMiddleware, requireAuth } from "./middleware/auth";
import { courses } from "./routes/courses";
import { tests } from "./routes/tests";
import { projects } from "./routes/projects";
import { events } from "./routes/events";
import { admin } from "./routes/admin";

const app = new Hono<{ Variables: { user: any; session: any } }>()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .get("/ping", (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get("/health", (c) => c.json({ status: "ok" }, 200))
  .use("*", authMiddleware)
  .get("/me", requireAuth, async (c) => {
    const user = c.get("user") as any;
    return c.json({ user }, 200);
  })
  .route("/courses", courses)
  .route("/tests", tests)
  .route("/projects", projects)
  .route("/events", events)
  .route("/admin", admin);

export type AppType = typeof app;
export default app;
