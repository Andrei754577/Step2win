import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { ProtectedRoute } from "../components/protected-route";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

function TestTakeInner() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<any>(null);

  const test = useQuery({
    queryKey: ["test", id],
    queryFn: async () => (await api.tests[":id"].$get({ param: { id } })).json(),
  });

  const submit = useMutation({
    mutationFn: async () => (await api.tests[":id"].submit.$post({ param: { id }, json: { answers } })).json(),
    onSuccess: (data) => setResult(data),
  });

  if (test.isLoading || !test.data) return <p className="p-10 text-center text-muted-foreground">{t("loading")}</p>;

  const questions = test.data.questions ?? [];

  function toggleAnswer(qid: number, value: string, multi: boolean) {
    setAnswers((prev) => {
      const current = new Set(prev[String(qid)] ?? []);
      if (multi) {
        current.has(value) ? current.delete(value) : current.add(value);
      } else {
        current.clear();
        current.add(value);
      }
      return { ...prev, [String(qid)]: [...current] };
    });
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {result.passed ? (
          <CheckCircle2 className="text-green-600 mx-auto mb-4" size={56} />
        ) : (
          <XCircle className="text-destructive mx-auto mb-4" size={56} />
        )}
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Poppins" }}>
          {t("test_result")}: {result.score}%
        </h1>
        <p className="text-muted-foreground mb-6">
          {result.correct}/{result.total} · {result.passed ? t("passed") : t("failed")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8" style={{ fontFamily: "Poppins" }}>
        {lang === "ru" ? test.data.test.titleRu : test.data.test.titleKk}
      </h1>
      <div className="flex flex-col gap-6">
        {questions.map((q: any, idx: number) => (
          <div key={q.id} className="bg-white border rounded-xl p-5">
            <div className="font-medium mb-3">
              {idx + 1}. {lang === "ru" ? q.textRu : q.textKk}
            </div>
            <div className="flex flex-col gap-2">
              {(q.options ?? []).map((opt: string) => {
                const checked = (answers[String(q.id)] ?? []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type={q.type === "multi" ? "checkbox" : "radio"}
                      name={`q${q.id}`}
                      checked={checked}
                      onChange={() => toggleAnswer(q.id, opt, q.type === "multi")}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-8" onClick={() => submit.mutate()} disabled={submit.isPending}>
        {submit.isPending ? t("loading") : t("submit_test")}
      </Button>
    </div>
  );
}

export default function TestTake() {
  return (
    <ProtectedRoute>
      <Layout>
        <TestTakeInner />
      </Layout>
    </ProtectedRoute>
  );
}
