import { Layout } from "../components/layout";
import { useLang } from "../i18n";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import {
  Code2,
  Smartphone,
  Bot,
  Cpu,
  ShieldCheck,
  Palette,
  Rocket,
  Terminal,
  Users,
  Target,
  Layers,
  TrendingUp,
} from "lucide-react";

const directions = [
  { icon: Terminal, ru: "Программирование", kk: "Бағдарламалау" },
  { icon: Code2, ru: "Web-разработка", kk: "Web-әзірлеу" },
  { icon: Smartphone, ru: "Мобильная разработка", kk: "Мобильді әзірлеу" },
  { icon: Cpu, ru: "Робототехника", kk: "Робототехника" },
  { icon: Bot, ru: "Искусственный интеллект", kk: "Жасанды интеллект" },
  { icon: ShieldCheck, ru: "Кибербезопасность", kk: "Киберқауіпсіздік" },
  { icon: Palette, ru: "Дизайн", kk: "Дизайн" },
  { icon: Rocket, ru: "Стартапы", kk: "Стартаптар" },
];

const stages = [
  {
    ru: "Подготовительный этап",
    kk: "Дайындық кезеңі",
    ruText: "Сбор ключевых инициатив, формирование концепции, подбор партнеров.",
    kkText: "Негізгі бастамаларды жинау, тұжырымдама мен серіктестерді қалыптастыру.",
  },
  {
    ru: "Запуск",
    kk: "Іске қосу",
    ruText: "Запуск первых программ, коммуникация со школами и вовлечение обучающихся.",
    kkText: "Алғашқы бағдарламаларды іске қосу, мектептермен байланыс.",
  },
  {
    ru: "Активная реализация",
    kk: "Белсенді іске асыру",
    ruText: "Развитие проектов, мероприятия, наставничество и реальные кейсы.",
    kkText: "Жобаларды дамыту, іс-шаралар, тәлімгерлік және нақты кейстер.",
  },
  {
    ru: "Масштабирование",
    kk: "Масштабтау",
    ruText: "Расширение форматов, новые площадки и укрепление экосистемы.",
    kkText: "Форматтарды кеңейту, жаңа алаңдар және экожүйені нығайту.",
  },
];

export default function Index() {
  const { lang, t } = useLang();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-accent/10 border-b">
        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Проект IT Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ fontFamily: "Poppins" }}>
              {t("hero_title")}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">{t("hero_subtitle")}</p>
            <div className="flex gap-3">
              <Link href="/sign-up">
                <Button size="lg">{t("hero_cta")}</Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">
                  {t("hero_cta_courses")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "500+", l: t("stats_students") },
              { n: "120+", l: t("stats_projects") },
              { n: "20+", l: t("stats_formats") },
              { n: "8", l: t("stats_directions") },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="text-3xl font-bold text-primary" style={{ fontFamily: "Poppins" }}>
                  {s.n}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: "Poppins" }}>
            {t("about_title")}
          </h2>
          <p className="text-muted-foreground">{t("about_text")}</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-6 border">
          <div className="flex items-center gap-2 text-primary font-semibold mb-2">
            <Target size={18} /> {t("mission_title")}
          </div>
          <p className="text-muted-foreground">{t("mission_text")}</p>
        </div>
      </section>

      {/* Directions */}
      <section className="bg-white border-t border-b py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center" style={{ fontFamily: "Poppins" }}>
            {t("directions_title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {directions.map((d) => (
              <div key={d.ru} className="border rounded-xl p-5 flex flex-col items-center text-center gap-2 hover:border-primary transition-colors">
                <d.icon className="text-primary" size={28} />
                <span className="text-sm font-medium">{lang === "ru" ? d.ru : d.kk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stages */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-8 text-center" style={{ fontFamily: "Poppins" }}>
          {lang === "ru" ? "Этапы реализации" : "Іске асыру кезеңдері"}
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {stages.map((s, i) => (
            <div key={s.ru} className="border rounded-xl p-5 bg-white">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold mb-3">
                {i + 1}
              </div>
              <div className="font-semibold mb-1">{lang === "ru" ? s.ru : s.kk}</div>
              <p className="text-sm text-muted-foreground">{lang === "ru" ? s.ruText : s.kkText}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <Users className="mb-3" />
            <h3 className="font-semibold mb-2">{lang === "ru" ? "Социальные" : "Әлеуметтік"}</h3>
            <p className="text-white/80 text-sm">
              {lang === "ru"
                ? "Укрепление вовлечённости молодёжи в технологии, развитие лидерства и уверенности."
                : "Жастардың технологияға тартылуын күшейту, көшбасшылықты дамыту."}
            </p>
          </div>
          <div>
            <Layers className="mb-3" />
            <h3 className="font-semibold mb-2">{lang === "ru" ? "Образовательные" : "Білім беру"}</h3>
            <p className="text-white/80 text-sm">
              {lang === "ru"
                ? "Новая среда для практического обучения и подготовки к задачам рынка."
                : "Практикалық оқыту және нарық талаптарына дайындық үшін жаңа орта."}
            </p>
          </div>
          <div>
            <TrendingUp className="mb-3" />
            <h3 className="font-semibold mb-2">{lang === "ru" ? "Экономические" : "Экономикалық"}</h3>
            <p className="text-white/80 text-sm">
              {lang === "ru"
                ? "Поддержка молодёжных инициатив и рост потенциала предпринимательства."
                : "Жастар бастамаларын қолдау және кәсіпкерлік әлеуетінің өсуі."}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "Poppins" }}>
          {lang === "ru" ? "Готов сделать первый шаг?" : "Алғашқы қадам жасауға дайынсыз ба?"}
        </h2>
        <Link href="/sign-up">
          <Button size="lg">{t("hero_cta")}</Button>
        </Link>
      </section>
    </Layout>
  );
}
