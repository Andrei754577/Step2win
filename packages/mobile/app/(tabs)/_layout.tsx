import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLang } from "../../lib/i18n";
import { colors } from "../../lib/theme";

export default function TabsLayout() {
  const { t } = useLang();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="courses" options={{ title: t("courses"), tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} /> }} />
      <Tabs.Screen name="tests" options={{ title: t("tests"), tabBarIcon: ({ color, size }) => <Ionicons name="clipboard" color={color} size={size} /> }} />
      <Tabs.Screen name="projects" options={{ title: t("projects"), tabBarIcon: ({ color, size }) => <Ionicons name="bulb" color={color} size={size} /> }} />
      <Tabs.Screen name="events" options={{ title: t("events"), tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
