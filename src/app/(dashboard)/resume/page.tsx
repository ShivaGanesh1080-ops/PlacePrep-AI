"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  Loader2,
  Copy,
  Check,
  ArrowUpDown,
  Bot,
  Users,
  Target,
  Plus,
  Trash2,
} from "lucide-react";

interface SectionReview {
  score: number;
  feedback: string;
}

interface AnalysisResult {
  score: number;
  atsScore: number;
  summary: string;
  sections: {
    contact?: SectionReview;
    education?: SectionReview;
    experience?: SectionReview;
    skills?: SectionReview;
    projects?: SectionReview;
    formatting?: SectionReview;
  };
  improvements: string[];
}

interface SavedAnalysis {
  id: string;
  score: number;
  feedback: string;
  createdAt: string;
}

interface CandidateSorterItem {
  id: string;
  name: string;
  resumeText: string;
}

interface SortedCandidateResult {
  name: string;
  matchScore: number;
  ranking: number;
  verdict: "STRONG MATCH" | "POTENTIAL MATCH" | "LOW MATCH";
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}

const SAMPLE_RESUME = `SHIVA GANESH AKKU
Hyderabad, India | +91 9876543210 | shiva@example.com | linkedin.com/in/shivaganesh | github.com/ShivaGanesh1080-ops

EDUCATION
SR University, Warangal — B.Tech Computer Science and Engineering (CSE)
CGPA: 9.52 / 10.0 | Expected Graduation: 2026
Relevant Coursework: Data Structures, Operating Systems, Computer Networks, Database Systems, Cloud Computing

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, C++, SQL
Frameworks/Libraries: Next.js, React, Node.js, Express, Tailwind CSS, Prisma
Databases & Cloud: PostgreSQL, Supabase, Redis, Docker, Git, Google Cloud Platform
Core Concepts: REST APIs, System Design, Distributed Systems, Microservices

PROJECTS
Qordrz — Multi-Tenant QR Commerce Platform | Next.js, Prisma, PostgreSQL, Tailwind
- Architected high-throughput digital ordering engine reducing counter checkout latency by 45%.
- Implemented tenant isolation with atomic SQL transactions and role-based access control.
- Integrated real-time SSE order state updates handling 1,000+ concurrent simulated requests.

Placement Preparation AI Portal | Next.js, Gemini API, SQLite, NextAuth
- Built intelligent career recommendation engine matching candidate skillsets to 50+ tech roles.
- Engineered automated aptitude evaluation testing pipeline with real-time scoring and analytics.

EXPERIENCE
Software Engineering Intern — Tech Solutions Lab (Summer 2024)
- Optimized vector indexing and retrieval latency by 32% using Redis and pgvector.
- Collaborated in cross-functional agile sprints delivering client-facing analytics dashboards.`;

