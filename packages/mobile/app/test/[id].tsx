import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Button } from "../../components/ui";
import { colors } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TestTake() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useLang();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<any>(null);

  const test = useQuery({
    queryKey: ["test", id],
    queryFn: async () => (await api.tests[":id"].$get({ param: { id } })).json() as Promise<any>,
  });

  const submit = useMutation({
    mutationFn: async () => (await api.tests[":id"].submit.$post({ param: { id }, json: { answers } } as any)).json(),
    onSuccess: setResult,
  });

  function toggle(qid: number, value: string, multi: boolean) {
    setAnswers((prev) => {
      const cur = new Set(prev[String(qid)] ?? []);
      if (multi) cur.has(value) ? cur.delete(value) : cur.add(value);
      else {
        cur.clear();
        cur.add(value);
      }
      return { ...prev, [String(qid)]: [...cur] };
    });
  }

  if (test.isLoading || !test.data) return <Text style={{ padding: 24 }}>{t("loading")}</Text>;

  if (result) {
    return (
      <ScrollView contentContainerStyle={styles.resultScreen}>
        <Ionicons name={result.passed ? "checkmark-circle" : "close-circle"} size={64} color={result.passed ? colors.success : colors.danger} />
        <Text style={styles.resultTitle}>{t("test_result")}: {result.score}%</Text>
        <Text style={styles.sub}>{result.correct}/{result.total} · {result.passed ? t("passed") : t("failed")}</Text>
      </ScrollView>
    );
  }

  const questions = test.data.questions ?? [];

  return (
    <>
      <Stack.Screen options={{ title: lang === "ru" ? test.data.test.titleRu : test.data.test.titleKk }} />
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
        {questions.map((q: any, idx: number) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.qText}>{idx + 1}. {lang === "ru" ? q.textRu : q.textKk}</Text>
            {(q.options ?? []).map((opt: string) => {
              const checked = (answers[String(q.id)] ?? []).includes(opt);
              return (
                <Pressable key={opt} style={styles.option} onPress={() => toggle(q.id, opt, q.type === "multi")}>
                  <Ionicons name={checked ? "radio-button-on" : "radio-button-off"} size={18} color={checked ? colors.primary : colors.textMuted} />
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        <Button title={t("submit_test")} onPress={() => submit.mutate()} loading={submit.isPending} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10 },
  qText: { fontSize: 14, fontWeight: "600", color: colors.text },
  option: { flexDirection: "row", alignItems: "center", gap: 8 },
  optionText: { fontSize: 14, color: colors.text },
  resultScreen: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  resultTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted },
});
