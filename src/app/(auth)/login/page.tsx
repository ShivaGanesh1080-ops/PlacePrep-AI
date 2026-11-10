"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, Loader2, AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Verify your credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              PlacePrep AI
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Sign in to workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your placement prep progress and mock interviews
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          {/* Quick Demo Fill Pills */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
              Quick demo access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("shiva@student.com", "student123")}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin@placement.edu", "admin123")}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5 pt-4 border-t border-slate-100">
            No account yet?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 font-medium hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
