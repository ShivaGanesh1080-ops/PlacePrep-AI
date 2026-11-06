"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
  Brain,
  ClipboardCheck,
  MessageSquare,
  FileText,
  BarChart3,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  Bot,
  Zap,
  CheckCircle2,
  Code2,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Cpu,
  Layers,
  Award,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  // Interactive 3D Card Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Interactive Playground Tab State
  const [activeTab, setActiveTab] = useState<"copilot" | "tests" | "interview">("copilot");

  // Sample Interactive Test State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-12deg to +12deg)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#8A0B34] selection:text-[#FFF2A8] overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Ambient Glows */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glowing 3D Radial Background Meshes (Palette: Wine, Sky, Amber) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-[#8A0B34]/25 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-36 right-[-100px] w-[500px] h-[500px] bg-[#B9DCFB]/15 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-[-100px] w-[500px] h-[400px] bg-[#F99B00]/15 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Subtle Isometric Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Title & Badges */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A0B34]/20 border border-[#8A0B34]/50 text-[#FFF2A8] text-xs font-semibold shadow-inner backdrop-blur-md animate-in fade-in duration-500">
              <span className="flex h-2 w-2 rounded-full bg-[#F99B00] animate-ping" />
              <span>Placement Preparation Engineered for CS Students</span>
              <span className="text-[#B9DCFB] font-bold">⚡ Fast Cloud AI</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Crack Your Dream{" "}
              <span className="bg-gradient-to-r from-[#FFF2A8] via-[#B9DCFB] to-[#F99B00] bg-clip-text text-transparent">
                Campus Placements.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Master technical rounds with intelligent doubt solving, benchmark aptitude test papers, and realistic mock interview feedback — all calibrated to top product & recruiter bars.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#8A0B34] hover:bg-[#A71042] text-white font-bold text-sm shadow-xl shadow-[#8A0B34]/30 hover:shadow-[#8A0B34]/50 border border-[#A71042]/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{session ? "Launch Dashboard" : "Start Free Preparation"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#interactive-demo"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 hover:text-white border border-[#B9DCFB]/30 hover:border-[#B9DCFB]/60 font-semibold text-sm transition-all duration-200 text-center cursor-pointer shadow-sm"
              >
                Try Interactive Demo
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-4 flex items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300 flex-wrap">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F99B00]" />
                <span>120+ Hand-Curated MCQs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#B9DCFB]" />
                <span>1-Second AI Responses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FFF2A8]" />
                <span>100% Free For Students</span>
              </div>
            </div>
          </div>

          {/* 3D Interactive Floating Dashboard Showcase */}
          <div className="mt-14 lg:mt-20 relative max-w-4xl mx-auto perspective-1000">
            {/* Ambient Shadow glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8A0B34]/30 via-[#F99B00]/15 to-[#B9DCFB]/25 rounded-3xl blur-2xl transform scale-95 -z-10" />

            <div
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? "1.02" : "1"}, ${isHovered ? "1.02" : "1"}, 1)`,
                transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
              }}
              className="relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-[#B9DCFB]/30 shadow-2xl p-4 sm:p-6 backdrop-blur-xl transform-gpu transition-colors"
            >
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400 font-semibold">
                    placeprep-ai.live/copilot
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B9DCFB]/10 text-[#B9DCFB] text-[10px] font-bold border border-[#B9DCFB]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B9DCFB] animate-pulse" /> Cloud AI Active
                  </span>
                </div>
              </div>

              {/* Showcase Inner Chat & Code Simulation */}
              <div className="pt-5 space-y-4 font-mono text-xs">
                {/* User Prompt */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#8A0B34] text-white border border-[#A71042]/50 rounded-2xl rounded-tr-none px-4 py-3 max-w-lg shadow-sm">
                    <p className="font-sans font-medium text-xs">
                      What is the optimal approach for Two Sum in Python? What is its time & space complexity?
                    </p>
                  </div>
                </div>

                {/* AI Assistant Response */}
                <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8A0B34] to-[#F99B00] text-white flex items-center justify-center shrink-0 font-sans font-bold shadow-md">
                    AI
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-2xl text-slate-300 space-y-3 font-sans w-full">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">Prep AI Solution:</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-[#8A0B34]/30 text-[#FFF2A8] rounded border border-[#8A0B34]/60">
                        O(n) Time • O(n) Space
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Use a <strong>Hash Map</strong> to store each number and its index. For each element, check if <code className="text-[#FFF2A8] bg-slate-900 px-1.5 py-0.5 rounded border border-[#FFF2A8]/20">target - num</code> was seen previously in single-pass O(n).
                    </p>

                    {/* Code Block */}
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/70 font-mono text-[11px] p-3 text-emerald-300">
                      <pre className="overflow-x-auto leading-relaxed">
{`def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`}
                      </pre>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="text-[#F99B00] font-bold">✓ Zero Hallucinations</span>
                      <span>•</span>
                      <span>Verified for Amazon & Google Campus Drives</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating 3D Accent Badges */}
              <div className="hidden sm:flex absolute -top-5 -right-6 bg-slate-900/95 border border-[#F99B00]/40 rounded-2xl p-3 shadow-xl backdrop-blur-md items-center gap-3 transform hover:scale-105 transition">
                <div className="w-8 h-8 rounded-xl bg-[#F99B00]/20 text-[#F99B00] flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Placement Calibration</p>
                  <p className="text-xs font-bold text-[#FFF2A8]">Top 5% SDE Benchmark</p>
                </div>
              </div>

              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-slate-900/95 border border-[#B9DCFB]/40 rounded-2xl p-3 shadow-xl backdrop-blur-md items-center gap-3 transform hover:scale-105 transition">
                <div className="w-8 h-8 rounded-xl bg-[#B9DCFB]/20 text-[#B9DCFB] flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Inference Speed</p>
                  <p className="text-xs font-bold text-[#B9DCFB]">&lt; 1 Second Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter / Company Targets Ticker */}
      <section className="py-8 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Curated For Target Recruitment Bars
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap text-sm font-bold text-slate-400">
            <span className="hover:text-[#FFF2A8] transition">Google SDE-1</span>
            <span className="hover:text-[#B9DCFB] transition">Amazon WOW & SDE</span>
            <span className="hover:text-[#FFF2A8] transition">Microsoft SWE</span>
            <span className="hover:text-[#F99B00] transition">TCS Digital</span>
            <span className="hover:text-[#B9DCFB] transition">Oracle Cloud</span>
            <span className="hover:text-[#FFF2A8] transition">Flipkart & Swiggy</span>
          </div>
        </div>
      </section>

      {/* Interactive Playground Section */}
      <section id="interactive-demo" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFF2A8] px-3.5 py-1.5 rounded-full bg-[#8A0B34]/30 border border-[#8A0B34]/60">
            Interactive Product Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Experience the Core Engines
          </h2>
          <p className="text-slate-300 text-sm mt-2">
            Switch between modules to see how PlacePrep AI trains you across each stage of recruitment.
          </p>

          {/* Module Tabs */}
          <div className="mt-8 flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit mx-auto">
            {[
              { id: "copilot", label: "AI Doubt Copilot", icon: Bot },
              { id: "tests", label: "Aptitude Tests", icon: ClipboardCheck },
              { id: "interview", label: "Mock Interviewer", icon: MessageSquare },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#8A0B34] text-white shadow-md shadow-[#8A0B34]/40 border border-[#A71042]/50"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {activeTab === "copilot" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#B9DCFB]" /> Prep AI Placement Mentor
                </span>
                <span className="text-[11px] text-[#B9DCFB] bg-[#B9DCFB]/10 border border-[#B9DCFB]/30 px-2 py-0.5 rounded font-mono">
                  Multimodal Vision Supported
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste any LeetCode problem, ask for trade-offs between B+ Trees and Hash Indexing, or attach screenshots of tricky error messages.
              </p>
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-[#FFF2A8] font-semibold">// Question: Explain Dijkstra's Time Complexity</div>
                <div className="text-slate-400">
                  Using a Min-Heap (Priority Queue): <span className="text-[#B9DCFB] font-bold">O((V + E) log V)</span>
                </div>
                <div className="text-slate-400">
                  Using an Adjacency Matrix: <span className="text-[#F99B00] font-bold">O(V²)</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  💡 Tip: Always mention graph density (sparse vs dense) when explaining Dijkstra to interviewers!
                </div>
              </div>
            </div>
          )}

          {activeTab === "tests" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#F99B00]" /> Quantitative Aptitude Sample
                </span>
                <span className="text-[11px] text-[#F99B00] bg-[#F99B00]/10 border border-[#F99B00]/30 px-2 py-0.5 rounded font-bold">
                  MEDIUM LEVEL (Product Benchmark)
                </span>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-200">
                  A train 180 meters long is running at 54 km/hr. How much time will it take to cross an electric pole?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {[
                    { key: "A", text: "10 seconds" },
                    { key: "B", text: "12 seconds", correct: true },
                    { key: "C", text: "15 seconds" },
                    { key: "D", text: "18 seconds" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedOption(opt.key)}
                      className={`text-left p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                        selectedOption === opt.key
                          ? opt.correct
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                            : "bg-red-950/60 border-red-500 text-red-200"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-[#B9DCFB]/40"
                      }`}
                    >
                      <span>
                        <strong>{opt.key}.</strong> {opt.text}
                      </span>
                      {selectedOption === opt.key && (
                        <span className="text-[10px] font-bold">
                          {opt.correct ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {selectedOption && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-300 text-xs border border-slate-800">
                    <strong className="text-[#FFF2A8]">Explanation:</strong> Speed = 54 × (5/18) = 15 m/s. Time = Distance / Speed = 180 / 15 = <strong className="text-white">12 seconds</strong>.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "interview" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#A71042]" /> Mock Interview Report Card
                </span>
                <span className="text-[11px] text-[#FFF2A8] bg-[#8A0B34]/40 border border-[#8A0B34]/70 px-2 py-0.5 rounded font-bold">
                  Score: 92/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-[#B9DCFB]">Strengths Identified:</span>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li>Clear articulation of hash table collisions & chaining</li>
                    <li>Stated Big-O complexities prior to writing code</li>
                    <li>Strong communication on system trade-offs</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-[#F99B00]">Areas for Improvement:</span>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                    <li>Elaborate on secondary memory paging during OS questions</li>
                    <li>Structure behavioral answers using the STAR format</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3D Features Grid */}
      <section className="py-20 sm:py-28 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F99B00] px-3.5 py-1.5 rounded-full bg-[#F99B00]/10 border border-[#F99B00]/30">
              Full Suite Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Everything Needed to Secure Placement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "Prep AI Placement Copilot",
                desc: "Real-time doubt solver powered by ultra-fast Cloud AI. Solves DSA, OS, Networks, and DBMS queries with complexity analysis.",
                color: "text-[#B9DCFB]",
                bg: "bg-[#B9DCFB]/10",
                borderHover: "hover:border-[#B9DCFB]/50",
              },
              {
                icon: ClipboardCheck,
                title: "Adaptive Aptitude Engine",
                desc: "120 curated questions across Quantitative, Verbal, Logical, and Technical CS with Easy, Medium, and Hard level calibration.",
                color: "text-[#F99B00]",
                bg: "bg-[#F99B00]/10",
                borderHover: "hover:border-[#F99B00]/50",
              },
              {
                icon: MessageSquare,
                title: "Mock Interview Simulator",
                desc: "Realistic Technical and HR interviews. Evaluates your answers with STAR analysis, strengths, and actionable hiring feedback.",
                color: "text-[#A71042]",
                bg: "bg-[#8A0B34]/15",
                borderHover: "hover:border-[#8A0B34]/50",
              },
              {
                icon: FileText,
                title: "Resume ATS Intelligence",
                desc: "Parses your resume structure, calculates ATS compatibility scores, and highlights missing high-frequency tech keywords.",
                color: "text-[#FFF2A8]",
                bg: "bg-[#FFF2A8]/10",
                borderHover: "hover:border-[#FFF2A8]/40",
              },
              {
                icon: Terminal,
                title: "Live Sandboxes & HTML Preview",
                desc: "Interactive code runner that executes Python & Node with stdin, and renders live browser previews for web snippets.",
                color: "text-[#F99B00]",
                bg: "bg-[#F99B00]/10",
                borderHover: "hover:border-[#F99B00]/50",
              },
              {
                icon: BarChart3,
                title: "Readiness Analytics Radar",
                desc: "Personalized dashboard tracking test averages, interview history, and algorithmic domain strengths over time.",
                color: "text-[#B9DCFB]",
                bg: "bg-[#B9DCFB]/10",
                borderHover: "hover:border-[#B9DCFB]/50",
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className={`group relative rounded-2xl bg-slate-900 border border-slate-800 p-6 ${feat.borderHover} hover:bg-slate-850 hover:-translate-y-1 transition-all duration-300 shadow-lg`}
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center mb-5`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#FFF2A8] transition">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="rounded-3xl bg-gradient-to-r from-[#5A0621] via-[#8A0B34] to-[#20030C] p-8 sm:p-14 border border-[#A71042]/60 shadow-2xl shadow-[#8A0B34]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F99B00]/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B9DCFB]/15 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Step Into Your Next Interview With Confidence.
            </h2>
            <p className="text-[#FFF2A8]/90 text-sm max-w-xl mx-auto mb-8 font-normal leading-relaxed">
              Create your account in seconds, test your aptitude levels, and practice with your dedicated AI placement coach.
            </p>

            <Link
              href={session ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#FFF2A8] hover:bg-white text-[#5A0621] font-black text-sm shadow-xl hover:shadow-[#FFF2A8]/20 transition hover:scale-105 cursor-pointer"
            >
              <span>{session ? "Open Dashboard" : "Get Started Now"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PlacePrep AI</span>
            <span>•</span>
            <span>Intelligent Placement Portal</span>
          </div>
          <p>© 2026 PlacePrep AI. Built for Engineering Students.</p>
        </div>
      </footer>
    </div>
  );
}
