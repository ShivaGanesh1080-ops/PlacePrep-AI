"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calculator,
  BookOpen,
  Puzzle,
  Code,
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Bot,
  X,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

interface CategoryStats {
  totalQuestions: number;
  bestScore: number | null;
}

interface OverallStats {
  totalTests: number;
  averageScore: number;
  bestCategory: string | null;
  recentAttempts: {
    id: string;
    category: string;
    score: number;
    total: number;
    createdAt: string;
  }[];
  categoryStats: Record<string, CategoryStats>;
}

const categories: CategoryInfo[] = [
  {
    slug: "QUANTITATIVE",
    name: "Quantitative Aptitude",
    description: "Number series, percentages, algebra, and more",
    icon: <Calculator className="w-7 h-7" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    iconBg: "bg-blue-100",
  },
  {
    slug: "VERBAL",
    name: "Verbal Ability",
    description: "Reading comprehension, grammar, vocabulary",
    icon: <BookOpen className="w-7 h-7" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    iconBg: "bg-emerald-100",
  },
  {
    slug: "LOGICAL",
    name: "Logical Reasoning",
    description: "Patterns, sequences, and logical deductions",
    icon: <Puzzle className="w-7 h-7" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200 hover:border-purple-400",
    iconBg: "bg-purple-100",
  },
  {
    slug: "TECHNICAL",
    name: "Technical (CS)",
    description: "Data structures, algorithms, OS, DBMS, networking",
    icon: <Code className="w-7 h-7" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200 hover:border-amber-400",
    iconBg: "bg-amber-100",
  },
];

