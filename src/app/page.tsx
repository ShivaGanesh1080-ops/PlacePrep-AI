"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
  Brain,
  ClipboardCheck,
  MessageSquare,
  FileText,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Code2,
  Building2,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200/70 overflow-hidden">
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Context Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Campus Placement Intelligence Workspace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.12]">
              Master your technical placement rounds
            </h1>

            {/* Subhead */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              An integrated preparation environment for engineering students.
              Solve DSA doubts with compiler diagnostics, simulate STAR-method
              interviews, and benchmark readiness across core rounds.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-2xs"
              >
                <span>{session ? "Enter workspace" : "Start preparing"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 transition-colors shadow-2xs"
              >
                <span>Try demo account</span>
              </Link>
            </div>
          </div>

          {/* Hero Moment: Real Product Preview in Code */}
          <div className="mt-14 sm:mt-18 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-300/80 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-slate-300 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    prep-copilot // TwoSum.cpp
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    g++ -O2 active
                  </span>
                  <span className="text-slate-500">42ms</span>
                </div>
              </div>

              {/* Code Editor & Diagnostic Split Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-950 font-mono text-xs">
                {/* Code Window */}
                <div className="md:col-span-7 p-4 border-b md:border-b-0 md:border-r border-slate-800 text-slate-300 overflow-x-auto leading-relaxed">
                  <div className="flex items-start gap-3">
                    <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-800/80">
                      <div>01</div>
                      <div>02</div>
                      <div>03</div>
                      <div>04</div>
                      <div>05</div>
                      <div>06</div>
                      <div>07</div>
                      <div>08</div>
                    </div>
                    <div>
                      <p><span className="text-indigo-400">#include</span> <span className="text-emerald-400">&lt;unordered_map&gt;</span></p>
                      <p><span className="text-indigo-400">vector</span>&lt;<span className="text-amber-400">int</span>&gt; <span className="text-blue-400">twoSum</span>(<span className="text-indigo-400">vector</span>&lt;<span className="text-amber-400">int</span>&gt;&amp; nums, <span className="text-amber-400">int</span> target) &#123;</p>
                      <p>&nbsp;&nbsp;<span className="text-indigo-400">unordered_map</span>&lt;<span className="text-amber-400">int</span>, <span className="text-amber-400">int</span>&gt; seen;</p>
                      <p>&nbsp;&nbsp;<span className="text-indigo-400">for</span> (<span className="text-amber-400">int</span> i = <span className="text-cyan-400">0</span>; i &lt; nums.size(); ++i) &#123;</p>
                      <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">int</span> complement = target - nums[i];</p>
                      <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">if</span> (seen.count(complement)) <span className="text-indigo-400">return</span> &#123;seen[complement], i&#125;;</p>
                      <p>&nbsp;&nbsp;&nbsp;&nbsp;seen[nums[i]] = i;</p>
                      <p>&nbsp;&nbsp;&#125; <span className="text-indigo-400">return</span> &#123;&#125;; &#125;</p>
                    </div>
                  </div>
                </div>

                {/* Diagnostics & STAR Output */}
                <div className="md:col-span-5 p-4 bg-slate-900/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 pb-1 border-b border-slate-800">
                      <span>Terminal Diagnostic</span>
                      <span className="text-emerald-400">Exit 0</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Input: <span className="text-slate-400">nums = [2,7,11,15], target = 9</span>
                    </p>
                    <p className="text-emerald-400 text-[11px] mt-1">
                      Output: [0, 1] <span className="text-slate-500">(O(n) time, O(n) space)</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="font-sans font-medium text-slate-300">STAR Technical Evaluation</span>
                      <span className="font-mono text-indigo-400 font-semibold">92 / 100</span>
                    </div>
                    <div className="space-y-1 text-slate-400 font-sans text-[10px]">
                      <div className="flex justify-between">
                        <span>Algorithmic Optimality</span>
                        <span className="text-slate-200">24/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Edge Case Coverage</span>
                        <span className="text-slate-200">23/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complexity Explanation</span>
                        <span className="text-slate-200">23/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Code Hygiene</span>
                        <span className="text-slate-200">22/25</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section id="features" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-mono font-medium text-indigo-600 uppercase tracking-wider mb-1">
            Core Modules
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Designed for every stage of recruitment
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Each round requires different cognitive skills. PlacePrep gives you dedicated tooling for every evaluation phase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Module 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                Prep AI Copilot & Sandbox
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multilingual code execution in C++, Python, and Java. Upload screenshots of compiler errors for instant visual diagnosis.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Cloudflare Vision</span>
              <span>C++17 • Py3</span>
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                STAR Mock Interviewer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adaptive technical and behavioral mock sessions. Generates structured feedback scored against the STAR framework.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Situation • Task</span>
              <span>Action • Result</span>
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 mb-4">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                Adaptive Aptitude Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Timed assessments across Quantitative, Logical, Verbal, and Core CS with automated percentile benchmarking.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>3 Tiers</span>
              <span>Timed Mode</span>
            </div>
          </div>

          {/* Module 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                ATS Resume Intelligence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts missing technical keywords against target job descriptions and rewrites weak bullets into quantified achievements.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>JD Matching</span>
              <span>Scoring 0-100</span>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Readiness Radar Breakdown */}
      <section id="modules" className="py-16 bg-white border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <p className="text-xs font-mono font-medium text-indigo-600 uppercase tracking-wider mb-1">
                Readiness Analytics
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Identify gaps before your campus drive begins
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Most students prepare aimlessly without knowing which round they fail in. PlacePrep tracks your skill competency across 5 core pillars so you know exactly where to allocate your study hours.
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Data Structures & Algorithms (B-Tree, DP, Graphs)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Core Computer Science (OS, DBMS, Networks)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quantitative & Logical Aptitude</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>STAR Behavioral & Technical HR Communication</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                  <span className="font-medium text-slate-700">Placement Competency Breakdown</span>
                  <span className="font-mono text-indigo-600 font-semibold">Tier-1 SDE Ready (86%)</span>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Algorithms & Problem Solving</span>
                      <span className="font-mono text-slate-600 text-[11px]">88%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Operating Systems & DBMS</span>
                      <span className="font-mono text-slate-600 text-[11px]">82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">Quantitative Aptitude</span>
                      <span className="font-mono text-slate-600 text-[11px]">90%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">STAR Technical Interview</span>
                      <span className="font-mono text-slate-600 text-[11px]">84%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "84%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">ATS Resume Alignment</span>
                      <span className="font-mono text-slate-600 text-[11px]">78%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture Specs */}
      <section id="architecture" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="max-w-xl">
            <p className="text-xs font-mono font-medium text-indigo-600 uppercase tracking-wider mb-1">
              Production Architecture
            </p>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              Built on resilient systems engineering
            </h2>
            <p className="mt-1.5 text-xs text-slate-600">
              Designed as a production-grade full-stack system with decoupled persistence, multi-device layouts, and edge security.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 font-mono text-xs">
            <div>
              <p className="text-slate-400 text-[11px]">RUNTIME</p>
              <p className="text-slate-900 font-semibold mt-0.5">Next.js 16 (App)</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">AI CORE</p>
              <p className="text-slate-900 font-semibold mt-0.5">Gemini + Cloudflare</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">COMPILER ENGINE</p>
              <p className="text-slate-900 font-semibold mt-0.5">g++ &amp; Polyglot Sim</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">DATA &amp; AUTH</p>
              <p className="text-slate-900 font-semibold mt-0.5">Prisma &amp; NextAuth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-12 border-t border-slate-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Begin your technical round preparation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant access to the Copilot sandbox, aptitude assessments, and mock interviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={session ? "/dashboard" : "/signup"}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors shadow-2xs"
            >
              {session ? "Open Workspace" : "Create free account"}
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-white">PlacePrep AI</span>
            <span>—</span>
            <span>Campus Placement Intelligence Workspace</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            &copy; 2026 Shiva Ganesh Akku • Built for Engineering Students.
          </p>
        </div>
      </footer>
    </div>
  );
}
