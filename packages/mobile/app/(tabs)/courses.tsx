import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function Courses() {
  const { t, lang } = useLang();
  const router = useRouter();
  const courses = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (await api.courses.$get()).json(),
  });

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={courses.data?.courses ?? []}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }: any) => (
          <Pressable style={styles.card} onPress={() => router.push(`/course/${item.id}`)}>
            <View style={[styles.icon, { backgroundColor: item.coverColor + "22" }]}>
              <Ionicons name="book" size={22} color={item.coverColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.direction}>{item.direction}</Text>
              <Text style={styles.title}>{lang === "ru" ? item.titleRu : item.titleKk}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  direction: { fontSize: 11, fontWeight: "700", color: colors.primary, textTransform: "uppercase" },
  title: { fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 2 },
});
