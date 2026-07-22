import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { ProtectedRoute } from "../components/protected-route";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Link } from "wouter";
import { Plus, X } from "lucide-react";

const stages = ["idea", "hypothesis", "mvp", "demoday"] as const;
const stageColor: Record<string, string> = {
  idea: "bg-slate-100 text-slate-700",
  hypothesis: "bg-blue-100 text-blue-700",
  mvp: "bg-amber-100 text-amber-700",
  demoday: "bg-green-100 text-green-700",
};

function ProjectsInner() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mentorName, setMentorName] = useState("");

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.projects.$get()).json(),
  });

  const create = useMutation({
    mutationFn: async () =>
      (await api.projects.$post({ json: { title, description, stage: "idea", direction: "programming", mentorName: mentorName || null } })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setMentorName("");
    },
  });

  const list = projects.data?.projects ?? [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Poppins" }}>
            {t("projects_title")}
          </h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {t("new_project")}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white border rounded-xl p-5 mb-8 flex flex-col gap-3">
            <input
              placeholder={lang === "ru" ? "Название проекта" : "Жоба атауы"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <textarea
              placeholder={lang === "ru" ? "Описание" : "Сипаттама"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              rows={3}
            />
            <input
              placeholder={lang === "ru" ? "Наставник (имя, необязательно)" : "Тәлімгер (аты, міндетті емес)"}
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <Button onClick={() => create.mutate()} disabled={!title || create.isPending} className="w-fit">
              {create.isPending ? t("loading") : t("create")}
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4">
          {stages.map((stage) => (
            <div key={stage}>
              <div className={`text-xs font-semibold uppercase px-3 py-1 rounded-full inline-block mb-3 ${stageColor[stage]}`}>
                {t(stage as any)}
              </div>
              <div className="flex flex-col gap-3">
                {list
                  .filter((p: any) => p.stage === stage)
                  .map((p: any) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="bg-white border rounded-xl p-4 hover:border-primary block">
                      <div className="font-medium text-sm mb-1">{p.title}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                      {p.mentorName && (
                        <span className="text-xs text-primary font-medium">
                          {lang === "ru" ? "Наставник: " : "Тәлімгер: "}
                          {p.mentorName}
                        </span>
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default function Projects() {
  return (
    <ProtectedRoute>
      <ProjectsInner />
    </ProtectedRoute>
  );
}
