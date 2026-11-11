"use client";

import { useState, useEffect, useRef } from "react";
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
  UploadCloud,
  FileCode,
  FileType,
  Image as ImageIcon,
  X,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  RefreshCw,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

interface SectionReview {
  score: number;
  feedback: string;
}

interface BulletRewrite {
  original: string;
  rewritten: string;
  reason: string;
}

interface AnalysisResult {
  score: number;
  atsScore: number;
  roleMatchScore?: number;
  targetRole?: string;
  wordCount?: number;
  summary: string;
  foundKeywords?: string[];
  missingKeywords?: string[];
  bulletRewrites?: BulletRewrite[];
  sections: {
    contact?: SectionReview;
    education?: SectionReview;
    experience?: SectionReview;
    skills?: SectionReview;
    projects?: SectionReview;
    formatting?: SectionReview;
  };
  strengths?: string[];
  improvements: string[];
  parsedFrom?: "pdf" | "docx" | "image" | "text";
  extractedPreview?: string;
  fileName?: string;
}

interface SavedAnalysis {
  id: string;
  score: number;
  feedback: string;
  resumeText: string;
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

const TARGET_ROLES = [
  "Software Development Engineer (Full Stack)",
  "Backend SDE-1",
  "Frontend Engineer",
  "AI / ML Systems Engineer",
  "DevOps / Cloud Architect",
];

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
  const [inputMode, setInputMode] = useState<"file" | "text">("file");

