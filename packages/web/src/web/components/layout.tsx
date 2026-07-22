import { Link, useLocation } from "wouter";
import { useLang } from "../i18n";
import { authClient } from "../lib/auth";
import { Button } from "./ui/button";
import { Menu, X, Rocket } from "lucide-react";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLang();
  const { data: session } = authClient.useSession();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const user = session?.user as any;

  const links = [
    { href: "/courses", label: t("nav_courses") },
    { href: "/tests", label: t("nav_tests") },
    { href: "/projects", label: t("nav_projects") },
    { href: "/events", label: t("nav_events") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg" style={{ fontFamily: "Poppins" }}>
            <Rocket className="text-primary" size={22} />
            Step2Win
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary">
                {l.label}
              </Link>
            ))}
            {user && (
              <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-primary">
                {t("nav_dashboard")}
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-foreground/80 hover:text-primary">
                {t("nav_admin")}
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex border rounded-full overflow-hidden text-xs font-medium">
              <button
                onClick={() => setLang("ru")}
                className={`px-2.5 py-1 ${lang === "ru" ? "bg-primary text-white" : "bg-white"}`}
              >
                RU
              </button>
              <button
                onClick={() => setLang("kk")}
                className={`px-2.5 py-1 ${lang === "kk" ? "bg-primary text-white" : "bg-white"}`}
              >
                KK
              </button>
            </div>
            {user ? (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await authClient.signOut();
                  navigate("/");
                }}
              >
                {t("nav_signout")}
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => navigate("/sign-in")}>
                  {t("nav_signin")}
                </Button>
                <Button size="sm" onClick={() => navigate("/sign-up")}>
                  {t("nav_signup")}
                </Button>
              </>
            )}
            <button className="md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3 bg-white">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium">
                {l.label}
              </Link>
            ))}
            {user && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium">
                {t("nav_dashboard")}
              </Link>
            )}
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Step2Win</span>
          <span>{t("footer_rights")}</span>
        </div>
      </footer>
    </div>
  );
}
