import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ArticleActions from "@/app/components/ArticleActions";

function formatDate(dateValue?: string) {
  if (!dateValue) return "No date";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function extractSources(article: any): string[] {
  if (Array.isArray(article.source_links) && article.source_links.length > 0) {
    return article.source_links;
  }

  const body = article.body_en || "";
  const sourceIndex = body.toLowerCase().indexOf("sources");

  if (sourceIndex === -1) return [];

  const sourceText = body.slice(sourceIndex);
  const urls = sourceText.match(/https?:\/\/[^\s]+/g);

  return urls || [];
}

function cleanBody(article: any): string {
  const body = article.body_en || "";
  const lowerBody = body.toLowerCase();
  const sourcesIndex = lowerBody.indexOf("sources");

  if (sourcesIndex !== -1) {
    return body.slice(0, sourcesIndex).trim();
  }

  return body
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\bSources\b:?/gi, "")
    .trim();
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const ref = doc(db, "articles", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return (
      <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#0a0a0a] dark:text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">Article not found.</div>
      </main>
    );
  }

  const article = snapshot.data();
  const body = cleanBody(article);
  const paragraphs = body.split("\n").filter((p: string) => p.trim() !== "");
  const sources = extractSources(article);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#0a0a0a] dark:text-white">
      <div className="max-w-3xl mx-auto px-6 py-10 md:px-8">
        <Link
          href="/"
          className="inline-flex rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 mb-10"
        >
          ← Back to articles
        </Link>

        <header className="mb-10 border-b border-zinc-200 pb-8 dark:border-white/10">
          <p className="text-sm uppercase tracking-[0.18em] text-zinc-500 mb-4">
            {article.topic || "General"}
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            {article.title_en || "Untitled article"}
          </h1>

          <div className="mt-5 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{formatDate(article.published_at)}</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>Written by AI</span>
          </div>
        </header>

        <ArticleActions articleId={id} />

        <article className="space-y-6 text-[18px] leading-9 text-zinc-800 dark:text-zinc-200">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p>No content available.</p>
          )}
        </article>

        {sources.length > 0 && (
          <section className="mt-12">
            <details className="group rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-950 dark:text-white">
                  Sources
                </span>
                <span className="text-zinc-500 transition group-open:rotate-180">
                  ˅
                </span>
              </summary>

              <div className="mt-4 space-y-3">
                {sources.map((source: string, index: number) => (
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