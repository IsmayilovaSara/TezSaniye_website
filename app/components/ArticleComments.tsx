"use client";

import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  text: string;
  user_name?: string;
};

type Props = {
  articleId: string;
  language?: "en" | "az";
};

export default function ArticleComments({ articleId, language = "en" }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  async function loadComments() {
    const q = query(
      collection(db, "interactions"),
      where("article_id", "==", articleId),
      where("type", "==", "comment")
    );

    const snap = await getDocs(q);

    setComments(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
    );
  }

  useEffect(() => {
    loadComments();
  }, [articleId]);

  async function addComment() {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    const id = `${user.uid}_${articleId}_comment_${Date.now()}`;

    await setDoc(doc(db, "interactions", id), {
      interaction_id: id,
      user_id: user.uid,
      user_name: user.displayName || user.email || "User",
      article_id: articleId,
      type: "comment",
      text: text.trim(),
      created_at: serverTimestamp(),
    });

    setText("");
    loadComments();
  }

return (
  <section className="mt-12 max-w-2xl mx-auto">
    {/* HEADER */}
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
        {language === "az" ? "Şərhlər" : "Comments"}
      </h2>

      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        {language === "az"
          ? "Fikrinizi paylaşın"
          : "Join the discussion"}
      </p>
    </div>

    {/* INPUT */}
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          language === "az" ? "Şərh yazın..." : "Write a comment..."
        }
        rows={3}
        className="w-full resize-none bg-transparent text-sm leading-6 text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100"
      />

      <div className="mt-3 flex justify-end">
        <button
          onClick={addComment}
          disabled={!text.trim()}
          className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950"
        >
          {language === "az" ? "Göndər" : "Post"}
        </button>
      </div>
    </div>

    {/* COMMENTS LIST */}
    <div className="mt-6 space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          {language === "az"
            ? "Hələ şərh yoxdur"
            : "No comments yet"}
        </p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 items-start"
          >
            {/* avatar circle */}
            <div className="h-8 w-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs">
              {(comment.user_name || "U")[0].toUpperCase()}
            </div>

            {/* content */}
            <div className="flex-1">
              <div className="rounded-xl bg-zinc-100 px-4 py-3 dark:bg-white/[0.05]">
                <p className="text-xs font-medium text-zinc-500">
                  {comment.user_name ||
                    (language === "az" ? "İstifadəçi" : "User")}
                </p>

                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 leading-6">
                  {comment.text}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);
}