const DEFAULT_JD = `Role: Software Development Engineer - I (Full Stack / Backend)
Requirements:
- Strong proficiency in Data Structures & Algorithms, System Design principles
- Hands-on experience with TypeScript, Next.js / Node.js, and relational databases (PostgreSQL/MySQL)
- Understanding of distributed caching (Redis), RESTful API design, and containerization (Docker)
- Minimum CGPA 7.5+ with B.Tech in CSE / IT or related circuit branches`;

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<"analyze" | "sort">("analyze");

  // Single Resume Analyzer State
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);

  // Multi-Candidate Sorter State
  const [jobDescription, setJobDescription] = useState(DEFAULT_JD);
  const [candidates, setCandidates] = useState<CandidateSorterItem[]>([
    {
      id: "1",
      name: "Shiva Ganesh (Full Stack)",
      resumeText: SAMPLE_RESUME,
    },
    {
      id: "2",
      name: "Candidate B (Python & ML)",
      resumeText: `Candidate B — B.Tech CSE (8.4 CGPA)
Skills: Python, TensorFlow, PyTorch, Pandas, Scikit-Learn, Flask, Docker.
Projects: Image classification using ResNet; predictive churn model with 89% accuracy on Kaggle.
Experience: ML Research Assistant at university AI lab focusing on vision transformer fine-tuning.`,
    },
    {
      id: "3",
      name: "Candidate C (Frontend Junior)",
      resumeText: `Candidate C — B.Tech IT (7.1 CGPA)
Skills: HTML, CSS, JavaScript, basic React, Figma.
Projects: Portfolio website, weather app fetching OpenWeatherMap API, simple calculator.
Looking for junior frontend developer or web design roles.`,
    },
  ]);
  const [sorting, setSorting] = useState(false);
  const [sortedResults, setSortedResults] = useState<SortedCandidateResult[] | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/resume/analyze");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        fetchHistory();
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSortResumes() {
    if (!jobDescription.trim() || candidates.length === 0) return;
    setSorting(true);
    setSortedResults(null);
    try {
      const res = await fetch("/api/resume/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          candidates: candidates.map((c) => ({
            name: c.name,
            resumeText: c.resumeText,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSortedResults(data.sortedCandidates || []);
      }
    } catch (err) {
      console.error("Sorting failed:", err);
    } finally {
      setSorting(false);
    }
  }

  function handleAddCandidate() {
    const newId = String(Date.now());
    setCandidates([
      ...candidates,
      {
        id: newId,
        name: `Candidate ${candidates.length + 1}`,
        resumeText: "",
      },
    ]);
  }

  function handleRemoveCandidate(id: string) {
    setCandidates(candidates.filter((c) => c.id !== id));
  }

  function handleUpdateCandidate(id: string, field: "name" | "resumeText", value: string) {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Resume Intelligence &amp; ATS Scanner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit keyword density against target job descriptions, calculate ATS parseability, and optimize impact metrics.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 self-start">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "analyze"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Single ATS Scan
          </button>
          <button
            onClick={() => setActiveTab("sort")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "sort"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cohort Sorter
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE RESUME ANALYZER */}
      {activeTab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700">
                  Paste Resume Content
                </label>
                <button
                  type="button"
                  onClick={() => setResumeText(SAMPLE_RESUME)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Insert Sample Resume
                </button>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain-text resume here including Education, Technical Skills, Projects, and Work Experience..."
                rows={16}
                className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words` : "Empty input"}
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !resumeText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing with Ollama...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Past Analyses */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  Previous Scans
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-700">
                          Scan on {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-slate-500 text-[11px] truncate max-w-xs">
                          Overall Score: {item.score}%
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-100 text-indigo-700">
                        {item.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-6 space-y-6">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Overall Quality
                    </span>
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-600 flex items-center justify-center text-2xl font-black text-indigo-700 bg-indigo-50/50">
                      {result.score}%
                    </div>
                    <span className="text-xs text-slate-600 mt-2 font-medium">Placement Benchmark</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      ATS Pass Rate
                    </span>
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center text-2xl font-black text-emerald-700 bg-emerald-50/50">
                      {result.atsScore}%
                    </div>
                    <span className="text-xs text-slate-600 mt-2 font-medium">Parser Friendly</span>
                  </div>
                </div>

                <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Executive Evaluation
                  </h3>
                  <p className="text-xs leading-relaxed text-indigo-900">{result.summary}</p>
                </div>

                {result.improvements && result.improvements.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      High-Priority Action Items
                    </h3>
                    <div className="space-y-2.5">
                      {result.improvements.map((imp, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.sections && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Section Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(result.sections).map(([key, sec]) => {
                        if (!sec) return null;
                        return (
                          <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 capitalize">{key}</span>
                              <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800">
                                {sec.score}/100
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all"
                                style={{ width: `${sec.score}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{sec.feedback}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Resume Analyzed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Paste your resume text on the left and click Analyze. We will benchmark it against recruiter ATS filters and provide actionable edits.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME SCREENING & JOB MATCH SORTER */}
      {activeTab === "sort" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Target Role / Job Description
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the requirements or selection criteria for the placement role (e.g. Google SDE, Amazon, or custom JD).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setJobDescription(DEFAULT_JD)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Reset Default SDE-1 JD
              </button>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Candidate list inputs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Candidate Resumes to Screen & Rank ({candidates.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compare candidate resumes side-by-side to sort by qualification and skills alignment.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Candidate
                </button>

                <button
                  type="button"
                  onClick={handleSortResumes}
                  disabled={sorting || candidates.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-100 transition"
                >
                  {sorting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Screening with Ollama...
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="w-4 h-4" /> Screen & Rank Candidates
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cand.name}
                      onChange={(e) => handleUpdateCandidate(cand.id, "name", e.target.value)}
                      placeholder="Candidate Name"
                      className="text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-white flex-1"
                    />

                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(cand.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={cand.resumeText}
                    onChange={(e) => handleUpdateCandidate(cand.id, "resumeText", e.target.value)}
                    rows={8}
                    placeholder="Paste resume text..."
                    className="w-full text-[11px] font-mono p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="text-[10px] text-slate-400">
                    {cand.resumeText.trim() ? `${cand.resumeText.trim().split(/\s+/).length} words` : "Empty"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sorted Results */}
          {sortedResults && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Ollama AI Candidate Ranking & Screening Results
                </h3>
              </div>

              <div className="space-y-4">
                {sortedResults.map((cand, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      idx === 0
                        ? "border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            idx === 0
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{cand.name}</h4>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-0.5 ${
                              cand.verdict === "STRONG MATCH"
                                ? "bg-emerald-100 text-emerald-800"
                                : cand.verdict === "POTENTIAL MATCH"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {cand.verdict}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-semibold block">Match Rating</span>
                          <span className="text-xl font-black text-indigo-700">{cand.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{cand.summary}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="font-bold text-emerald-800 block mb-1">
                          ✓ Strong Matching Qualifications:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.matchedSkills.map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-red-800 block mb-1">
                          ⚠️ Missing / Target Skills:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cand.missingSkills.map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[11px] font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
