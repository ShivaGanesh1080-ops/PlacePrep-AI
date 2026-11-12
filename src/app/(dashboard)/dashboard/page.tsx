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
  Sparkles,
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
        <Loader2 className="w-6 h-6 animate-spin text-[#7A6658]" />
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
      {/* Overview Context Header (Warm Editorial Framing) */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-[#1E3A5F] bg-[#8EC5FF]/25 border border-[#8EC5FF]/40 px-2.5 py-0.5 rounded-full">
              SDE-1 Track
            </span>
            <span className="text-xs text-[#C4B5A5]">•</span>
            <span className="text-xs font-mono font-medium text-[#7A6658]">
              Cycle 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#382418] tracking-tight">
            Preparation Overview
          </h1>
          <p className="text-xs text-[#7A6658] mt-1 max-w-xl leading-relaxed">
            {stats.testsTaken === 0
              ? "Complete baseline rounds in aptitude, code sandbox, and mock interviews to calibrate your readiness index."
              : `Completed ${stats.testsTaken} assessment round${stats.testsTaken > 1 ? "s" : ""} across Quant, Logical, and Technical domains.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <Link
            href="/copilot"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#382418] hover:bg-[#25170F] text-[#F2E8DA] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#8EC5FF]" />
            <span>Open Prep Copilot</span>
          </Link>
          <Link
            href="/tests"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#FAF6F0] text-[#382418] text-xs font-semibold rounded-xl border border-[#382418]/15 transition-all shadow-2xs cursor-pointer"
          >
            <span>Take Test</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid: Hero Readiness Score & Structured Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Aptitude Rounds */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-4.5 shadow-2xs transition-all hover:border-[#382418]/25">
          <div className="flex items-center justify-between text-[#7A6658] mb-1">
            <span className="text-xs font-semibold text-[#5A4537]">Aptitude rounds</span>
            <ClipboardCheck className="w-4 h-4 text-[#7A6658]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#382418] mt-1.5">
            {stats.testsTaken}
          </div>
          <p className="text-[11px] text-[#7A6658] mt-1 truncate">
            {stats.testsTaken === 0 ? "Target: 10 baseline rounds" : `${stats.testsTaken} completed attempts`}
          </p>
        </div>

        {/* Card 2: Average Accuracy */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-4.5 shadow-2xs transition-all hover:border-[#382418]/25">
          <div className="flex items-center justify-between text-[#7A6658] mb-1">
            <span className="text-xs font-semibold text-[#5A4537]">Average accuracy</span>
            <Target className="w-4 h-4 text-[#7A6658]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#382418] mt-1.5">
            {stats.testsTaken === 0 ? "—" : `${stats.avgScore}%`}
          </div>
          <p className="text-[11px] text-[#7A6658] mt-1 truncate">
            {stats.testsTaken === 0 ? "Pending test submission" : "Across evaluated attempts"}
          </p>
        </div>

        {/* Card 3: HERO Readiness Score (Elevated with Baby Blue Accent) */}
        <div className="bg-gradient-to-br from-[#FFFFFF] via-[#FAF6F0] to-[#EBF4FF] rounded-2xl border-2 border-[#8EC5FF] p-4.5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#1E3A5F]">Readiness score</span>
            <div className="w-6 h-6 rounded-full bg-[#8EC5FF]/30 flex items-center justify-center text-[#1E3A5F]">
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#382418] mt-1.5 flex items-baseline gap-2">
            <span>{data?.readinessScore ?? 0}%</span>
            <span className="text-[10px] font-bold text-[#1E3A5F] bg-[#8EC5FF]/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Optimal
            </span>
          </div>
          <p className="text-[11px] font-medium text-[#1E3A5F] mt-1 truncate">
            {(data?.readinessScore ?? 0) >= 60 ? "Calibrated from prep activity" : "Baseline calibration level"}
          </p>
        </div>

        {/* Card 4: Mock Interviews */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-4.5 shadow-2xs transition-all hover:border-[#382418]/25">
          <div className="flex items-center justify-between text-[#7A6658] mb-1">
            <span className="text-xs font-semibold text-[#5A4537]">Mock interviews</span>
            <MessageSquare className="w-4 h-4 text-[#7A6658]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#382418] mt-1.5">
            {stats.interviewSessions}
          </div>
          <p className="text-[11px] text-[#7A6658] mt-1 truncate">
            {stats.interviewSessions === 0 ? "Target: 3 STAR evaluations" : `${stats.interviewSessions} sessions completed`}
          </p>
        </div>
      </div>

      {/* Analytics Charts with Baby Blue & Espresso Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance Trend */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#382418]/8">
            <div>
              <h3 className="text-xs font-bold text-[#382418]">Score trajectory</h3>
              <p className="text-[11px] text-[#7A6658] mt-0.5">Assessment progress by sequential attempt</p>
            </div>
            {trendData.length > 0 && (
              <span className="text-[11px] font-mono font-medium text-[#7A6658] bg-[#F2E8DA] px-2 py-0.5 rounded-md">
                {trendData.length} records
              </span>
            )}
          </div>

          {trendData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2E8DA" />
                  <XAxis dataKey="test" stroke="#7A6658" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#7A6658" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#382418",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F2E8DA",
                      fontSize: "11px",
                      padding: "6px 12px",
                      boxShadow: "0 4px 12px rgba(56, 36, 24, 0.2)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#382418"
                    strokeWidth={2.5}
                    dot={{ fill: "#8EC5FF", stroke: "#382418", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#8EC5FF", stroke: "#382418" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#382418]/15 rounded-xl bg-[#FAF6F0]/50">
              <ActivityIcon className="w-7 h-7 text-[#C4B5A5] mb-2" />
              <h4 className="text-xs font-semibold text-[#382418]">No assessment data yet</h4>
              <p className="text-[11px] text-[#7A6658] max-w-xs mt-1">
                Take an aptitude test to plot your score trajectory across Quant, Logical, and Technical domains.
              </p>
              <Link
                href="/tests"
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#382418] hover:bg-[#25170F] text-[#F2E8DA] text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Take first test</span>
                <ArrowRight className="w-3 h-3 text-[#8EC5FF]" />
              </Link>
            </div>
          )}
        </div>

        {/* Domain Competence */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#382418]/8">
            <div>
              <h3 className="text-xs font-bold text-[#382418]">Domain competence</h3>
              <p className="text-[11px] text-[#7A6658] mt-0.5">Average score distribution across categories</p>
            </div>
            {hasCategoryActivity && (
              <span className="text-[11px] font-mono font-semibold text-[#1E3A5F] bg-[#8EC5FF]/25 px-2 py-0.5 rounded-md">
                Calibrated
              </span>
            )}
          </div>

          {hasCategoryActivity ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2E8DA" />
                  <XAxis dataKey="name" stroke="#7A6658" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#7A6658" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#382418",
                      border: "none",
                      borderRadius: "8px",
                      color: "#F2E8DA",
                      fontSize: "11px",
                      padding: "6px 12px",
                      boxShadow: "0 4px 12px rgba(56, 36, 24, 0.2)",
                    }}
                  />
                  <Bar dataKey="score" fill="#8EC5FF" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#382418]/15 rounded-xl bg-[#FAF6F0]/50">
              <Target className="w-7 h-7 text-[#C4B5A5] mb-2" />
              <h4 className="text-xs font-semibold text-[#382418]">Domain calibration pending</h4>
              <p className="text-[11px] text-[#7A6658] max-w-xs mt-1">
                Practice across all four categories to establish domain strength benchmarks.
              </p>
              <Link
                href="/tests"
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#382418] hover:bg-[#25170F] text-[#F2E8DA] text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Calibrate domains</span>
                <ArrowRight className="w-3 h-3 text-[#8EC5FF]" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modules Quick Access */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#382418]/10 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-xs font-bold text-[#382418] mb-3">
          Placement Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/copilot"
            className="group p-3.5 rounded-xl border border-[#382418]/10 hover:border-[#382418]/30 hover:bg-[#FAF6F0]/70 transition-all flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F2E8DA] flex items-center justify-center text-[#382418] shrink-0 group-hover:bg-[#8EC5FF]/30 group-hover:text-[#1E3A5F] transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#382418] group-hover:text-[#1E3A5F] transition-colors flex items-center justify-between">
                <span>Prep Copilot</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#7A6658] opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-[#7A6658] mt-0.5 truncate">
                DSA doubts &amp; code runner
              </p>
            </div>
          </Link>

          <Link
            href="/interview"
            className="group p-3.5 rounded-xl border border-[#382418]/10 hover:border-[#382418]/30 hover:bg-[#FAF6F0]/70 transition-all flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F2E8DA] flex items-center justify-center text-[#382418] shrink-0 group-hover:bg-[#8EC5FF]/30 group-hover:text-[#1E3A5F] transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#382418] group-hover:text-[#1E3A5F] transition-colors flex items-center justify-between">
                <span>Mock Interview</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#7A6658] opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-[#7A6658] mt-0.5 truncate">
                STAR evaluation rubric
              </p>
            </div>
          </Link>

          <Link
            href="/tests"
            className="group p-3.5 rounded-xl border border-[#382418]/10 hover:border-[#382418]/30 hover:bg-[#FAF6F0]/70 transition-all flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F2E8DA] flex items-center justify-center text-[#382418] shrink-0 group-hover:bg-[#8EC5FF]/30 group-hover:text-[#1E3A5F] transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#382418] group-hover:text-[#1E3A5F] transition-colors flex items-center justify-between">
                <span>Aptitude Tests</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#7A6658] opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-[#7A6658] mt-0.5 truncate">
                Timed 3-tier assessments
              </p>
            </div>
          </Link>

          <Link
            href="/resume"
            className="group p-3.5 rounded-xl border border-[#382418]/10 hover:border-[#382418]/30 hover:bg-[#FAF6F0]/70 transition-all flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F2E8DA] flex items-center justify-center text-[#382418] shrink-0 group-hover:bg-[#8EC5FF]/30 group-hover:text-[#1E3A5F] transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#382418] group-hover:text-[#1E3A5F] transition-colors flex items-center justify-between">
                <span>Resume Intelligence</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#7A6658] opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-[#7A6658] mt-0.5 truncate">
                ATS scoring &amp; JD match
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
