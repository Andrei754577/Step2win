import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { authClient } from "../lib/auth";
import { Button } from "../components/ui/button";

export default function SignIn() {
  const { t } = useLang();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message ?? "Ошибка входа");
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
          {t("signin_title")}
        </h1>
        <form onSubmit={onSubmit} className="bg-white border rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <div>
            <label className="text-sm font-medium">{t("email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("loading") : t("submit")}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {t("no_account")}{" "}
            <Link href="/sign-up" className="text-primary font-medium">
              {t("nav_signup")}
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
