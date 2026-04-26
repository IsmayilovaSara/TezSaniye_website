"use client";

import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

type Article = {
  id: string;
  title_en?: string;
  title_az?: string;
  topic?: string;
  published_at?: string;
  image_url?: string;
};

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
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
  ];

  return images[index % images.length];
}

function ArticleCard({
  article,
  index,
  language,
}: {
  article: Article;
  index: number;
  language: "en" | "az";
}) {
  const title =
    language === "az"
      ? article.title_az || article.title_en
      : article.title_en || article.title_az;

  return (
    <Link
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
          {language === "az" ? "Sİ Məzmun" : "AI Content"}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold leading-snug text-zinc-950 transition group-hover:text-zinc-700 dark:text-white dark:group-hover:text-white/95">
          {title || (language === "az" ? "Başlıqsız məqalə" : "Untitled article")}
        </h3>

        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {formatDate(article.published_at, language)}
        </p>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState<"en" | "az">("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(user.displayName || user.email || "User");

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setLanguage(userData.language === "az" ? "az" : "en");
      }

      const interactionsRef = collection(db, "interactions");

      const savedQuery = query(
        interactionsRef,
        where("user_id", "==", user.uid),
        where("type", "==", "save")
      );

      const likedQuery = query(
        interactionsRef,
        where("user_id", "==", user.uid),
        where("type", "==", "like")
      );

      const savedSnap = await getDocs(savedQuery);
      const likedSnap = await getDocs(likedQuery);

      async function loadArticles(interactionDocs: any[]) {
        const articles = await Promise.all(
          interactionDocs.map(async (interactionDoc) => {
            const data = interactionDoc.data();
            const articleRef = doc(db, "articles", data.article_id);
            const articleSnap = await getDoc(articleRef);

            if (!articleSnap.exists()) return null;

            return {
              id: articleSnap.id,
              ...articleSnap.data(),
            } as Article;
          })
        );

        return articles.filter(Boolean) as Article[];
      }

      setSavedArticles(await loadArticles(savedSnap.docs));
      setLikedArticles(await loadArticles(likedSnap.docs));
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-[#0a0a0a] dark:text-white">
        <p className="text-zinc-500 dark:text-zinc-400">
          {language === "az" ? "Yüklənir..." : "Loading..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#0a0a0a] dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <header className="mb-12 flex items-start justify-between gap-6">
          <div>
            <Link
              href="/"
              className="inline-flex rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              ← {language === "az" ? "Məqalələrə qayıt" : "Back to articles"}
            </Link>

            <div className="mt-8">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                {userName}
              </h1>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                {language === "az"
                  ? "Yadda saxladığınız və bəyəndiyiniz məqalələr"
                  : "Your saved and liked articles"}
              </p>
            </div>
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

            <button
              onClick={handleLogout}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              {language === "az" ? "Çıxış" : "Logout"}
            </button>
          </div>
        </header>

        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-semibold">
              {language === "az" ? "Yadda saxlanılanlar" : "Saved Articles"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {savedArticles.length}
            </p>
          </div>

          {savedArticles.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
              {language === "az"
                ? "Hələ yadda saxlanılan məqalə yoxdur."
                : "No saved articles yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {savedArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  language={language}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-semibold">
              {language === "az" ? "Bəyənilənlər" : "Liked Articles"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {likedArticles.length}
            </p>
          </div>

          {likedArticles.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
              {language === "az"
                ? "Hələ bəyənilən məqalə yoxdur."
                : "No liked articles yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {likedArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index + savedArticles.length}
                  language={language}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}