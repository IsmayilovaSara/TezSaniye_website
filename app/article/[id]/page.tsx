"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import ArticleActions from "@/app/components/ArticleActions";
import ThemeToggle from "@/app/components/ThemeToggle";

type Article = {
  title_en?: string;
  title_az?: string;
  body_en?: string;
  body_az?: string;
  topic?: string;
  published_at?: string;
  source_links?: string[];
};

function formatDate(dateValue?: string, language: "en" | "az" = "en") {
  if (!dateValue) return language === "az" ? "Tarix yoxdur" : "No date";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return language === "az" ? "Tarix yoxdur" : "No date";

  if (language === "az") {
    const months = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function findSourcesIndex(body: string) {
  const lower = body.toLowerCase();

  const possibleMarkers = [
    "sources:",
    "sources",
    "mənbələr:",
    "mənbələr",
    "menbeler:",
    "menbeler",
  ];

  const indexes = possibleMarkers
    .map((marker) => lower.indexOf(marker))
    .filter((index) => index !== -1);

  return indexes.length > 0 ? Math.min(...indexes) : -1;
}

function extractSources(body: string, article: Article): string[] {
  if (Array.isArray(article.source_links) && article.source_links.length > 0) {
    return article.source_links;
  }

  const sourceIndex = findSourcesIndex(body);
  if (sourceIndex === -1) return [];

  const sourceText = body.slice(sourceIndex);
  const urls = sourceText.match(/https?:\/\/[^\s]+/g);

  return urls || [];
}

function cleanBody(body: string): string {
  const sourcesIndex = findSourcesIndex(body);

  if (sourcesIndex !== -1) {
    return body.slice(0, sourcesIndex).trim();
  }

  return body.replace(/https?:\/\/[^\s]+/g, "").trim();
}

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [language, setLanguage] = useState<"en" | "az">("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      const ref = doc(db, "articles", id);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        setArticle(snapshot.data() as Article);
      }

      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setLanguage(userData.language === "az" ? "az" : "en");
        }
      }

      loadArticle();
    });

    return () => unsubscribe();
  }, [id]);

  async function changeLanguage(nextLanguage: "en" | "az") {
    const user = auth.currentUser;
    if (!user) return;

    setLanguage(nextLanguage);

    await updateDoc(doc(db, "users", user.uid), {
      language: nextLanguage,
    });
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

  if (!article) {
    return (
      <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#0a0a0a] dark:text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">
          {language === "az" ? "Məqalə tapılmadı." : "Article not found."}
        </div>
      </main>
    );
  }

  const title =
    language === "az"
      ? article.title_az || article.title_en
      : article.title_en || article.title_az;

  const rawBody =
    language === "az"
      ? article.body_az || article.body_en || ""
      : article.body_en || article.body_az || "";

  const body = cleanBody(rawBody);
  const paragraphs = body.split("\n").filter((p) => p.trim() !== "");
  const sources = extractSources(rawBody, article);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#0a0a0a] dark:text-white">
      <div className="max-w-3xl mx-auto px-6 py-10 md:px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            ← {language === "az" ? "Məqalələrə qayıt" : "Back to articles"}
          </Link>

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
          </div>
        </div>

        <header className="mb-10 border-b border-zinc-200 pb-8 dark:border-white/10">
          <p className="text-sm uppercase tracking-[0.18em] text-zinc-500 mb-4">
            {article.topic || (language === "az" ? "Ümumi" : "General")}
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            {title || (language === "az" ? "Başlıqsız məqalə" : "Untitled article")}
          </h1>

          <div className="mt-5 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{formatDate(article.published_at, language)}</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>
              {language === "az"
                ? "Süni intellekt tərəfindən yazılıb"
                : "Written by AI"}
            </span>
          </div>
        </header>

        <ArticleActions articleId={id} />

        <article className="space-y-6 text-[18px] leading-9 text-zinc-800 dark:text-zinc-200">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>{language === "az" ? "Məzmun yoxdur." : "No content available."}</p>
          )}
        </article>

        {sources.length > 0 && (
          <section className="mt-12">
            <details className="group rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-950 dark:text-white">
                  {language === "az" ? "Mənbələr" : "Sources"}
                </span>
                <span className="text-zinc-500 transition group-open:rotate-180">
                  ˅
                </span>
              </summary>

              <div className="mt-4 space-y-3">
                {sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="block break-all rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
                  >
                    {source}
                  </a>
                ))}
              </div>
            </details>
          </section>
        )}
      </div>
    </main>
  );
}