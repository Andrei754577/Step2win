import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

export default function Events() {
  const { t, lang } = useLang();
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();

  const events = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.events.$get()).json(),
  });

  const myRegs = useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => (await api.events.me.registrations.$get()).json(),
    enabled: !!session,
  });

  const register = useMutation({
    mutationFn: async (id: number) => (await api.events[":id"].register.$post({ param: { id: String(id) } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-registrations"] }),
  });

  const registeredIds = new Set((myRegs.data?.registrations ?? []).map((r: any) => r.eventId));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-8" style={{ fontFamily: "Poppins" }}>
          {t("events_title")}
        </h1>
        <div className="flex flex-col gap-4">
          {events.data?.events?.map((e: any) => {
            const registered = registeredIds.has(e.id);
            return (
              <div key={e.id} className="bg-white border rounded-xl p-5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-primary uppercase">{e.type}</span>
                  <div className="font-semibold mt-1">{lang === "ru" ? e.titleRu : e.titleKk}</div>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">{lang === "ru" ? e.descriptionRu : e.descriptionKk}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} /> {new Date(e.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {e.location}
                    </span>
                  </div>
                </div>
                {session && (
                  <Button size="sm" variant={registered ? "outline" : "default"} disabled={registered || register.isPending} onClick={() => register.mutate(e.id)}>
                    {registered ? t("registered") : t("register_event")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
