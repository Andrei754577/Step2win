import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { Card, Badge } from "../../components/ui";
import { colors } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  const { t, lang } = useLang();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const enrollments = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => (await api.courses.me.enrollments.$get()).json(),
  });
  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.courses.$get()).json(),
  });
  const certs = useQuery({
    queryKey: ["my-certs"],
    queryFn: async () => (await api.courses.me.certificates.$get()).json(),
  });
  const events = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.events.$get()).json(),
  });

  const courseMap = new Map((courses.data?.courses ?? []).map((c: any) => [c.id, c]));
  const myEnrollments = enrollments.data?.enrollments ?? [];
  const upcoming = (events.data?.events ?? []).filter((e: any) => new Date(e.date).getTime() > Date.now()).slice(0, 3);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={styles.h1}>{t("welcome")}, {user?.name}</Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <Ionicons name="flame" color={colors.accent} size={22} />
          <Text style={styles.statNum}>{user?.xp ?? 0}</Text>
          <Text style={styles.statLabel}>{t("my_xp")}</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <Ionicons name="book" color={colors.primary} size={22} />
          <Text style={styles.statNum}>{myEnrollments.length}</Text>
          <Text style={styles.statLabel}>{t("my_courses")}</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <Ionicons name="ribbon" color={colors.success} size={22} />
          <Text style={styles.statNum}>{certs.data?.certificates?.length ?? 0}</Text>
          <Text style={styles.statLabel}>{t("my_certificates")}</Text>
        </Card>
      </View>

      <Text style={styles.h2}>{t("my_courses")}</Text>
      {myEnrollments.map((e: any) => {
        const c = courseMap.get(e.courseId);
        if (!c) return null;
        return (
          <Card key={e.id} style={{ gap: 8 }}>
            <Text style={styles.cardTitle}>{lang === "ru" ? c.titleRu : c.titleKk}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${e.progress}%` }]} />
            </View>
            <Text style={styles.statLabel}>{t("progress")}: {e.progress}%</Text>
          </Card>
        );
      })}

      <Text style={styles.h2}>{t("upcoming_events")}</Text>
      {upcoming.map((e: any) => (
        <Card key={e.id} style={{ gap: 4 }}>
          <Badge text={e.type} />
          <Text style={styles.cardTitle}>{lang === "ru" ? e.titleRu : e.titleKk}</Text>
          <Text style={styles.statLabel}>{new Date(e.date).toLocaleDateString()}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  h1: { fontSize: 22, fontWeight: "700", color: colors.text },
  h2: { fontSize: 17, fontWeight: "600", color: colors.text, marginTop: 8 },
  statNum: { fontSize: 20, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary },
});
