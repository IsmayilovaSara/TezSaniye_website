"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  async function handleGoogleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-black transition-colors">
      
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-8 py-10 rounded-3xl bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            TezSaniye
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            AI-powered technology news
          </p>
        </div>

        {/* Welcome */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200">
            Welcome back
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sign in to continue
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="group w-full flex items-center justify-center gap-3 rounded-full px-5 py-3 
          bg-black text-white dark:bg-white dark:text-black
          transition-all duration-300 
          hover:scale-[1.02] hover:shadow-lg 
          active:scale-[0.98]"
        >
          {/* Google Icon */}
          <svg
            className="w-5 h-5"
            viewBox="0 0 48 48"
          >
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.7 3.3l6.5-6.5C35.1 2.1 29.9 0 24 0 14.6 0 6.6 5.5 2.7 13.5l7.7 6c1.8-5.3 6.8-9 13.6-9z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.5c-.3 2-1.5 5-4.2 7l6.5 5c3.8-3.5 7.3-8.8 7.3-15.6z"/>
            <path fill="#FBBC05" d="M10.4 28.5c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.7-6C1 16.2 0 20 0 24s1 7.8 2.7 11.1l7.7-6z"/>
            <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.5l-6.5-5c-1.8 1.2-4.3 2.1-8.2 2.1-6.8 0-11.8-3.7-13.6-9l-7.7 6C6.6 42.5 14.6 48 24 48z"/>
          </svg>

          <span className="font-medium">
            Continue with Google
          </span>
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-zinc-400 mt-6">
          By continuing, you agree to our terms
        </p>
      </div>
    </main>
  );
}