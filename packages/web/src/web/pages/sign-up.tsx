import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { authClient } from "../lib/auth";
import { Button } from "../components/ui/button";

const directions = ["programming", "web", "mobile", "ai", "robotics", "cybersecurity", "design", "startups"];

export default function SignUp() {
  const { t, lang } = useLang();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("5");
  const [direction, setDirection] = useState("programming");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      grade: Number(grade),
      direction,
      language: lang,
    } as any);
    if (error) {
      setLoading(false);
      setError(error.message ?? "Ошибка регистрации");
      return;
    }
    // Make sure the session is actually settled server-side before navigating,
    // otherwise the protected route can momentarily see "no session" and
    // bounce back to /sign-in.
    await authClient.getSession();
    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-6 text-center" style={{ fontFamily: "Poppins" }}>
          {t("signup_title")}
        </h1>
        <form onSubmit={onSubmit} className="bg-white border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <div>
            <label className="text-sm font-medium">{t("name")}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("password")}</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t("grade")}</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                {Array.from({ length: 7 }, (_, i) => i + 5).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("direction")}</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                {directions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("loading") : t("submit")}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {t("have_account")}{" "}
            <Link href="/sign-in" className="text-primary font-medium">
              {t("nav_signin")}
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
