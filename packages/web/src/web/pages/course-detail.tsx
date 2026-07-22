import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";
import { Button } from "../components/ui/button";
import { CheckCircle2, Circle, Lock } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();
  const [openLesson, setOpenLesson] = useState<number | null>(null);

  const course = useQuery({
    queryKey: ["course", id],
    queryFn: async () => (await api.courses[":id"].$get({ param: { id } })).json(),
  });

  const enrollment = useQuery({
    queryKey: ["enrollment", id],
    queryFn: async () => (await api.courses[":id"].enrollment.$get({ param: { id } })).json(),
    enabled: !!session,
  });

  const enroll = useMutation({
    mutationFn: async () => (await api.courses[":id"].enroll.$post({ param: { id } })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollment", id] });
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });

  const complete = useMutation({
    mutationFn: async (lessonId: number) =>
      (await api.courses.lessons[":lessonId"].complete.$post({ param: { lessonId: String(lessonId) } })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollment", id] });
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });

  if (course.isLoading || !course.data) return <Layout><p className="p-10 text-center text-muted-foreground">{t("loading")}</p></Layout>;

  const c = course.data.course;
  const lessons = course.data.lessons ?? [];
  const completedIds = new Set(enrollment.data?.completedLessonIds ?? []);
  const isEnrolled = !!enrollment.data?.enrollment;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <span className="text-xs font-medium text-primary uppercase">{c.direction}</span>
        <h1 className="text-2xl font-semibold mt-1 mb-3" style={{ fontFamily: "Poppins" }}>
          {lang === "ru" ? c.titleRu : c.titleKk}
        </h1>
        <p className="text-muted-foreground mb-6">{lang === "ru" ? c.descriptionRu : c.descriptionKk}</p>

        {!isEnrolled && session && (
          <Button onClick={() => enroll.mutate()} disabled={enroll.isPending} className="mb-8">
            {enroll.isPending ? t("loading") : t("enroll")}
          </Button>
        )}
        {!session && <p className="mb-8 text-sm text-muted-foreground">{t("nav_signin")} / {t("nav_signup")} — {t("enroll")}</p>}

        {isEnrolled && (
          <div className="mb-6">
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${enrollment.data?.enrollment?.progress ?? 0}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("course_progress")}: {enrollment.data?.enrollment?.progress ?? 0}%
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-3">{t("lessons")}</h2>
        <div className="flex flex-col gap-2">
          {lessons.map((l: any) => {
            const done = completedIds.has(l.id);
            const open = openLesson === l.id;
            return (
              <div key={l.id} className="bg-white border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setOpenLesson(open ? null : l.id)}
                  disabled={!isEnrolled}
                >
                  {done ? <CheckCircle2 className="text-green-600 shrink-0" size={20} /> : isEnrolled ? <Circle className="text-muted-foreground shrink-0" size={20} /> : <Lock className="text-muted-foreground shrink-0" size={18} />}
                  <span className="flex-1 font-medium">{lang === "ru" ? l.titleRu : l.titleKk}</span>
                  <span className="text-xs text-accent font-medium">+{l.xpReward} XP</span>
                </button>
                {open && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">
                      {lang === "ru" ? l.contentRu : l.contentKk}
                    </p>
                    {!done && (
                      <Button size="sm" onClick={() => complete.mutate(l.id)} disabled={complete.isPending}>
                        {complete.isPending ? t("loading") : t("complete_lesson")}
                      </Button>
                    )}
                    {done && <span className="text-sm text-green-600 font-medium">{t("lesson_completed")}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