  // Single Resume Analyzer State
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [resumeText, setResumeText] = useState("");
  const [fileData, setFileData] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
    previewUrl?: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Scanning timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setElapsedSeconds(0);
      setScanStep(1);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= 2 && next < 4) setScanStep(2);
          else if (next >= 4 && next < 7) setScanStep(3);
          else if (next >= 7) setScanStep(4);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

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

  function handleFileSelect(file: File) {
    setErrorMessage(null);
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage("File exceeds 12MB limit. Please upload a smaller document.");
      return;
    }

    const reader = new FileReader();

    // Plain text files
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.onload = () => {
        const text = reader.result as string;
        setResumeText(text);
        setFileData({
          name: file.name,
          size: file.size,
          type: "text/plain",
          base64: Buffer.from(text).toString("base64"),
        });
      };
      reader.readAsText(file);
      return;
    }

    // Binary documents: PDF, DOCX, Images
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      const isImg = file.type.startsWith("image/");

      setFileData({
        name: file.name,
        size: file.size,
        type: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
        base64,
        previewUrl: isImg ? dataUrl : undefined,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleClearFile() {
    setFileData(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyze() {
    setErrorMessage(null);

    const hasFile = !!fileData?.base64;
    const hasText = !!resumeText.trim();

    if (!hasFile && !hasText) {
      setErrorMessage("Please upload a resume file (PDF, DOCX, Image) or paste your resume text.");
      return;
    }

    setLoading(true);

    try {
      const payload: {
        targetRole: string;
        fileData?: {
          base64: string;
          mimeType: string;
          fileName: string;
        };
        resumeText?: string;
      } = {
        targetRole: selectedRole,
      };

      if (hasFile && fileData) {
        payload.fileData = {
          base64: fileData.base64,
          mimeType: fileData.type,
          fileName: fileData.name,
        };
      } else {
        payload.resumeText = resumeText.trim();
      }

      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setResult(data);
      fetchHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze resume.";
      setErrorMessage(msg);
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadPastScan(item: SavedAnalysis) {
    try {
      const parsed = JSON.parse(item.feedback);
      setResult(parsed);
      if (item.resumeText) {
        setResumeText(item.resumeText);
      }
    } catch (err) {
      console.error("Failed to parse saved scan:", err);
    }
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  // Multi-Candidate Sorter Handlers
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

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md font-semibold">
              Real-Time Document Intelligence
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-semibold">
              PDF • DOCX • Image • Text
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Resume Intelligence &amp; ATS Recruiter Scanner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multimodal document parsing, role-calibrated technical keyword density audits, and STAR bullet point rewrites.
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 self-start shrink-0">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === "analyze"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Deep ATS Scan
          </button>
          <button
            onClick={() => setActiveTab("sort")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === "sort"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cohort Sorter
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE DEEP RESUME ANALYZER */}
      {activeTab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Input Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Target Role Selector Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  Target Placement Role
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Calibrates Keywords</span>
              </label>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer text-slate-900"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Mode Tabs & Upload Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "file"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "text"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    Plain Text
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode("text");
                    setResumeText(SAMPLE_RESUME);
                    setFileData(null);
                    setErrorMessage(null);
                  }}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Load Shiva&apos;s Sample
                </button>
              </div>

              {/* Mode A: Drag & Drop File Upload */}
              {inputMode === "file" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {!fileData ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                        isDragging
                          ? "border-indigo-500 bg-indigo-50/40"
                          : "border-slate-200/90 hover:border-indigo-400 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Click to upload or drag &amp; drop
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          PDF, DOCX, PNG, JPG, or WebP (up to 12MB)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                          .pdf
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                          .docx
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                          .png/.jpg
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Attached File Card */
                    <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            {fileData.type.includes("pdf") ? (
                              <FileType className="w-5 h-5" />
                            ) : fileData.type.startsWith("image/") ? (
                              <ImageIcon className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {fileData.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {formatBytes(fileData.size)} • Ready for scan
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Preview thumbnail if available */}
                      {fileData.previewUrl && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-36 bg-slate-900/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fileData.previewUrl}
                            alt="Resume preview"
                            className="w-full object-cover max-h-36"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Plain Text Paste */}
              {inputMode === "text" && (
                <div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste plain-text resume here with Education, Skills, Projects, and Work Experience..."
                    rows={13}
                    className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                    <span>
                      {resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words` : "No text pasted"}
                    </span>
                    {resumeText && (
                      <button
                        type="button"
                        onClick={() => setResumeText("")}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Clear text
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Analyze CTA Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || (!fileData && !resumeText.trim())}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning Document ({elapsedSeconds}s)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Real-Time ATS Intelligence Scan
                  </>
                )}
              </button>

              {/* Interactive Multi-Stage Scanning Progress Indicator */}
              {loading && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-indigo-600" />
                      Stage {scanStep} of 4:
                    </span>
                    <span className="font-mono text-indigo-600">{elapsedSeconds}s elapsed</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {scanStep === 1 && "Extracting text tokens from document structure..."}
                    {scanStep === 2 && "Scanning ATS parser headers, contact links, and sections..."}
                    {scanStep === 3 && `Benchmarking keyword density against ${selectedRole}...`}
                    {scanStep >= 4 && "Critiquing project impact & generating STAR line rewrites..."}
                  </p>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(scanStep / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Past Analyses Drawer */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Recent Scans
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {history.length} saved
                  </span>
                </div>

                <div className="space-y-1.5">
                  {history.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleLoadPastScan(item)}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600">
                          Scan on {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Score: {item.score}/100 • Click to load
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white border border-slate-200 text-slate-800 shrink-0">
                        {item.score}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Real-Time Results Matrix */}
          <div className="lg:col-span-7 space-y-5">
            {result ? (
              <>
                {/* 1. Header Score Gauges */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Overall Quality */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col items-center text-center">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Overall Score
                    </span>
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center text-xl font-bold font-mono text-indigo-700 bg-indigo-50/40">
                      {result.score}%
                    </div>
                    <span className="text-[11px] text-slate-600 mt-2 font-medium">Recruiter Caliber</span>
                  </div>

                  {/* ATS Parseability */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col items-center text-center">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      ATS Pass Rate
                    </span>
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xl font-bold font-mono text-emerald-700 bg-emerald-50/40">
                      {result.atsScore}%
                    </div>
                    <span className="text-[11px] text-slate-600 mt-2 font-medium">Parser Friendly</span>
                  </div>

                  {/* Target Role Match */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col items-center text-center">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Role Match
                    </span>
                    <div className="w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center text-xl font-bold font-mono text-blue-700 bg-blue-50/40">
                      {result.roleMatchScore || Math.round(result.score * 0.95)}%
                    </div>
                    <span className="text-[11px] text-slate-600 mt-2 font-medium truncate max-w-[100px]">
                      {result.targetRole?.split(" ")[0] || "Target"}
                    </span>
                  </div>
                </div>

                {/* 2. Executive Recruiter Summary */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Executive Recruiter Critique
                    </h3>
                    {result.parsedFrom && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        Extracted via {result.parsedFrom}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">{result.summary}</p>
                </div>

                {/* 3. Technical Keywords Matrix (Found vs Missing) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                        Technical Keyword Density Matrix
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Benchmarked against {result.targetRole || selectedRole} selection criteria
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Found Keywords */}
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Keywords Detected ({result.foundKeywords?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.foundKeywords && result.foundKeywords.length > 0 ? (
                          result.foundKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium"
                            >
                              ✓ {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No specific technical keywords recognized.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    {result.missingKeywords && result.missingKeywords.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 mb-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          High-Value Missing Keywords ({result.missingKeywords.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-medium"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. STAR / XYZ Formula Bullet-by-Bullet Line Rewriters */}
                {result.bulletRewrites && result.bulletRewrites.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        High-Impact Line Rewrites (STAR / XYZ Formula)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Accomplished [X], as measured by [Y], by doing [Z]. Click copy to replace in your resume.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {result.bulletRewrites.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                        >
                          <div>
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                              Original Line:
                            </span>
                            <p className="text-xs font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 mt-1">
                              &ldquo;{item.original}&rdquo;
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-600">
                                Recruiter-Grade Rewrite:
                              </span>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.rewritten, idx)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy Rewrite
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs font-medium text-slate-900 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200/80">
                              {item.rewritten}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 italic">
                            <span className="font-semibold text-slate-600">Recruiter rationale:</span> {item.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Section Breakdown Analysis */}
                {result.sections && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                    <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Section-by-Section Scoring &amp; Audits
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(result.sections).map(([key, sec]) => {
                        if (!sec) return null;
                        return (
                          <div
                            key={key}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 capitalize">
                                {key}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-slate-700 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                                {sec.score}/100
                              </span>
                            </div>

                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  sec.score >= 85
                                    ? "bg-emerald-500"
                                    : sec.score >= 75
                                    ? "bg-indigo-600"
                                    : "bg-amber-500"
                                }`}
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

                {/* 6. Strengths & High-Priority Action Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  {result.strengths && result.strengths.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2.5">
                      <h3 className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Strengths
                      </h3>
                      <div className="space-y-1.5">
                        {result.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.improvements && result.improvements.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2.5">
                      <h3 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        High-Priority Fixes
                      </h3>
                      <div className="space-y-1.5">
                        {result.improvements.map((imp, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Empty State Prompt */
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Ready for Real-Time Resume Scan
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Upload your resume in <strong>PDF, DOCX, or Image</strong> format (or paste plain text) on the left and select your target engineering role to initiate a real-time recruiter ATS audit.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME SCREENING & JOB MATCH SORTER */}
      {activeTab === "sort" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Target Role / Job Description
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the requirements or selection criteria for the placement drive (e.g. Google SDE, Amazon, or custom JD).
                </p>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              placeholder="Paste job description requirements, qualifications, and tech stack here..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
          </div>

          {/* Candidate Resumes List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Candidate Cohort Resumes ({candidates.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add multiple candidate resumes to rank and screen them automatically against the JD.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCandidate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Candidate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={cand.name}
                      onChange={(e) => handleUpdateCandidate(cand.id, "name", e.target.value)}
                      placeholder={`Candidate ${idx + 1}`}
                      className="text-xs font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none pb-0.5 w-3/4"
                    />

                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(cand.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={cand.resumeText}
                    onChange={(e) => handleUpdateCandidate(cand.id, "resumeText", e.target.value)}
                    placeholder="Paste resume text or key skills..."
                    rows={6}
                    className="w-full text-[11px] font-mono p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-slate-800"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSortResumes}
                disabled={sorting || candidates.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
              >
                {sorting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ranking Candidates with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Screen &amp; Rank Cohort
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sorter Results */}
          {sortedResults && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Ranked Candidates ({sortedResults.length})
              </h2>

              <div className="space-y-3">
                {sortedResults.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                          #{cand.ranking}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{cand.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            cand.verdict === "STRONG MATCH"
                              ? "bg-emerald-100 text-emerald-800"
                              : cand.verdict === "POTENTIAL MATCH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {cand.verdict}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{cand.summary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-bold font-mono text-indigo-700">
                        {cand.matchScore}%
                      </span>
                      <p className="text-[10px] text-slate-400">Match Score</p>
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