export default function TestsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Difficulty selection modal state
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("MEDIUM");

  // AI Test Generator state
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState<{
    category: string;
    count: number;
    topic: string;
  } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/tests/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load test stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  async function handleGenerateTest(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setGeneratedInfo(null);
    try {
      const res = await fetch("/api/tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedInfo({
          category: data.category,
          count: data.count,
          topic: data.topic,
        });
      }
    } catch (err) {
      console.error("Failed to generate test:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Aptitude Tests</h1>
          <p className="text-slate-600 mt-1">
            Practice timed placement aptitude rounds, calibrate your score, or generate fresh test papers on demand with Prep AI.
          </p>
        </div>

        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-xs hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 transition self-start"
        >
          <Sparkles className="w-4 h-4" />
          {showGenerator ? "Hide Generator" : "Generate Custom Test with AI"}
        </button>
      </div>

      {/* AI Test Generator Banner / Form */}
      {showGenerator && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-300" /> Powered by Prep AI Engine
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">On-Demand Placement Test Synthesizer</h2>
          <p className="text-indigo-200 text-xs mt-1 max-w-2xl leading-relaxed">
            Need to practice a specific topic like <em>Dynamic Programming</em>, <em>PostgreSQL Indexing</em>, <em>React Hooks</em>, or <em>Operating System Memory Paging</em>? Type the topic below and Prep AI will generate a brand new set of verified MCQs.
          </p>

          <form onSubmit={handleGenerateTest} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-indigo-200 mb-1">
                Topic or Concept
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees, SQL Transactions, Probability..."
                className="w-full text-xs p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-indigo-200 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-800 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={generating || !topic.trim()}
                className="w-full py-3 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Generate {count} MCQs
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success card if test generated */}
          {generatedInfo && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-100">
                    Generated {generatedInfo.count} New MCQs for &quot;{generatedInfo.topic}&quot;!
                  </h4>
                  <p className="text-xs text-emerald-300">
                    Added to your {generatedInfo.category} question pool with full answer keys and concept rationales.
                  </p>
                </div>
              </div>

              <Link
                href={`/tests/${generatedInfo.category.toLowerCase()}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-md transition flex items-center gap-2 shrink-0"
              >
                Take This Test Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const catStat = stats?.categoryStats?.[cat.slug];
          const bestScore = catStat?.bestScore;

          return (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedDifficulty("MEDIUM");
              }}
              className={`block w-full text-left p-6 rounded-2xl border bg-white ${cat.borderColor} shadow-sm hover:shadow-md transition-all group cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${cat.iconBg} ${cat.color}`}>
                  {cat.icon}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[11px] font-semibold text-slate-600 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition">
                  <span>Select Level</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  <strong>{catStat?.totalQuestions || 30}</strong> questions
                </span>
                <span>•</span>
                <span>
                  Best:{" "}
                  {bestScore !== null && bestScore !== undefined ? (
                    <strong className="text-emerald-600 font-bold">{bestScore}%</strong>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Difficulty Level Selection Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 relative">
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Step 1: Choose Practice Benchmark
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {selectedCategory.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select the question difficulty calibrated to your target recruitment round:
              </p>
            </div>

            {/* Level Cards */}
            <div className="space-y-3">
              {[
                {
                  id: "EASY",
                  title: "Easy Level (Foundational)",
                  desc: "Core speed-math, formula recall, and basic patterns.",
                  target: "TCS, Infosys, Wipro, Cognizant, Accenture (Mass Recruiters)",
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  dot: "bg-emerald-500",
                },
                {
                  id: "MEDIUM",
                  title: "Medium Level (Standard Placement)",
                  desc: "Multi-step logic, intermediate algebra, algorithm tracing.",
                  target: "Amazon, Oracle, Flipkart, Swiggy, FinTech Roles",
                  badge: "bg-amber-50 text-amber-700 border-amber-200",
                  dot: "bg-amber-500",
                  recommended: true,
                },
                {
                  id: "HARD",
                  title: "Hard Level (Advanced / Tier-1)",
                  desc: "Tricky edge cases, complex puzzles, advanced data structures.",
                  target: "Google, Microsoft, Tower Research, 15+ LPA Benchmark",
                  badge: "bg-red-50 text-red-700 border-red-200",
                  dot: "bg-red-500",
                },
                {
                  id: "ALL",
                  title: "All Levels (Mixed Placement Paper)",
                  desc: "Balanced mock simulation covering Easy (30%), Medium (50%), and Hard (20%).",
                  target: "Comprehensive Mock Exam Simulation",
                  badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  dot: "bg-indigo-500",
                },
              ].map((lvl) => {
                const isSelected = selectedDifficulty === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setSelectedDifficulty(lvl.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-slate-900">{lvl.title}</span>
                        {lvl.recommended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{lvl.desc}</p>
                      <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
                        <span>Target: <strong className="text-slate-700">{lvl.target}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                ⏱️ 10 Questions • Timed Round
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const slug = selectedCategory.slug.toLowerCase();
                    const diff = selectedDifficulty;
                    setSelectedCategory(null);
                    router.push(`/tests/${slug}?difficulty=${diff}`);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition flex items-center gap-2"
                >
                  Start Practice Test <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Overall Performance Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Total Tests Taken</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalTests ?? 0}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Average Score</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {stats?.totalTests ? `${stats.averageScore}%` : "N/A"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Strongest Domain</span>
            </div>
            <p className="text-lg font-bold text-slate-900 truncate">
              {stats?.bestCategory ? stats.bestCategory : "Take a test to calibrate"}
            </p>
          </div>
        </div>

        {/* Recent Attempts */}
        {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Recent Test Attempts
            </h3>
            <div className="space-y-2">
              {stats.recentAttempts.map((attempt) => {
                const pct = Math.round((attempt.score / (attempt.total || 1)) * 100);
                return (
                  <Link
                    key={attempt.id}
                    href={`/tests/result/${attempt.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{attempt.category}</span>
                      <span className="text-slate-400">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-600">
                        {attempt.score}/{attempt.total}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          pct >= 80
                            ? "bg-emerald-100 text-emerald-800"
                            : pct >= 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center py-4">
            <p className="text-xs text-slate-400">
              No test attempts recorded yet. Select any category above or use the AI Generator to take your first test!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
