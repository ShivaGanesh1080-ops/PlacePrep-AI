"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import {
  User,
  GraduationCap,
  Sparkles,
  Link2,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  X,
  Code,
  Heart,
  TrendingUp,
} from "lucide-react";

const BRANCH_OPTIONS = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML"];
const INTEREST_OPTIONS = [
  "Web Development",
  "Mobile Apps",
  "Machine Learning & AI",
  "Data Science",
  "Cloud & DevOps",
  "Cybersecurity",
  "Systems Architecture",
  "Blockchain",
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");

  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState<number>(3);
  const [cgpa, setCgpa] = useState<string>("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [interests, setInterests] = useState<string[]>([]);

  const [strengths, setStrengths] = useState<string[]>([]);
  const [strengthInput, setStrengthInput] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setRole(data.role || "STUDENT");
          setBranch(data.branch || "CSE");
          setYear(data.year || 3);
          setCgpa(data.cgpa ? String(data.cgpa) : "");
          setSkills(data.skills || []);
          setInterests(data.interests || []);
          setStrengths(data.strengths || []);
          setLinkedinUrl(data.linkedinUrl || "");
          setGithubUrl(data.githubUrl || "");
          setResumeText(data.resumeText || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleAddSkill(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  }

  function handleRemoveSkill(s: string) {
    setSkills(skills.filter((item) => item !== s));
  }

  function handleAddStrength(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && strengthInput.trim()) {
      e.preventDefault();
      if (!strengths.includes(strengthInput.trim())) {
        setStrengths([...strengths, strengthInput.trim()]);
      }
      setStrengthInput("");
    }
  }

  function handleRemoveStrength(s: string) {
    setStrengths(strengths.filter((item) => item !== s));
  }

  function toggleInterest(item: string) {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch,
          year,
          cgpa,
          skills,
          interests,
          strengths,
          linkedinUrl,
          githubUrl,
          resumeText,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let fields = 0;
    if (cgpa) fields += 15;
    if (branch) fields += 10;
    if (skills.length >= 3) fields += 25;
    if (interests.length >= 1) fields += 15;
    if (strengths.length >= 1) fields += 10;
    if (linkedinUrl || githubUrl) fields += 10;
    if (resumeText) fields += 15;
    return Math.min(fields, 100);
  };

  const completeness = calculateCompleteness();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <User className="w-8 h-8 text-indigo-600" />
            Candidate Placement Profile
          </h1>
          <p className="text-slate-600 mt-1">
            Keep your profile updated. Our AI placement model matches this directly to eligible company roles.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-100 transition shrink-0"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Profile
            </>
          )}
        </button>
      </div>

      {/* Profile Completeness Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Profile Readiness Score
          </span>
          <span className="text-indigo-600 font-bold">{completeness}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Form sections */}
      <div className="space-y-6">
        {/* Academic Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Academic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                disabled
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year (Graduating)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (Out of 10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 9.52"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills Tag Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            Technical Skills
          </h2>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-red-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type a skill (e.g. TypeScript, Next.js, PostgreSQL) and hit Enter"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Domain Interests Checkboxes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-indigo-600" />
            Placement Focus Areas & Domains
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INTEREST_OPTIONS.map((item) => {
              const selected = interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`text-xs p-3 rounded-xl border font-semibold text-left transition ${
                    selected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strengths & Portfolios */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-600" />
            Online Portfolios & Profiles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Resume Plain Text */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Resume Content (Raw Text)
          </h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            placeholder="Store your resume text here for instant access in AI Career Matching and Resume ATS scans..."
            className="w-full font-mono text-xs p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
