import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Button, Input, Badge } from "../../components/ui";
import { colors } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

const stageColors: Record<string, { c: string; bg: string }> = {
  idea: { c: "#475569", bg: "#F1F5F9" },
  hypothesis: { c: "#1D4ED8", bg: "#DBEAFE" },
  mvp: { c: "#B45309", bg: "#FEF3C7" },
  demoday: { c: "#15803D", bg: "#DCFCE7" },
};

export default function Projects() {
  const { t, lang } = useLang();
  const router = useRouter();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const projects = useQuery({ queryKey: ["projects"], queryFn: async () => (await api.projects.$get()).json() });
  const create = useMutation({
    mutationFn: async () =>
      (await api.projects.$post({ json: { title, description, stage: "idea", direction: "programming" } })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setTitle("");
      setDescription("");
    },
  });

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={projects.data?.projects ?? []}
        keyExtractor={(item: any) => String(item.id)}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Button title={showForm ? t("cancel") : t("new_project")} onPress={() => setShowForm(!showForm)} variant={showForm ? "outline" : "primary"} />
            {showForm && (
              <View style={styles.card}>
                <Input placeholder={lang === "ru" ? "Название" : "Атауы"} value={title} onChangeText={setTitle} />
                <Input placeholder={lang === "ru" ? "Описание" : "Сипаттама"} value={description} onChangeText={setDescription} multiline style={{ marginTop: 10 }} />
                <Button title={t("create")} onPress={() => create.mutate()} loading={create.isPending} disabled={!title} style={{ marginTop: 10 }} />
              </View>
            )}
          </View>
        }
        renderItem={({ item }: any) => {
          const sc = stageColors[item.stage] ?? stageColors.idea;
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/project/${item.id}`)}>
              <Badge text={t(item.stage)} color={sc.c} bg={sc.bg} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub} numberOfLines={2}>{item.description}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted },
});
