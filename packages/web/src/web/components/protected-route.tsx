import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string[];
}) {
  const { data: session, isPending } = authClient.useSession();
  // Guards against a race right after sign-in/sign-up: the reactive session
  // store can briefly report "no session" before it has synced with the
  // server, which would otherwise bounce a freshly-logged-in user back to
  // /sign-in. We double-check with a direct session fetch before redirecting.
  const [verifiedNoSession, setVerifiedNoSession] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isPending || session || verifiedNoSession || checking) return;
    setChecking(true);
    authClient
      .getSession()
      .then((res) => {
        if (!res.data) setVerifiedNoSession(true);
      })
      .finally(() => setChecking(false));
  }, [isPending, session, verifiedNoSession, checking]);

  useEffect(() => {
    if (session) setVerifiedNoSession(false);
  }, [session]);

  if (isPending || (!session && !verifiedNoSession)) {
    return <div className="p-10 text-center text-muted-foreground">Загрузка...</div>;
  }
  if (!session) return <Redirect to="/sign-in" />;

  const user = session.user as any;
  if (role && !role.includes(user.role ?? "student")) return <Redirect to="/dashboard" />;

  return <>{children}</>;
}
