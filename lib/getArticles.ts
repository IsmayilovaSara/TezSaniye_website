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
  source_links?: string[];
  image_url?: string;
};

export async function getArticles(): Promise<Article[]> {
  const snapshot = await getDocs(collection(db, "articles"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title_en: data.title_en,
      title_az: data.title_az,
      body_en: data.body_en,
      body_az: data.body_az,
      topic: data.topic,
      status: data.status,
      published_at: data.published_at,
      source_links: data.source_links || [],
      image_url: data.image_url,
    };
  });
}