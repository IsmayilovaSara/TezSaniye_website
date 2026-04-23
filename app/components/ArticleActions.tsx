"use client";

import { auth, db } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

type Props = {
  articleId: string;
};

export default function ArticleActions({ articleId }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadState() {
      const user = auth.currentUser;
      if (!user) return;

      const likeRef = doc(db, "interactions", `${user.uid}_${articleId}_like`);
      const saveRef = doc(db, "interactions", `${user.uid}_${articleId}_save`);

      setLiked((await getDoc(likeRef)).exists());
      setSaved((await getDoc(saveRef)).exists());
    }

    loadState();
  }, [articleId]);

  async function toggleInteraction(type: "like" | "save") {
    const user = auth.currentUser;
    if (!user) return;

    const interactionId = `${user.uid}_${articleId}_${type}`;
    const ref = doc(db, "interactions", interactionId);
    const existing = await getDoc(ref);

    if (existing.exists()) {
      await deleteDoc(ref);
      type === "like" ? setLiked(false) : setSaved(false);
      return;
    }

    await setDoc(ref, {
      interaction_id: interactionId,
      user_id: user.uid,
      article_id: articleId,
      type,
      created_at: serverTimestamp(),
    });

    type === "like" ? setLiked(true) : setSaved(true);
  }

  return (
    <div className="mt-8 mb-8 flex items-center gap-3">
      <button
        type="button"
        onClick={() => toggleInteraction("like")}
        aria-label="Like article"
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition hover:scale-105 active:scale-95 ${
          liked
            ? "border-red-500 bg-red-500 text-white"
            : "border-white/10 bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.8 4.6c-1.6-1.7-4.2-1.7-5.8 0L12 7.7 9 4.6c-1.6-1.7-4.2-1.7-5.8 0-1.6 1.7-1.6 4.4 0 6.1L12 20l8.8-9.3c1.6-1.7 1.6-4.4 0-6.1z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => toggleInteraction("save")}
        aria-label="Save article"
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition hover:scale-105 active:scale-95 ${
          saved
            ? "border-white bg-white text-zinc-950"
            : "border-white/10 bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
        </svg>
      </button>
    </div>
  );
}