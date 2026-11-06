"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Filter,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle,
  ExternalLink,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  role: string;
  package: string;
  cgpaCutoff: number;
  description: string | null;
  eligibility: string | null;
  visitDate: string | null;
  status: string;
  _count?: {
    applications: number;
  };
}

interface Application {
  id: string;
  companyId: string;
  status: "INTERESTED" | "APPLIED" | "SHORTLISTED" | "SELECTED" | "REJECTED";
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      let url = `/api/companies?status=${statusFilter}`;
      if (minCgpa) url += `&minCgpa=${minCgpa}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const [compRes, appRes] = await Promise.all([
        fetch(url),
        fetch("/api/companies/apply"),
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        setCompanies(compData);
      }

      if (appRes.ok) {
        const appData: Application[] = await appRes.json();
        const map: Record<string, string> = {};
        appData.forEach((a) => {
          map[a.companyId] = a.status;
        });
        setApplications(map);
      }
    } catch (err) {
      console.error("Error loading companies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(companyId: string, currentStatus?: string) {
    const nextStatus = !currentStatus ? "INTERESTED" : currentStatus === "INTERESTED" ? "APPLIED" : null;
    if (!nextStatus) return;

    setActionLoading(companyId);
    try {
      const res = await fetch("/api/companies/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, status: nextStatus }),
      });

      if (res.ok) {
        setApplications((prev) => ({
          ...prev,
          [companyId]: nextStatus,
        }));
      }
    } catch (err) {
      console.error("Failed to apply:", err);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredCompanies = companies.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.package.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          Campus Recruitment & Company Tracker
        </h1>
        <p className="text-slate-600 mt-1">
          Explore visiting enterprise tech companies, view eligibility cutoffs, and monitor your application journey.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
            placeholder="Search company, role, package..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Status:</span>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {["All", "Upcoming", "Ongoing", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="text-xs px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Companies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or resetting filters to see scheduled placement drives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((c) => {
            const currentAppStatus = applications[c.id];
            const isProcessing = actionLoading === c.id;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{c.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                        {c.role}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 shrink-0">
                      {c.package}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {c.description || "Top campus recruitment drive with competitive engineering challenges and growth opportunities."}
                  </p>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Min CGPA
                      </span>
                      <span className="font-bold text-slate-800">{c.cgpaCutoff}</span>
                    </div>

                    {c.visitDate && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Drive Date
                        </span>
                        <span className="font-medium text-slate-700">
                          {new Date(c.visitDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Drive Status
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          c.status === "UPCOMING"
                            ? "bg-blue-50 text-blue-700"
                            : c.status === "ONGOING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="mt-5 pt-2">
                  {!currentAppStatus && (
                    <button
                      onClick={() => handleApply(c.id)}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl border border-indigo-600 text-indigo-600 font-semibold text-xs hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Mark Interested"}
                    </button>
                  )}

                  {currentAppStatus === "INTERESTED" && (
                    <button
                      onClick={() => handleApply(c.id, "INTERESTED")}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit Application"}
                    </button>
                  )}

                  {currentAppStatus === "APPLIED" && (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Applied
                    </div>
                  )}

                  {currentAppStatus === "SHORTLISTED" && (
                    <div className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Shortlisted for Round 2!
                    </div>
                  )}

                  {currentAppStatus === "SELECTED" && (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center gap-1.5 border border-emerald-300">
                      🎉 Offered Job
                    </div>
                  )}

                  {currentAppStatus === "REJECTED" && (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-medium text-xs text-center">
                      Not Selected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
