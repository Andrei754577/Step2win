import { db } from "../src/api/database";
import * as schema from "../src/api/database/schema";

async function seed() {
  const existing = await db.select().from(schema.courses);
  if (existing.length > 0) {
    console.log("Already seeded, skipping.");
    return;
  }

  const directions: { key: string; ru: string; kk: string; color: string }[] = [
    { key: "programming", ru: "Основы программирования", kk: "Бағдарламалау негіздері", color: "#2563EB" },
    { key: "web", ru: "Web-разработка", kk: "Web-әзірлеу", color: "#0EA5E9" },
    { key: "mobile", ru: "Мобильная разработка", kk: "Мобильді әзірлеу", color: "#22C55E" },
    { key: "ai", ru: "Искусственный интеллект", kk: "Жасанды интеллект", color: "#F59E0B" },
    { key: "robotics", ru: "Робототехника", kk: "Робототехника", color: "#EF4444" },
    { key: "cybersecurity", ru: "Кибербезопасность", kk: "Киберқауіпсіздік", color: "#7C3AED" },
    { key: "design", ru: "Дизайн", kk: "Дизайн", color: "#EC4899" },
    { key: "startups", ru: "Стартапы", kk: "Стартаптар", color: "#14B8A6" },
  ];

  for (const d of directions) {
    const [course] = await db
      .insert(schema.courses)
      .values({
        titleRu: d.ru,
        titleKk: d.kk,
        descriptionRu: `Вводный курс по направлению «${d.ru}» в Step2Win. Практика, проекты и наставничество.`,
        descriptionKk: `Step2Win-дегі «${d.kk}» бағыты бойынша кіріспе курс. Тәжірибе, жобалар және тәлімгерлік.`,
        direction: d.key,
        coverColor: d.color,
      })
      .returning();

    const lessonTitles = [
      { ru: "Введение и знакомство", kk: "Кіріспе және танысу" },
      { ru: "Базовые концепции", kk: "Негізгі түсініктер" },
      { ru: "Практическое задание", kk: "Тәжірибелік тапсырма" },
      { ru: "Мини-проект", kk: "Мини-жоба" },
    ];

    for (let i = 0; i < lessonTitles.length; i++) {
      await db.insert(schema.lessons).values({
        courseId: course.id,
        titleRu: lessonTitles[i].ru,
        titleKk: lessonTitles[i].kk,
        contentRu: `Материал урока «${lessonTitles[i].ru}» по направлению ${d.ru}. Здесь будет учебный контент, видео и задания.`,
        contentKk: `«${lessonTitles[i].kk}» сабағының материалы (${d.kk}). Мұнда оқу мазмұны, видео және тапсырмалар болады.`,
        order: i,
        xpReward: 10 + i * 5,
      });
    }

    const [test] = await db
      .insert(schema.tests)
      .values({
        courseId: course.id,
        titleRu: `Тест: ${d.ru}`,
        titleKk: `Тест: ${d.kk}`,
        passScore: 60,
      })
      .returning();

    await db.insert(schema.questions).values([
      {
        testId: test.id,
        textRu: `Что относится к направлению «${d.ru}»?`,
        textKk: `«${d.kk}» бағытына не жатады?`,
        type: "single",
        options: ["Правильный ответ", "Неверный ответ 1", "Неверный ответ 2"],
        correctAnswer: ["Правильный ответ"],
        order: 0,
      },
      {
        testId: test.id,
        textRu: "Step2Win помогает школьникам развивать проектное мышление?",
        textKk: "Step2Win оқушыларға жобалық ойлауды дамытуға көмектеседі ме?",
        type: "single",
        options: ["Да", "Нет"],
        correctAnswer: ["Да"],
        order: 1,
      },
    ]);
  }

  const now = Date.now();
  await db.insert(schema.events).values([
    {
      titleRu: "Хакатон Step2Win 2026",
      titleKk: "Step2Win 2026 хакатоны",
      descriptionRu: "48-часовой хакатон для школьных команд Караганды. Питчинг перед менторами Astana Hub.",
      descriptionKk: "Қарағанды мектеп командалары үшін 48 сағаттық хакатон.",
      type: "hackathon",
      date: new Date(now + 14 * 86400000),
      location: "Караганда, IT Hub Step2Win",
      capacity: 150,
    },
    {
      titleRu: "Форум цифровых лидеров",
      titleKk: "Цифрлық лидерлер форумы",
      descriptionRu: "Форум с участием представителей Терриконовой долины и Astana Hub.",
      descriptionKk: "Терриконды алқап және Astana Hub өкілдері қатысатын форум.",
      type: "forum",
      date: new Date(now + 30 * 86400000),
      location: "Караганда",
      capacity: 300,
    },
    {
      titleRu: "Олимпиада по программированию",
      titleKk: "Бағдарламалау олимпиадасы",
      descriptionRu: "Городская олимпиада для 5-11 классов по алгоритмам и логике.",
      descriptionKk: "5-11 сынып оқушылары үшін қалалық олимпиада.",
      type: "olympiad",
      date: new Date(now + 45 * 86400000),
      location: "Караганда, СШ №1",
      capacity: 200,
    },
  ]);

  console.log("Seed complete:", directions.length, "courses,", 3, "events");
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
