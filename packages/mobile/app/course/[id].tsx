import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { Button } from "../../components/ui";
import { colors } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useLang();
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState<number | null>(null);

  const course = useQuery({
    queryKey: ["course", id],
    queryFn: async () => (await api.courses[":id"].$get({ param: { id } })).json() as Promise<any>,
  });
  const enrollment = useQuery({
    queryKey: ["enrollment", id],
    queryFn: async () => (await api.courses[":id"].enrollment.$get({ param: { id } })).json() as Promise<any>,
    enabled: !!session,
  });
  const enroll = useMutation({
    mutationFn: async () => (await api.courses[":id"].enroll.$post({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollment", id] }),
  });
  const complete = useMutation({
    mutationFn: async (lessonId: number) =>
      (await api.courses.lessons[":lessonId"].complete.$post({ param: { lessonId: String(lessonId) } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollment", id] }),
  });

  if (course.isLoading || !course.data) return <Text style={{ padding: 24 }}>{t("loading")}</Text>;
  const c = course.data.course;
  const lessons = course.data.lessons ?? [];
  const completedIds = new Set(enrollment.data?.completedLessonIds ?? []);
  const isEnrolled = !!enrollment.data?.enrollment;

  return (
    <>
      <Stack.Screen options={{ title: lang === "ru" ? c.titleRu : c.titleKk }} />
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={styles.title}>{lang === "ru" ? c.titleRu : c.titleKk}</Text>
        <Text style={styles.desc}>{lang === "ru" ? c.descriptionRu : c.descriptionKk}</Text>
        {!isEnrolled && <Button title={t("enroll")} onPress={() => enroll.mutate()} loading={enroll.isPending} />}
        {isEnrolled && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${enrollment.data?.enrollment?.progress ?? 0}%` }]} />
          </View>
        )}
        <Text style={styles.h2}>{t("lessons")}</Text>
        {lessons.map((l: any) => {
          const done = completedIds.has(l.id);
          const isOpen = open === l.id;
          return (
            <View key={l.id} style={styles.lessonCard}>
              <Pressable style={styles.lessonRow} onPress={() => isEnrolled && setOpen(isOpen ? null : l.id)}>
                <Ionicons name={done ? "checkmark-circle" : isEnrolled ? "ellipse-outline" : "lock-closed"} size={20} color={done ? colors.success : colors.textMuted} />
                <Text style={styles.lessonTitle}>{lang === "ru" ? l.titleRu : l.titleKk}</Text>
                <Text style={styles.xp}>+{l.xpReward} XP</Text>
              </Pressable>
              {isOpen && (
                <View style={{ padding: 12, paddingTop: 0, gap: 10 }}>
                  <Text style={styles.desc}>{lang === "ru" ? l.contentRu : l.contentKk}</Text>
                  {!done && <Button title={t("complete_lesson")} onPress={() => complete.mutate(l.id)} loading={complete.isPending} />}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  desc: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  h2: { fontSize: 16, fontWeight: "600", color: colors.text, marginTop: 8 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  lessonCard: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  lessonTitle: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.text },
  xp: { fontSize: 11, fontWeight: "700", color: colors.accent },
});
