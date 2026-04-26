"use client";

import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = [
  {
    key: "language",
    title: {
      en: "What language do you prefer?",
      az: "Hansı dili üstün tutursunuz?",
    },
    options: [
      { label: { en: "English", az: "English" }, value: "en" },
      { label: { en: "Azərbaycan", az: "Azərbaycan" }, value: "az" },
    ],
  },
  {
    key: "preferred_topics",
    title: {
      en: "What topics are you interested in?",
      az: "Hansı mövzular sizi maraqlandırır?",
    },
    options: [
      { label: { en: "Technology", az: "Texnologiya" }, value: "technology" },
    ],
  },
  {
    key: "user_type",
    title: {
      en: "Which best describes you?",
      az: "Sizi ən yaxşı hansı təsvir edir?",
    },
    options: [
      { label: { en: "Student", az: "Tələbə" }, value: "student" },
      {
        label: { en: "Working professional", az: "İşləyən mütəxəssis" },
        value: "working_professional",
      },
      { label: { en: "Other", az: "Digər" }, value: "other" },
    ],
  },
  {
    key: "app_goal",
    title: {
      en: "What do you want to get from this app?",
      az: "Bu tətbiqdən nə əldə etmək istəyirsiniz?",
    },
    options: [
      {
        label: { en: "Stay updated", az: "Yeniliklərdən xəbərdar olmaq" },
        value: "stay_updated",
      },
      {
        label: { en: "Understand topics deeply", az: "Mövzuları dərindən anlamaq" },
        value: "understand_deeply",
      },
      {
        label: { en: "Use for research", az: "Araşdırma üçün istifadə etmək" },
        value: "research",
      },
      {
        label: { en: "Casual reading", az: "Sadə oxu üçün" },
        value: "casual_reading",
      },
    ],
  },
 
];

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const language = answers.language === "az" ? "az" : "en";
  const step = steps[stepIndex];
  const selected = answers[step.key];

  function chooseAnswer(value: any) {
    setAnswers((prev) => ({
      ...prev,
      [step.key]: step.key === "preferred_topics" ? [value] : value,
    }));
  }

  async function nextStep() {
    if (selected === undefined) return;

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

await setDoc(
  doc(db, "users", user.uid),
  {
    user_id: user.uid,
    email: user.email,
    display_name: user.displayName,
    photo_url: user.photoURL,
    created_at: serverTimestamp(),
    ...answers,
    onboarding_completed: true,
  },
  { merge: true }
);

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#0a0a0a] dark:text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {language === "az"
            ? `Addım ${stepIndex + 1} / ${steps.length}`
            : `Step ${stepIndex + 1} of ${steps.length}`}
        </p>

        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
          {step.title[language]}
        </h1>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {step.options.map((option) => {
            const isSelected = Array.isArray(selected)
              ? selected.includes(option.value)
              : selected === option.value;

            return (
              <button
                key={String(option.value)}
                onClick={() => chooseAnswer(option.value)}
                className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.08]"
                }`}
              >
                {option.label[language]}
              </button>
            );
          })}
        </div>

        <button
          onClick={nextStep}
          disabled={selected === undefined}
          className="mt-8 w-full rounded-full bg-zinc-950 px-5 py-3 text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {stepIndex === steps.length - 1
            ? language === "az"
              ? "Bitir"
              : "Finish"
            : language === "az"
            ? "Davam et"
            : "Continue"}
        </button>
      </div>
    </main>
  );
}