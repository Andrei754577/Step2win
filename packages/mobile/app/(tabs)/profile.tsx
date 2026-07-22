import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { authClient, clearToken } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { Button, Card } from "../../components/ui";
import { colors } from "../../lib/theme";

export default function Profile() {
  const { t, lang, setLang } = useLang();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card style={{ gap: 4 }}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.xp}>XP: {user?.xp ?? 0}</Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={styles.label}>Language / Тіл</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable style={[styles.langBtn, lang === "ru" && styles.langBtnActive]} onPress={() => setLang("ru")}>
            <Text style={[styles.langText, lang === "ru" && styles.langTextActive]}>Русский</Text>
          </Pressable>
          <Pressable style={[styles.langBtn, lang === "kk" && styles.langBtnActive]} onPress={() => setLang("kk")}>
            <Text style={[styles.langText, lang === "kk" && styles.langTextActive]}>Қазақша</Text>
          </Pressable>
        </View>
      </Card>

      <Button
        title={t("signout")}
        variant="outline"
        onPress={async () => {
          await authClient.signOut();
          await clearToken();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  name: { fontSize: 18, fontWeight: "700", color: colors.text },
  email: { fontSize: 13, color: colors.textMuted },
  xp: { fontSize: 13, color: colors.accent, fontWeight: "600", marginTop: 4 },
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  langBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, alignItems: "center" },
  langBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { fontSize: 13, color: colors.text },
  langTextActive: { color: "#fff", fontWeight: "600" },
});
