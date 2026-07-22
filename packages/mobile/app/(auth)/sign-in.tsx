import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { authClient, captureToken } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { Button, Input } from "../../components/ui";
import { colors } from "../../lib/theme";

export default function SignIn() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email(
      { email, password },
      { onSuccess: captureToken }
    );
    setLoading(false);
    if (error) setError(error.message ?? "Ошибка входа");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Step2Win</Text>
      <Text style={styles.subtitle}>{t("signin_title")}</Text>
      <View style={{ gap: 14, width: "100%" }}>
        <Input label={t("email")} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input label={t("password")} value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={loading ? t("loading") : t("submit")} onPress={onSubmit} loading={loading} />
        <Link href="/(auth)/sign-up" style={styles.link}>
          <Text style={styles.link}>{t("no_account")}</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 6, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 24 },
  error: { color: colors.danger, fontSize: 13 },
  link: { color: colors.primary, textAlign: "center", marginTop: 8, fontSize: 14, fontWeight: "500" },
});
