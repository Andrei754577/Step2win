import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Lang = "ru" | "kk";

const dict = {
  ru: {
    home: "Главная",
    courses: "Курсы",
    tests: "Тесты",
    projects: "Проекты",
    events: "Мероприятия",
    profile: "Профиль",
    signin_title: "Вход",
    signup_title: "Регистрация",
    email: "Email",
    password: "Пароль",
    name: "Имя",
    grade: "Класс",
    direction: "Направление",
    submit: "Продолжить",
    have_account: "Уже есть аккаунт? Войти",
    no_account: "Нет аккаунта? Регистрация",
    welcome: "Добро пожаловать",
    my_xp: "Опыт (XP)",
    my_courses: "Мои курсы",
    my_certificates: "Сертификаты",
    upcoming_events: "Ближайшие мероприятия",
    progress: "Прогресс",
    enroll: "Записаться",
    lessons: "Уроки",
    complete_lesson: "Завершить урок",
    lesson_completed: "Урок завершён",
    take_test: "Пройти тест",
    passed: "Пройден",
    failed: "Не пройден",
    submit_test: "Отправить ответы",
    test_result: "Результат теста",
    new_project: "Новый проект",
    stage: "Этап",
    idea: "Идея",
    hypothesis: "Гипотеза",
    mvp: "MVP",
    demoday: "Демодень",
    register_event: "Зарегистрироваться",
    registered: "Вы зарегистрированы",
    signout: "Выйти",
    loading: "Загрузка...",
    save: "Сохранить",
    cancel: "Отмена",
    create: "Создать",
  },
  kk: {
    home: "Басты бет",
    courses: "Курстар",
    tests: "Тесттер",
    projects: "Жобалар",
    events: "Іс-шаралар",
    profile: "Профиль",
    signin_title: "Кіру",
    signup_title: "Тіркелу",
    email: "Email",
    password: "Құпия сөз",
    name: "Аты",
    grade: "Сынып",
    direction: "Бағыт",
    submit: "Жалғастыру",
    have_account: "Аккаунтыңыз бар ма? Кіру",
    no_account: "Аккаунтыңыз жоқ па? Тіркелу",
    welcome: "Қош келдіңіз",
    my_xp: "Тәжірибе (XP)",
    my_courses: "Менің курстарым",
    my_certificates: "Сертификаттар",
    upcoming_events: "Жақындағы іс-шаралар",
    progress: "Прогресс",
    enroll: "Тіркелу",
    lessons: "Сабақтар",
    complete_lesson: "Сабақты аяқтау",
    lesson_completed: "Сабақ аяқталды",
    take_test: "Тест тапсыру",
    passed: "Өтті",
    failed: "Өтпеді",
    submit_test: "Жауаптарды жіберу",
    test_result: "Тест нәтижесі",
    new_project: "Жаңа жоба",
    stage: "Кезең",
    idea: "Идея",
    hypothesis: "Гипотеза",
    mvp: "MVP",
    demoday: "Демодень",
    register_event: "Тіркелу",
    registered: "Сіз тіркелдіңіз",
    signout: "Шығу",
    loading: "Жүктелуде...",
    save: "Сақтау",
    cancel: "Бас тарту",
    create: "Құру",
  },
} as const;

type Key = keyof typeof dict.ru;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "ru",
  setLang: () => {},
  t: (k) => dict.ru[k],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    AsyncStorage.getItem("lang").then((v) => {
      if (v === "ru" || v === "kk") setLangState(v);
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem("lang", l);
  };

  const t = (k: Key) => dict[lang][k] ?? dict.ru[k];
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
