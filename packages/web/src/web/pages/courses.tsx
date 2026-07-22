import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export default function Courses() {
  const { t, lang } = useLang();
  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.courses.$get()).json(),
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-8" style={{ fontFamily: "Poppins" }}>
          {t("nav_courses")}
        </h1>
        {courses.isLoading && <p className="text-muted-foreground">{t("loading")}</p>}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.data?.courses?.map((c: any) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-24 flex items-center justify-center" style={{ backgroundColor: c.coverColor + "22" }}>
                <BookOpen size={32} style={{ color: c.coverColor }} />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-primary uppercase">{c.direction}</span>
                <div className="font-semibold mt-1">{lang === "ru" ? c.titleRu : c.titleKk}</div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {lang === "ru" ? c.descriptionRu : c.descriptionKk}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
