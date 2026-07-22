import { Layout } from "../components/layout";
import { ProtectedRoute } from "../components/protected-route";
import { useLang } from "../i18n";
import { authClient } from "../lib/auth";
import { api } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Award, Flame, CalendarDays, BookOpen } from "lucide-react";

function DashboardInner() {
  const { t, lang } = useLang();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const enrollments = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.courses.me.enrollments.$get()).json(),
  });
  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.courses.$get()).json(),
  });
  const certs = useQuery({
    queryKey: ["my-certs"],
    queryFn: async () => (await api.courses.me.certificates.$get()).json(),
  });
  const events = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.events.$get()).json(),
  });

  const courseMap = new Map((courses.data?.courses ?? []).map((c: any) => [c.id, c]));
  const myEnrollments = enrollments.data?.enrollments ?? [];
  const upcoming = (events.data?.events ?? []).filter((e: any) => new Date(e.date).getTime() > Date.now()).slice(0, 3);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "Poppins" }}>
          {t("dashboard_welcome")}, {user?.name}
        </h1>
        <p className="text-muted-foreground mb-8 capitalize">{t(user?.role ?? "student")}</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
            <Flame className="text-accent" size={28} />
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>
                {user?.xp ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">{t("my_xp")}</div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
            <BookOpen className="text-primary" size={28} />
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>
                {myEnrollments.length}
              </div>
              <div className="text-sm text-muted-foreground">{t("my_courses")}</div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
            <Award className="text-green-600" size={28} />
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>
                {certs.data?.certificates?.length ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">{t("my_certificates")}</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">{t("my_courses")}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {myEnrollments.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {lang === "ru" ? "Вы пока не записаны на курсы." : "Сіз әлі курсқа тіркелмегенсіз."}{" "}
              <Link href="/courses" className="text-primary font-medium">
                {t("nav_courses")}
              </Link>
            </p>
          )}
          {myEnrollments.map((e: any) => {
            const c = courseMap.get(e.courseId);
            if (!c) return null;
            return (
              <Link key={e.id} href={`/courses/${c.id}`} className="bg-white border rounded-xl p-5 hover:border-primary transition-colors">
                <div className="w-full h-2 rounded-full bg-secondary mb-3 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${e.progress}%` }} />
                </div>
                <div className="font-medium mb-1">{lang === "ru" ? c.titleRu : c.titleKk}</div>
                <div className="text-xs text-muted-foreground">
                  {t("course_progress")}: {e.progress}%
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarDays size={18} /> {t("upcoming_events")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
          {upcoming.map((e: any) => (
            <Link key={e.id} href="/events" className="bg-white border rounded-xl p-4 hover:border-primary">
              <div className="font-medium">{lang === "ru" ? e.titleRu : e.titleKk}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(e.date).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}
