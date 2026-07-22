import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ClipboardList } from "lucide-react";

export default function Tests() {
  const { t, lang } = useLang();
  const tests = useQuery({
    queryKey: ["tests"],
    queryFn: async () => (await api.tests.$get()).json(),
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-8" style={{ fontFamily: "Poppins" }}>
          {t("nav_tests")}
        </h1>
        <div className="flex flex-col gap-3">
          {tests.data?.tests?.map((tst: any) => (
            <Link key={tst.id} href={`/tests/${tst.id}`} className="bg-white border rounded-xl p-4 flex items-center gap-3 hover:border-primary">
              <ClipboardList className="text-primary" size={22} />
              <div className="flex-1">
                <div className="font-medium">{lang === "ru" ? tst.titleRu : tst.titleKk}</div>
                <div className="text-xs text-muted-foreground">{t("passed")} ≥ {tst.passScore}%</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
