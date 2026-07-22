import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Button, Input } from "../../components/ui";
import { colors } from "../../lib/theme";

const stages = ["idea", "hypothesis", "mvp", "demoday"] as const;

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");

  const project = useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await api.projects[":id"].$get({ param: { id } })).json() as Promise<any>,
  });
  const setStage = useMutation({
    mutationFn: async (stage: string) => (await api.projects[":id"].$put({ param: { id }, json: { stage } } as any)).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", id] }),
  });
  const addUpdate = useMutation({
    mutationFn: async () => (await api.projects[":id"].updates.$post({ param: { id }, json: { message } } as any)).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      setMessage("");
    },
  });

  if (project.isLoading || !project.data) return <Text style={{ padding: 24 }}>{t("loading")}</Text>;
  const p = project.data.project;

  return (
    <>
      <Stack.Screen options={{ title: p.title }} />
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={styles.desc}>{p.description}</Text>
        {p.mentorName && <Text style={styles.mentor}>{t("stage")}: {p.mentorName}</Text>}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {stages.map((s) => (
            <Button key={s} title={t(s)} variant={p.stage === s ? "primary" : "outline"} onPress={() => setStage.mutate(s)} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />
          ))}
        </View>
        <Text style={styles.h2}>{t("stage")}: {t(p.stage)}</Text>
        {(project.data.updates ?? []).map((u: any) => (
          <View key={u.id} style={styles.card}>
            <Text style={styles.updateText}>{u.message}</Text>
            <Text style={styles.date}>{new Date(u.createdAt).toLocaleString()}</Text>
          </View>
        ))}
        <View style={{ gap: 8 }}>
          <Input value={message} onChangeText={setMessage} placeholder="..." />
          <Button title={t("save")} onPress={() => addUpdate.mutate()} loading={addUpdate.isPending} disabled={!message} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  desc: { fontSize: 14, color: colors.textMuted },
  mentor: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  h2: { fontSize: 16, fontWeight: "600", color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 4 },
  updateText: { fontSize: 14, color: colors.text },
  date: { fontSize: 11, color: colors.textMuted },
});
