"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { getArticles, Article } from "@/lib/getArticles";
import ThemeToggle from "./components/ThemeToggle";

function formatDate(dateValue?: string, language: "en" | "az" = "en") {
  if (!dateValue) return language === "az" ? "Tarix yoxdur" : "No date";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return language === "az" ? "Tarix yoxdur" : "No date";
  }

  if (language === "az") {
    const months = [
      "yanvar",
      "fevral",
      "mart",
      "aprel",
      "may",
      "iyun",
      "iyul",
      "avqust",
      "sentyabr",
      "oktyabr",
      "noyabr",
      "dekabr",
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTechImage(index: number) {
  const images = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
  ];

  return images[index % images.length];
}

export default function Home() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [language, setLanguage] = useState<"en" | "az">("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().onboarding_completed) {
        router.push("/onboarding");
        return;
      }

      const userData = userSnap.data();
      setLanguage(userData.language === "az" ? "az" : "en");

      const loadedArticles = await getArticles();
      setArticles(loadedArticles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function changeLanguage(nextLanguage: "en" | "az") {
    const user = auth.currentUser;
    if (!user) return;

    setLanguage(nextLanguage);

    await updateDoc(doc(db, "users", user.uid), {
      language: nextLanguage,
    });
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#0a0a0a] dark:text-white flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          {language === "az" ? "Yüklənir..." : "Loading..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#0a0a0a] dark:text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-8">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              TezSaniye
            </h1>
            <p className="text-zinc-600 mt-3 text-base md:text-lg dark:text-zinc-400">
              {language === "az"
                ? "Süni intellekt əsaslı texnologiya xəbərləri"
                : "AI-powered technology news"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-zinc-300 bg-white p-1 dark:border-white/10 dark:bg-white/10">
              <button
                onClick={() => changeLanguage("en")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  language === "en"
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                EN
              </button>

              <button
                onClick={() => changeLanguage("az")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  language === "az"
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                AZ
              </button>
            </div>

            <ThemeToggle language={language} />

<Link
  href="/profile"
  className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
>
  {language === "az" ? "Profil" : "Profile"}
</Link>

            <button
              onClick={handleLogout}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              {language === "az" ? "Çıxış" : "Logout"}
            </button>
          </div>
        </header>

        {articles.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            {language === "az" ? "Məqalə tapılmadı." : "No articles found."}
          </p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((article, index) => {
              const title =
                language === "az"
                  ? article.title_az || article.title_en
                  : article.title_en || article.title_az;

              return (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="group block overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
                >
                  <div className="relative h-56 overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                    <img
                      src={article.image_url || getTechImage(index)}
                      alt={title || "Article cover"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.2em] text-white/75">
                      {language === "az" ? "Sİ Xəbərlər" : "AI News"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-semibold leading-snug text-zinc-950 transition group-hover:text-zinc-700 dark:text-white dark:group-hover:text-white/95">
                      {title || (language === "az" ? "Başlıqsız məqalə" : "Untitled article")}
                    </h2>

                    <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(article.published_at, language)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}