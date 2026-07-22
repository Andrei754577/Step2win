import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { ProtectedRoute } from "../components/protected-route";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Trash2 } from "lucide-react";

const directions = ["programming", "web", "mobile", "ai", "robotics", "cybersecurity", "design", "startups"];
const tabs = ["courses", "tests", "events", "users"] as const;

function AdminInner() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [tab, setTab] = useState<typeof tabs[number]>("courses");

  // ---- Courses ----
  const courses = useQuery({ queryKey: ["courses"], queryFn: async () => (await api.courses.$get()).json() });
  const [courseForm, setCourseForm] = useState({ titleRu: "", titleKk: "", descriptionRu: "", descriptionKk: "", direction: "programming", coverColor: "#2563EB" });
  const createCourse = useMutation({
    mutationFn: async () => (await api.courses.$post({ json: courseForm })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
  const deleteCourse = useMutation({
    mutationFn: async (id: number) => (await api.courses[":id"].$delete({ param: { id: String(id) } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  // ---- Tests ----
  const tests = useQuery({ queryKey: ["tests"], queryFn: async () => (await api.tests.$get()).json() });
  const [testForm, setTestForm] = useState({ titleRu: "", titleKk: "", passScore: 60 });
  const createTest = useMutation({
    mutationFn: async () => (await api.tests.$post({ json: testForm })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
  const deleteTest = useMutation({
    mutationFn: async (id: number) => (await api.tests[":id"].$delete({ param: { id: String(id) } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });

  // ---- Events ----
  const events = useQuery({ queryKey: ["events"], queryFn: async () => (await api.events.$get()).json() });
  const [eventForm, setEventForm] = useState({ titleRu: "", titleKk: "", descriptionRu: "", descriptionKk: "", type: "hackathon", date: "", location: "", capacity: 100 });
  const createEvent = useMutation({
    mutationFn: async () => (await api.events.$post({ json: { ...eventForm, date: new Date(eventForm.date).getTime() } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
  const deleteEvent = useMutation({
    mutationFn: async (id: number) => (await api.events[":id"].$delete({ param: { id: String(id) } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  // ---- Users ----
  const users = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.admin.users.$get()).json() });
  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) =>
      (await api.admin.users[":id"].role.$put({ param: { id }, json: { role } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: "Poppins" }}>
          {t("admin_title")}
        </h1>
        <div className="flex gap-4 border-b mb-8">
          {tabs.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`pb-3 text-sm font-medium ${tab === tb ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              {t(`admin_${tb}` as any)}
            </button>
          ))}
        </div>

        {tab === "courses" && (
          <div>
            <div className="bg-white border rounded-xl p-5 mb-6 grid sm:grid-cols-2 gap-3">
              <input placeholder="Title RU" className="border rounded-md px-3 py-2 text-sm" value={courseForm.titleRu} onChange={(e) => setCourseForm({ ...courseForm, titleRu: e.target.value })} />
              <input placeholder="Title KK" className="border rounded-md px-3 py-2 text-sm" value={courseForm.titleKk} onChange={(e) => setCourseForm({ ...courseForm, titleKk: e.target.value })} />
              <textarea placeholder="Description RU" className="border rounded-md px-3 py-2 text-sm" value={courseForm.descriptionRu} onChange={(e) => setCourseForm({ ...courseForm, descriptionRu: e.target.value })} />
              <textarea placeholder="Description KK" className="border rounded-md px-3 py-2 text-sm" value={courseForm.descriptionKk} onChange={(e) => setCourseForm({ ...courseForm, descriptionKk: e.target.value })} />
              <select className="border rounded-md px-3 py-2 text-sm" value={courseForm.direction} onChange={(e) => setCourseForm({ ...courseForm, direction: e.target.value })}>
                {directions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="color" className="border rounded-md h-10" value={courseForm.coverColor} onChange={(e) => setCourseForm({ ...courseForm, coverColor: e.target.value })} />
              <Button className="w-fit" onClick={() => createCourse.mutate()} disabled={!courseForm.titleRu || createCourse.isPending}>{t("create")}</Button>
            </div>
            <div className="flex flex-col gap-2">
              {courses.data?.courses?.map((c: any) => (
                <div key={c.id} className="bg-white border rounded-xl p-3 flex items-center justify-between">
                  <span>{c.titleRu} <span className="text-xs text-muted-foreground">({c.direction})</span></span>
                  <button onClick={() => deleteCourse.mutate(c.id)}><Trash2 size={16} className="text-destructive" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "tests" && (
          <div>
            <div className="bg-white border rounded-xl p-5 mb-6 grid sm:grid-cols-2 gap-3">
              <input placeholder="Title RU" className="border rounded-md px-3 py-2 text-sm" value={testForm.titleRu} onChange={(e) => setTestForm({ ...testForm, titleRu: e.target.value })} />
              <input placeholder="Title KK" className="border rounded-md px-3 py-2 text-sm" value={testForm.titleKk} onChange={(e) => setTestForm({ ...testForm, titleKk: e.target.value })} />
              <input type="number" placeholder="Pass score %" className="border rounded-md px-3 py-2 text-sm" value={testForm.passScore} onChange={(e) => setTestForm({ ...testForm, passScore: Number(e.target.value) })} />
              <Button className="w-fit" onClick={() => createTest.mutate()} disabled={!testForm.titleRu || createTest.isPending}>{t("create")}</Button>
            </div>
            <div className="flex flex-col gap-2">
              {tests.data?.tests?.map((tst: any) => (
                <div key={tst.id} className="bg-white border rounded-xl p-3 flex items-center justify-between">
                  <span>{tst.titleRu}</span>
                  <button onClick={() => deleteTest.mutate(tst.id)}><Trash2 size={16} className="text-destructive" /></button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Вопросы к тестам добавляются через API (POST /api/tests/:id/questions) — расширенный UI можно добавить позже.</p>
          </div>
        )}

        {tab === "events" && (
          <div>
            <div className="bg-white border rounded-xl p-5 mb-6 grid sm:grid-cols-2 gap-3">
              <input placeholder="Title RU" className="border rounded-md px-3 py-2 text-sm" value={eventForm.titleRu} onChange={(e) => setEventForm({ ...eventForm, titleRu: e.target.value })} />
              <input placeholder="Title KK" className="border rounded-md px-3 py-2 text-sm" value={eventForm.titleKk} onChange={(e) => setEventForm({ ...eventForm, titleKk: e.target.value })} />
              <textarea placeholder="Description RU" className="border rounded-md px-3 py-2 text-sm" value={eventForm.descriptionRu} onChange={(e) => setEventForm({ ...eventForm, descriptionRu: e.target.value })} />
              <textarea placeholder="Description KK" className="border rounded-md px-3 py-2 text-sm" value={eventForm.descriptionKk} onChange={(e) => setEventForm({ ...eventForm, descriptionKk: e.target.value })} />
              <select className="border rounded-md px-3 py-2 text-sm" value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}>
                <option value="hackathon">hackathon</option>
                <option value="forum">forum</option>
                <option value="olympiad">olympiad</option>
              </select>
              <input type="date" className="border rounded-md px-3 py-2 text-sm" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
              <input placeholder="Location" className="border rounded-md px-3 py-2 text-sm" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
              <input type="number" placeholder="Capacity" className="border rounded-md px-3 py-2 text-sm" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })} />
              <Button className="w-fit" onClick={() => createEvent.mutate()} disabled={!eventForm.titleRu || !eventForm.date || createEvent.isPending}>{t("create")}</Button>
            </div>
            <div className="flex flex-col gap-2">
              {events.data?.events?.map((e: any) => (
                <div key={e.id} className="bg-white border rounded-xl p-3 flex items-center justify-between">
                  <span>{e.titleRu} <span className="text-xs text-muted-foreground">({new Date(e.date).toLocaleDateString()})</span></span>
                  <button onClick={() => deleteEvent.mutate(e.id)}><Trash2 size={16} className="text-destructive" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="flex flex-col gap-2">
            {users.data?.users?.map((u: any) => (
              <div key={u.id} className="bg-white border rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email} · XP {u.xp}</div>
                </div>
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={u.role}
                  onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                >
                  <option value="student">{t("student")}</option>
                  <option value="admin">{t("admin")}</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute role={["admin"]}>
      <AdminInner />
    </ProtectedRoute>
  );
}
