"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Answer {
  questionId: string;
  selected: string | null;
}

const categoryLabels: Record<string, string> = {
  quantitative: "Quantitative Aptitude",
  verbal: "Verbal Ability",
  logical: "Logical Reasoning",
  technical: "Technical (CS)",
};

export default function TestTakingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficultyParam = (searchParams.get("difficulty") || "ALL").toUpperCase();
  const category = (params.category as string).toUpperCase();
  const categoryLabel = categoryLabels[(params.category as string).toLowerCase()] ?? params.category;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const queryParams = new URLSearchParams({
          category,
          ...(difficultyParam !== "ALL" ? { difficulty: difficultyParam } : {}),
        });
        const res = await fetch(`/api/tests?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to load questions");
        }
        const data = await res.json();
        const questionsList: Question[] = Array.isArray(data)
          ? data
          : Array.isArray(data.questions)
          ? data.questions
          : [];

        if (questionsList.length === 0) {
          setError(`No ${difficultyParam !== "ALL" ? difficultyParam : ""} questions available for this category yet.`);
          return;
        }
        setQuestions(questionsList);
        setAnswers(questionsList.map((q: Question) => ({ questionId: q.id, selected: null })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [category, difficultyParam]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectOption = (option: string) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === currentIndex ? { ...a, selected: option } : a))
    );
  };

  const answeredCount = answers.filter((a) => a.selected !== null).length;
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          answers: answers.map((a) => ({ questionId: a.questionId, selected: a.selected })),
          timeTaken: elapsed,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit test");
      }

      const data = await res.json();
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/tests/result/${data.attemptId}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert("Failed to submit test. Please try again.");
    }
  }, [submitting, category, answers, elapsed, router]);

  const attemptSubmit = () => {
    if (!allAnswered) {
      setShowConfirm(true);
    } else {
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-600 text-lg">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Oops!</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tests
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex]?.selected;
  const options = [
    { key: "A", value: currentQuestion.optionA },
    { key: "B", value: currentQuestion.optionB },
    { key: "C", value: currentQuestion.optionC },
    { key: "D", value: currentQuestion.optionD },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-900">Submit Incomplete Test?</h3>
            </div>
            <p className="text-slate-600 mb-2">
              You have answered <span className="font-bold text-indigo-600">{answeredCount}</span> out of{" "}
              <span className="font-bold">{questions.length}</span> questions.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Unanswered questions will be marked as wrong. Are you sure you want to submit?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/tests" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Tests
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{categoryLabel}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                difficultyParam === "EASY"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : difficultyParam === "HARD"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : difficultyParam === "MEDIUM"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}
            >
              {difficultyParam === "ALL" ? "Mixed Difficulty" : `${difficultyParam} Level`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-lg font-semibold">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>
            Question <span className="font-semibold text-slate-700">{currentIndex + 1}</span> of{" "}
            <span className="font-semibold text-slate-700">{questions.length}</span>
          </span>
          <span className="text-xs">{answeredCount} answered</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
        <p className="text-lg font-semibold text-slate-900 leading-relaxed mb-8">{currentQuestion.text}</p>

        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = currentAnswer === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => selectOption(opt.key)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {opt.key}
                </span>
                <span className={`text-base ${isSelected ? "text-indigo-900 font-medium" : "text-slate-700"}`}>
                  {opt.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={attemptSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {questions.map((_, i) => {
          const isAnswered = answers[i]?.selected !== null;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-150 ${
                isCurrent
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1"
                  : isAnswered
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-500 hover:bg-slate-300"
              }`}
              title={`Question ${i + 1}${isAnswered ? " (answered)" : ""}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
