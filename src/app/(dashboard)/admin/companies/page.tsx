"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Trash2,
  Calendar,
  Briefcase,
  GraduationCap,
  Loader2,
  ArrowLeft,
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

export default function AdminCompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [pkg, setPkg] = useState("");
  const [cgpaCutoff, setCgpaCutoff] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [status, setStatus] = useState("UPCOMING");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCompany(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          package: pkg,
          cgpaCutoff: parseFloat(cgpaCutoff),
          description,
          eligibility,
          visitDate: visitDate || null,
          status,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setName("");
        setRole("");
        setPkg("");
        setCgpaCutoff("");
        setDescription("");
        setEligibility("");
        setVisitDate("");
        loadCompanies();
      }
    } catch (err) {
      console.error("Create company error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCompany(id: string) {
    if (!confirm("Are you sure you want to remove this company?")) return;
    try {
      const res = await fetch(`/api/admin/companies?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete company:", err);
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
            <Building2 className="w-8 h-8 text-indigo-600" />
            Campus Placement Recruiters
          </h1>
          <p className="text-slate-600 mt-1">
            Publish upcoming company campus visits, recruitment rounds, and CTC compensation details.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-sm transition self-start"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Close Form" : "List New Company"}
        </button>
      </div>

      {/* Add Company Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddCompany}
          className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900">List Visiting Enterprise / Startup</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google, Microsoft, Atlassian"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
              <input
                required
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Development Engineer - 1"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CTC Package (LPA)</label>
              <input
                required
                type="text"
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
                placeholder="e.g. 45 LPA"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA Cutoff</label>
              <input
                required
                type="number"
                step="0.1"
                value={cgpaCutoff}
                onChange={(e) => setCgpaCutoff(e.target.value)}
                placeholder="e.g. 7.5"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Visit Date</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities, required skills, interview process..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium"
            />
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
              {submitting ? "Publishing..." : "Publish Company"}
            </button>
          </div>
        </form>
      )}

      {/* Companies List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {companies.length} Listed Recruiter{companies.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {companies.map((c) => (
              <div key={c.id} className="p-5 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {c.package}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> {c.role} • Min CGPA: {c.cgpaCutoff}
                      {c.visitDate && (
                        <span>• Visit: {new Date(c.visitDate).toLocaleDateString()}</span>
                      )}
                    </p>

                    {c.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Applications Received: <strong>{c._count?.applications || 0}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCompany(c.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition"
                    title="Delete company"
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
