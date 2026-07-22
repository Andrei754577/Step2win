import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { ProtectedRoute } from "../components/protected-route";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";
import { Button } from "../components/ui/button";

const stages = ["idea", "hypothesis", "mvp", "demoday"] as const;

function ProjectDetailInner() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [editingMentor, setEditingMentor] = useState(false);

  const project = useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await api.projects[":id"].$get({ param: { id } })).json(),
  });

  const setStage = useMutation({
    mutationFn: async (stage: string) => (await api.projects[":id"].$put({ param: { id }, json: { stage } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", id] }),
  });

  const saveMentor = useMutation({
    mutationFn: async () => (await api.projects[":id"].$put({ param: { id }, json: { mentorName } })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      setEditingMentor(false);
    },
  });

  const addUpdate = useMutation({
    mutationFn: async () => (await api.projects[":id"].updates.$post({ param: { id }, json: { message } })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      setMessage("");
    },
  });

  if (project.isLoading || !project.data) return <p className="p-10 text-center text-muted-foreground">{t("loading")}</p>;
  const p = project.data.project;
  const canManage = user?.id === p.ownerId || user?.role === "admin";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Poppins" }}>
        {p.title}
      </h1>
      <p className="text-muted-foreground mb-4">{p.description}</p>

      <div className="mb-6">
        {!editingMentor ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{lang === "ru" ? "Наставник:" : "Тәлімгер:"}</span>
            <span className="font-medium">{p.mentorName || "—"}</span>
            {canManage && (
              <button
                className="text-primary text-xs underline"
                onClick={() => {
                  setMentorName(p.mentorName ?? "");
                  setEditingMentor(true);
                }}
              >
                {lang === "ru" ? "изменить" : "өзгерту"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={mentorName} onChange={(e) => setMentorName(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm" />
            <Button size="sm" onClick={() => saveMentor.mutate()}>{t("save")}</Button>
            <Button size="sm" variant="outline" onClick={() => setEditingMentor(false)}>{t("cancel")}</Button>
          </div>
        )}
      </div>

      {canManage && (
        <div className="flex gap-2 mb-8">
          {stages.map((s) => (
            <Button key={s} size="sm" variant={p.stage === s ? "default" : "outline"} onClick={() => setStage.mutate(s)}>
              {t(s as any)}
            </Button>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">
        {t("project_stage")}: {t(p.stage as any)}
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        {(project.data.updates ?? []).map((u: any) => (
          <div key={u.id} className="bg-white border rounded-xl p-4 text-sm">
            {u.message}
            <div className="text-xs text-muted-foreground mt-1">{new Date(u.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {canManage && (
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 text-sm"
            placeholder="..."
          />
          <Button onClick={() => addUpdate.mutate()} disabled={!message || addUpdate.isPending}>
            {t("save")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProjectDetailInner />
      </Layout>
    </ProtectedRoute>
  );
}
