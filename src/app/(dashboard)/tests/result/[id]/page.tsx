"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Clock,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ListOrdered,
} from "lucide-react";

interface QuestionResult {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  userSelected: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface AttemptData {
  id: string;
  category: string;
  score: number;
  total: number;
  timeTaken: number;
  createdAt: string;
}

export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/tests/result/${attemptId}`);
        if (!res.ok) throw new Error("Failed to load result");
        const data = await res.json();
        setAttempt(data.attempt);
        setQuestions(data.questions || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading result");
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm text-slate-600 font-medium">Calculating score and loading answer keys...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Result Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || "Unable to display this test attempt."}</p>
        <Link
          href="/tests"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tests
        </Link>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / (attempt.total || 1)) * 100);
  const minutes = Math.floor(attempt.timeTaken / 60);
  const seconds = attempt.timeTaken % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (percentage >= 60) return "text-amber-600 border-amber-500 bg-amber-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top summary card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {attempt.category} APTITUDE TEST
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Test Performance Summary</h1>
            <p className="text-slate-500 text-sm mt-1">
              Completed on {new Date(attempt.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-black ${getScoreColor()}`}>
              <span className="text-2xl">{percentage}%</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Score</span>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>
                  Correct: <strong>{attempt.score}</strong> / {attempt.total}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>
                  Duration: <strong>{timeFormatted}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> All Categories
          </Link>
          <Link
            href={`/tests/${attempt.category.toLowerCase()}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" /> Retake Test
          </Link>
        </div>
      </div>

      {/* Answer Key & Explanations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-indigo-600" />
          Detailed Question Review & Explanations
        </h2>

        {questions.map((q, idx) => {
          return (
            <div
              key={q.id || idx}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition ${
                q.isCorrect ? "border-slate-200" : "border-red-200 bg-red-50/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-sm text-slate-400 mt-0.5">#{idx + 1}</span>
                  <p className="font-semibold text-slate-900 text-base">{q.text}</p>
                </div>
                {q.isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shrink-0">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-3">
                {[
                  { key: "A", val: q.optionA },
                  { key: "B", val: q.optionB },
                  { key: "C", val: q.optionC },
                  { key: "D", val: q.optionD },
                ].map(({ key, val }) => {
                  const isUserPick = q.userSelected?.toUpperCase() === key;
                  const isRealCorrect = q.correctAnswer?.toUpperCase() === key;

                  let optClass = "border-slate-200 bg-slate-50 text-slate-700";
                  if (isRealCorrect) {
                    optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500";
                  } else if (isUserPick && !q.isCorrect) {
                    optClass = "border-red-500 bg-red-50 text-red-900 font-bold ring-1 ring-red-500";
                  }

                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${optClass}`}
                    >
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center font-bold bg-white/80 border border-current shrink-0">
                        {key}
                      </span>
                      <span>{val}</span>
                      {isRealCorrect && <span className="ml-auto text-[10px] uppercase font-bold text-emerald-700">Correct</span>}
                      {isUserPick && !isRealCorrect && <span className="ml-auto text-[10px] uppercase font-bold text-red-700">Your choice</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation box */}
              {q.explanation && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Concept Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
