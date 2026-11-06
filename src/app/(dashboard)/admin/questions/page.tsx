"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Trash2,
  Filter,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

interface Question {
  id: string;
  category: string;
  difficulty: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explanation: string | null;
}

export default function AdminQuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState("TECHNICAL");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [text, setText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [answer, setAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    loadQuestions();
  }, [categoryFilter]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?category=${categoryFilter}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          difficulty,
          text,
          optionA,
          optionB,
          optionC,
          optionD,
          answer,
          explanation,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        // Reset form
        setText("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setExplanation("");
        loadQuestions();
      }
    } catch (err) {
      console.error("Failed to create question:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            Placement Question Bank
          </h1>
          <p className="text-slate-600 mt-1">
            Curate questions for Quantitative, Verbal, Logical, and Technical placement rounds.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-sm transition self-start"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Close Form" : "Add New Question"}
        </button>
      </div>

      {/* Add Question Form Modal/Section */}
      {showAddForm && (
        <form
          onSubmit={handleAddQuestion}
          className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900">Create New Aptitude Question</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              >
                <option value="QUANTITATIVE">Quantitative</option>
                <option value="VERBAL">Verbal</option>
                <option value="LOGICAL">Logical</option>
                <option value="TECHNICAL">Technical (CS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Statement</label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. What is the average time complexity of quicksort?"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option A</label>
              <input
                required
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option B</label>
              <input
                required
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option C</label>
              <input
                required
                type="text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option D</label>
              <input
                required
                type="text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Answer</label>
              <select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-bold text-indigo-700"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Concept Explanation</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why the answer is correct..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? "Saving..." : "Save Question"}
            </button>
          </div>
        </form>
      )}

      {/* Filter tab bar */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "QUANTITATIVE", "VERBAL", "LOGICAL", "TECHNICAL"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {questions.length} Question{questions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-5 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {q.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">#{idx + 1}</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900">{q.text}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-600">
                      <div className={q.answer === "A" ? "font-bold text-emerald-700" : ""}>A: {q.optionA}</div>
                      <div className={q.answer === "B" ? "font-bold text-emerald-700" : ""}>B: {q.optionB}</div>
                      <div className={q.answer === "C" ? "font-bold text-emerald-700" : ""}>C: {q.optionC}</div>
                      <div className={q.answer === "D" ? "font-bold text-emerald-700" : ""}>D: {q.optionD}</div>
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        Rationale: {q.explanation}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
