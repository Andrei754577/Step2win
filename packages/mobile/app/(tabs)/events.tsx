import { View, Text, FlatList, StyleSheet } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Button, Badge } from "../../components/ui";
import { colors } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function Events() {
  const { t, lang } = useLang();
  const qc = useQueryClient();

  const events = useQuery({ queryKey: ["events"], queryFn: async () => (await api.events.$get()).json() });
  const myRegs = useQuery({ queryKey: ["my-registrations"], queryFn: async () => (await api.events.me.registrations.$get()).json() });
  const register = useMutation({
    mutationFn: async (id: number) => (await api.events[":id"].register.$post({ param: { id: String(id) } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-registrations"] }),
  });

  const registeredIds = new Set((myRegs.data?.registrations ?? []).map((r: any) => r.eventId));

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={events.data?.events ?? []}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }: any) => {
          const registered = registeredIds.has(item.id);
          return (
            <View style={styles.card}>
              <Badge text={item.type} />
              <Text style={styles.title}>{lang === "ru" ? item.titleRu : item.titleKk}</Text>
              <Text style={styles.sub}>{lang === "ru" ? item.descriptionRu : item.descriptionKk}</Text>
              <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
                <View style={styles.row}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.location}</Text>
                </View>
              </View>
              <Button
                title={registered ? t("registered") : t("register_event")}
                variant={registered ? "outline" : "primary"}
                disabled={registered}
                onPress={() => register.mutate(item.id)}
                style={{ marginTop: 8 }}
              />
            </View>
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
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12, color: colors.textMuted },
});
