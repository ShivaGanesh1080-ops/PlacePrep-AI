"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  X,
  Loader2,
  Target,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Clock,
  Brain,
  Plus,
  CheckCircle2,
} from "lucide-react";

interface CareerResult {
  title: string;
  match: number;
  description: string;
  skills: string[];
  roadmap: string[];
}

interface Recommendation {
  id: string;
  careers: CareerResult[];
  skillGaps: string[];
  summary: string;
  createdAt: string;
}

const BRANCH_OPTIONS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "AIML"];
const INTEREST_OPTIONS = [
  "Web Dev",
  "Mobile Dev",
  "AI/ML",
  "Data Science",
  "Cloud",
  "Cybersecurity",
  "DevOps",
  "Blockchain",
  "IoT",
  "Game Dev",
];

export default function CareerPage() {
  const { data: session } = useSession();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [cgpa, setCgpa] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [strengthInput, setStrengthInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [previousRecs, setPreviousRecs] = useState<Recommendation[]>([]);
  const [loadingPrevious, setLoadingPrevious] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreviousRecommendations();
    loadProfileDefaults();
  }, []);

  async function loadProfileDefaults() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.cgpa && !cgpa) setCgpa(String(data.cgpa));
        if (data.branch && !branch) setBranch(data.branch);
        if (Array.isArray(data.skills) && data.skills.length > 0 && skills.length === 0) {
          setSkills(data.skills);
        }
        if (Array.isArray(data.interests) && data.interests.length > 0 && interests.length === 0) {
          setInterests(data.interests);
        }
      }
    } catch {}
  }

  async function fetchPreviousRecommendations() {
    try {
      const res = await fetch("/api/career/recommend");
      if (res.ok) {
        const data = await res.json();
        setPreviousRecs(data);
      }
    } catch (err) {
      console.error("Failed to fetch previous recommendations:", err);
    } finally {
      setLoadingPrevious(false);
    }
  }

  function addSkill() {
    if (skillInput.trim()) {
      const newSkill = skillInput.trim();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput("");
      setFormError(null);
    }
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function addStrength() {
    if (strengthInput.trim()) {
      const newStrength = strengthInput.trim();
      if (!strengths.includes(newStrength)) {
        setStrengths([...strengths, newStrength]);
      }
      setStrengthInput("");
    }
  }

  function handleStrengthKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addStrength();
    }
  }

  function removeStrength(strength: string) {
    setStrengths(strengths.filter((s) => s !== strength));
  }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit() {
    setFormError(null);

    // Auto-commit whatever the student typed into the input boxes
    let finalSkills = [...skills];
    if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
      finalSkills.push(skillInput.trim());
      setSkills(finalSkills);
      setSkillInput("");
    }

    let finalStrengths = [...strengths];
    if (strengthInput.trim() && !finalStrengths.includes(strengthInput.trim())) {
      finalStrengths.push(strengthInput.trim());
      setStrengths(finalStrengths);
      setStrengthInput("");
    }

    // Validation
    if (finalSkills.length === 0) {
      setFormError("Please enter at least one technical skill (e.g. Python, Java, React).");
      return;
    }
    if (!cgpa) {
      setFormError("Please enter your current CGPA.");
      return;
    }
    if (!branch) {
      setFormError("Please select your engineering branch.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/career/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: finalSkills,
          interests,
          cgpa: parseFloat(cgpa),
          branch,
          strengths: finalStrengths,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        fetchPreviousRecommendations();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to generate recommendations. Please try again.");
      }
    } catch (err) {
      console.error("Error generating recommendations:", err);
      setFormError("Network error contacting AI. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getMatchColor(match: number) {
    if (match >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (match >= 60) return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-red-100 text-red-700 border-red-300";
  }

  function getMatchBg(match: number) {
    if (match >= 80) return "bg-emerald-500";
    if (match >= 60) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-600" />
          AI Career Pathway Recommendation
        </h1>
        <p className="text-slate-600 mt-1">
          Ollama analyzes your engineering branch, CGPA, and technical skillset to map your optimal placement trajectories.
        </p>
      </div>

      {/* Main Grid: Form on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Candidate Profile Inputs
            </h2>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Branch & CGPA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 9.3"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Technical Skills Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technical Skills (Type & Press Enter or Add)
              </label>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. Python, SQL, React, DSA..."
                  className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Strengths
              </label>

              {strengths.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {strengths.map((st) => (
                    <span
                      key={st}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      {st}
                      <button
                        type="button"
                        onClick={() => removeStrength(st)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={strengthInput}
                  onChange={(e) => setStrengthInput(e.target.value)}
                  onKeyDown={handleStrengthKeyDown}
                  placeholder="e.g. Problem Solving, Fast Learner..."
                  className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addStrength}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Interest Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Domain Interests
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        selected
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Ollama...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get AI Recommendations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <h3 className="text-base font-bold text-slate-900">Ollama is analyzing your profile</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Comparing your CGPA, branch, and technical strengths against 50+ placement roles and computing custom roadmaps...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Strategic Placement Assessment
                </h3>
                <p className="text-xs text-indigo-900 leading-relaxed">{result.summary}</p>
              </div>

              {/* Skills Gaps Card */}
              {result.skillGaps && result.skillGaps.length > 0 && (
                <div className="bg-white rounded-3xl border border-amber-200 bg-amber-50/20 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    High-Priority Skill Gaps to Bridge
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skillGaps.map((gap, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Career Tracks */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Top Recommended Career Paths
                </h3>

                {result.careers.map((career, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{career.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {career.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border ${getMatchColor(
                            career.match
                          )}`}
                        >
                          {career.match}% Match
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getMatchBg(
                          career.match
                        )}`}
                        style={{ width: `${career.match}%` }}
                      />
                    </div>

                    {/* Required Skills */}
                    {career.skills && career.skills.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Target Core Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {career.skills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Roadmap */}
                    {career.roadmap && career.roadmap.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Placement Preparation Roadmap:
                        </span>
                        <div className="space-y-1.5">
                          {career.roadmap.map((step, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-start gap-2 text-xs text-slate-700"
                            >
                              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                {rIdx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Recommendations Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Fill in your technical skills and academic details on the left, then click <strong>Get AI Recommendations</strong> to run the placement analysis.
              </p>
            </div>
          )}

          {/* Previous Recommendations History */}
          {previousRecs.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Previous Recommendations History
              </h3>

              <div className="space-y-2">
                {previousRecs.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setResult(rec)}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        Analysis from {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                      <p className="text-slate-500 text-[11px] truncate max-w-md mt-0.5">
                        Top Match: {rec.careers?.[0]?.title || "Full Stack Engineer"} (
                        {rec.careers?.[0]?.match || 90}%)
                      </p>
                    </div>

                    <span className="text-indigo-600 font-bold flex items-center gap-1">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
