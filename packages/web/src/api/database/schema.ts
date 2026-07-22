import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";

export * from "./auth-schema";

const now = () => sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

// ---------- Courses / LMS ----------

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleRu: text("title_ru").notNull(),
  titleKk: text("title_kk").notNull(),
  descriptionRu: text("description_ru").notNull().default(""),
  descriptionKk: text("description_kk").notNull().default(""),
  direction: text("direction").notNull().default("programming"), // web, mobile, ai, robotics, cybersecurity, design, startups, programming
  coverColor: text("cover_color").notNull().default("#2563EB"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id),
  titleRu: text("title_ru").notNull(),
  titleKk: text("title_kk").notNull(),
  contentRu: text("content_ru").notNull().default(""),
  contentKk: text("content_kk").notNull().default(""),
  order: integer("order").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(10),
});

export const enrollments = sqliteTable("enrollments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: integer("progress").notNull().default(0), // percent 0-100
  status: text("status").notNull().default("active"), // active, completed
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
});

export const certificates = sqliteTable("certificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  code: text("code").notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

// ---------- Testing ----------

export const tests = sqliteTable("tests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").references(() => courses.id),
  titleRu: text("title_ru").notNull(),
  titleKk: text("title_kk").notNull(),
  passScore: integer("pass_score").notNull().default(60), // percent
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testId: integer("test_id").notNull().references(() => tests.id),
  textRu: text("text_ru").notNull(),
  textKk: text("text_kk").notNull(),
  type: text("type").notNull().default("single"), // single, multi, text
  options: text("options", { mode: "json" }).$type<string[]>().default([]),
  correctAnswer: text("correct_answer", { mode: "json" }).$type<string[]>().default([]),
  order: integer("order").notNull().default(0),
});

export const testAttempts = sqliteTable("test_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id),
  testId: integer("test_id").notNull().references(() => tests.id),
  score: integer("score").notNull().default(0),
  passed: integer("passed", { mode: "boolean" }).notNull().default(false),
  answers: text("answers", { mode: "json" }).$type<Record<string, string[]>>().default({}),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

// ---------- Project Office ----------

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  stage: text("stage").notNull().default("idea"), // idea, hypothesis, mvp, demoday
  direction: text("direction").notNull().default("programming"),
  ownerId: text("owner_id").notNull().references(() => user.id),
  mentorName: text("mentor_name"),
  mentorContact: text("mentor_contact"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

export const projectUpdates = sqliteTable("project_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  authorId: text("author_id").notNull().references(() => user.id),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

// ---------- Events ----------

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleRu: text("title_ru").notNull(),
  titleKk: text("title_kk").notNull(),
  descriptionRu: text("description_ru").notNull().default(""),
  descriptionKk: text("description_kk").notNull().default(""),
  type: text("type").notNull().default("hackathon"), // hackathon, forum, olympiad
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  location: text("location").notNull().default(""),
  capacity: integer("capacity").notNull().default(100),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});

export const eventRegistrations = sqliteTable("event_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: text("user_id").notNull().references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now()),
});
