"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Building2,
  HelpCircle,
  TrendingUp,
  Settings,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AdminStats {
  totalStudents: number;
  totalTestsTaken: number;
  totalCompaniesListed: number;
  totalQuestions: number;
  averageScore: number;
  categoryBreakdown: { name: string; count: number }[];
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    if (session?.user?.role === "ADMIN") {
      loadStats();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <ShieldAlert className="w-14 h-14 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Placement Officer / Admin Access Only</h2>
        <p className="text-xs text-slate-500 mt-2">
          Your current account does not have administrative privileges. Please log in with an administrator credential.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
        >
          Return to Student Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            Placement Cell Administration
          </h1>
          <p className="text-slate-600 mt-1">
            Manage question banks, campus recruitment listings, and student performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            Manage Question Bank
          </Link>
          <Link
            href="/admin/companies"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition"
          >
            Manage Companies
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalStudents || 0}</div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Active platform candidates</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aptitude Tests Taken</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalTestsTaken || 0}</div>
          <span className="text-[11px] font-medium text-emerald-600 mt-1 block">
            Avg Score: {stats?.averageScore || 0}%
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Partner Companies</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalCompaniesListed || 0}</div>
          <span className="text-[11px] font-medium text-blue-600 mt-1 block">Active drive listings</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Question Bank</span>
            <HelpCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalQuestions || 0}</div>
          <span className="text-[11px] font-medium text-purple-600 mt-1 block">Curated placement MCQs</span>
        </div>
      </div>

      {/* Charts & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Test Participation by Category</h3>
              <p className="text-xs text-slate-500">Distribution of aptitude attempts across domains</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Administration Portals</h3>

          <Link
            href="/admin/questions"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition block group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">Manage Placement MCQs</span>
              <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add new questions, customize answer explanations, and configure difficulty tags for test rounds.
            </p>
          </Link>

          <Link
            href="/admin/companies"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition block group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">Manage Placement Drives</span>
              <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Publish visiting tier-1 tech recruiters, set salary packages (LPA), define CGPA cutoffs, and track candidate applications.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
