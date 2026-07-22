import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function Tests() {
  const { t, lang } = useLang();
  const router = useRouter();
  const tests = useQuery({ queryKey: ["tests"], queryFn: async () => (await api.tests.$get()).json() });

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={tests.data?.tests ?? []}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }: any) => (
          <Pressable style={styles.card} onPress={() => router.push(`/test/${item.id}`)}>
            <Ionicons name="clipboard" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{lang === "ru" ? item.titleRu : item.titleKk}</Text>
              <Text style={styles.sub}>{t("passed")} ≥ {item.passScore}%</Text>
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
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
