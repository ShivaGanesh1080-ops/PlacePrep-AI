"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Building2,
  ArrowRight,
  Loader2,
  Target,
  Code2,
  ChevronRight,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

interface Activity {
  type: string;
  title: string;
  subtitle: string;
  date: string;
}

interface DashboardData {
  userName: string;
  cgpa: number | null;
  branch: string;
  profileCompleteness: number;
  readinessScore: number;
  stats: {
    testsTaken: number;
    avgScore: number;
    interviewSessions: number;
    resumesScanned: number;
  };
  categoryPerformance: { name: string; score: number }[];
  performanceTrend: { test: string; score: number; category: string }[];
  activities: Activity[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const stats = data?.stats || {
    testsTaken: 0,
    avgScore: 0,
    interviewSessions: 0,
    resumesScanned: 0,
  };

  const trendData = data?.performanceTrend || [];
  const categoryData = data?.categoryPerformance || [];
  const hasCategoryActivity = categoryData.some((c) => c.score > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Overview Context Header (Quiet, disciplined, no slop) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-medium">
              SDE-1 Track
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Cycle 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Preparation Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {stats.testsTaken === 0
              ? "Complete baseline rounds in aptitude, code sandbox, and mock interviews to calibrate your readiness index."
              : `Completed ${stats.testsTaken} assessment round${stats.testsTaken > 1 ? "s" : ""} across Quant, Logical, and Technical domains.`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Link
            href="/copilot"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Prep Copilot</span>
          </Link>
          <Link
            href="/tests"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors shadow-2xs"
          >
            <span>Take Test</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid: Strict 4-Card Tabular Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Aptitude rounds</span>
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {stats.testsTaken}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {stats.testsTaken === 0 ? "Target: 10 baseline rounds" : `${stats.testsTaken} completed attempts`}
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Average accuracy</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {stats.testsTaken === 0 ? "—" : `${stats.avgScore}%`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {stats.testsTaken === 0 ? "Pending test submission" : "Across evaluated attempts"}
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Readiness score</span>
            <Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {data?.readinessScore ?? 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {(data?.readinessScore ?? 0) >= 60 ? "Calibrated from prep activity" : "Baseline calibration level"}
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Mock interviews</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {stats.interviewSessions}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {stats.interviewSessions === 0 ? "Target: 3 STAR evaluations" : `${stats.interviewSessions} sessions completed`}
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance Trend */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Score trajectory</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Assessment progress by sequential attempt</p>
            </div>
            {trendData.length > 0 && (
              <span className="text-[11px] font-mono text-slate-500">
                {trendData.length} records
              </span>
            )}
          </div>

          {trendData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="test" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: "#4f46e5", strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <ActivityIcon className="w-7 h-7 text-slate-300 mb-2" />
              <h4 className="text-xs font-semibold text-slate-700">No assessment data yet</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Take an aptitude test to plot your score trajectory across Quant, Logical, and Technical domains.
              </p>
              <Link
                href="/tests"
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition inline-flex items-center gap-1 shadow-2xs"
              >
                <span>Take first test</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Domain Competence */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Domain competence</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Average score distribution across categories</p>
            </div>
            {hasCategoryActivity && (
              <span className="text-[11px] font-mono text-emerald-600">
                Calibrated
              </span>
            )}
          </div>

          {hasCategoryActivity ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <Target className="w-7 h-7 text-slate-300 mb-2" />
              <h4 className="text-xs font-semibold text-slate-700">Domain calibration pending</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Practice across all four categories to establish domain strength benchmarks.
              </p>
              <Link
                href="/tests"
                className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition inline-flex items-center gap-1 shadow-2xs"
              >
                <span>Calibrate domains</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modules Quick Access */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
        <h3 className="text-xs font-semibold text-slate-900 mb-3">
          Placement Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/copilot"
            className="group p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-colors flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Prep Copilot</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                DSA doubts &amp; code runner
              </p>
            </div>
          </Link>

          <Link
            href="/interview"
            className="group p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-colors flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Mock Interview</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                STAR evaluation rubric
              </p>
            </div>
          </Link>

          <Link
            href="/tests"
            className="group p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-colors flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Aptitude Tests</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Timed 3-tier assessments
              </p>
            </div>
          </Link>

          <Link
            href="/resume"
            className="group p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-colors flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Resume Intelligence</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                ATS scoring &amp; JD match
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
