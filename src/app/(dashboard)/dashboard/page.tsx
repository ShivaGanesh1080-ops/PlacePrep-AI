"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Building2,
  TrendingUp,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  Target,
  Users,
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
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> AI Placement Readiness Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {data?.userName || "Engineer"}!
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            {stats.testsTaken === 0
              ? "Your profile is set up. Take your first aptitude test or try a mock technical round to begin calibrating your placement readiness score."
              : `You have completed ${stats.testsTaken} assessment round${stats.testsTaken > 1 ? "s" : ""} with an average score of ${stats.avgScore}%. Keep practicing to stay placement-ready!`}
          </p>
        </div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aptitude Tests</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.testsTaken}</div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            {stats.testsTaken === 0 ? "No rounds taken yet" : `${stats.testsTaken} practice rounds completed`}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.testsTaken === 0 ? "N/A" : `${stats.avgScore}%`}
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            {stats.testsTaken === 0 ? "Take a test to calibrate" : "Across all completed attempts"}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Prep AI Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{data?.readinessScore ?? 0}%</div>
          <span className="text-[11px] font-medium text-indigo-600 mt-1 block">
            {(data?.readinessScore ?? 0) >= 60 ? "Calibrated from your prep activity" : "Profile & test activity score"}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mock Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.interviewSessions}</div>
          <span className="text-[11px] font-medium text-purple-600 mt-1 block">
            {stats.interviewSessions === 0 ? "No sessions completed" : `${stats.interviewSessions} technical & HR sessions`}
          </span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Score Trajectory</h3>
              <p className="text-xs text-slate-500">Aptitude assessment progress over time</p>
            </div>
            {trendData.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                {trendData.length} Recent Tests
              </span>
            )}
          </div>

          {trendData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="test" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <ClipboardCheck className="w-10 h-10 text-indigo-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Assessment Data Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Complete your first aptitude test to plot your score trajectory across Quantitative, Verbal, Logical, and Technical domains.
              </p>
              <Link
                href="/tests"
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
              >
                Start First Test <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Category Strength */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Domain Competence</h3>
              <p className="text-xs text-slate-500">Average score breakdown by test category</p>
            </div>
            {hasCategoryActivity && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                Verified
              </span>
            )}
          </div>

          {hasCategoryActivity ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Target className="w-10 h-10 text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Domain Calibration Pending</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Practice any aptitude round to benchmark your strengths across Quantitative, Verbal, Logical, and Technical domains.
              </p>
              <Link
                href="/tests"
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
              >
                Calibrate Domains <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Launch Hub */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Placement Preparation Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/copilot"
              className="group p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 hover:shadow-md transition flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-sm">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  Prep AI Assistant <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Ask DSA doubts, request code solutions, or practice placement rounds.
                </p>
              </div>
            </Link>

            <Link
              href="/tests"
              className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  Aptitude Rounds <ArrowRight className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Practice Quantitative, Verbal, Logical and CS Technical MCQs.
                </p>
              </div>
            </Link>

            <Link
              href="/interview"
              className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-400 hover:shadow-md transition flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  AI Mock Interview <ArrowRight className="w-3.5 h-3.5 text-purple-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Simulate technical & HR rounds with instant grading feedback.
                </p>
              </div>
            </Link>

            <Link
              href="/resume"
              className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  ATS Resume Scanner <ArrowRight className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Get ATS compatibility scores and targeted keyword recommendations.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Recent Milestones</h3>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            {data?.activities && data.activities.length > 0 ? (
              data.activities.map((act, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                    {act.type === "TEST" ? "📝" : act.type === "RESUME" ? "📄" : "🎤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">{act.title}</div>
                    <div className="text-slate-500 text-[11px] truncate">{act.subtitle}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(act.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-slate-700">No Activity Recorded Yet</div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Take an aptitude test, complete an AI mock interview, or scan your resume to track your genuine progress here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
