import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export type Article = {
  id: string;
  title_en?: string;
  title_az?: string;
  body_en?: string;
  body_az?: string;
  topic?: string;
  status?: string;
  published_at?: string;
  created_at?: string;
  source_links?: string[];
  image_url?: string;
};

export async function getArticles(): Promise<Article[]> {
  const snapshot = await getDocs(collection(db, "articles"));

  const articles: Article[] = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
    } as Article;
  });

  // Sort: newest first
  return articles.sort((a, b) => {
    const dateA = new Date(a.created_at || a.published_at || 0).getTime();
    const dateB = new Date(b.created_at || b.published_at || 0).getTime();

    return dateB - dateA;
  });
}