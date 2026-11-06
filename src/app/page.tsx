"use client";

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
  Award,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Career Guidance",
    description:
      "Get personalized career recommendations powered by AI based on your skills, interests, and academic performance.",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    border: "hover:border-purple-300",
  },
  {
    icon: ClipboardCheck,
    title: "Aptitude Tests",
    description:
      "Practice with comprehensive aptitude tests covering quantitative, verbal, and logical reasoning sections.",
    color: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/20",
    border: "hover:border-blue-300",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "Prepare with AI-powered mock interviews with real-time feedback and detailed performance analysis.",
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    border: "hover:border-emerald-300",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Upload your resume and get AI-powered suggestions to make it stand out to top recruiters.",
    color: "from-orange-500 to-amber-600",
    shadow: "shadow-orange-500/20",
    border: "hover:border-orange-300",
  },
  {
    icon: Bot,
    title: "Prep AI Assistant",
    description:
      "Ask any coding, DSA, or technical doubt with instant AI code solutions and complexity analysis.",
    color: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-500/20",
    border: "hover:border-pink-300",
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description:
      "Monitor your preparation progress with detailed analytics and actionable insights.",
    color: "from-indigo-500 to-blue-600",
    shadow: "shadow-indigo-500/20",
    border: "hover:border-indigo-300",
  },
];

const stats = [
  { icon: Users, value: "500+", label: "Students Enrolled" },
  { icon: Target, value: "95%", label: "Placement Success Rate" },
  { icon: Sparkles, value: "100%", label: "Curated Placement MCQs" },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white">
        {/* Animated Radial Ambient Orbs (Motion) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 -right-24 w-[450px] h-[450px] bg-indigo-400/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "4s" }} />

        {/* Subtle Geometric Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDB2MWgtNHYtMXptMC0yaDB2MWgtNHYtMXoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-25 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36 lg:pt-36 lg:pb-44">
          <div className="text-center max-w-4xl mx-auto relative z-10">
            {/* Top Pill with floating animation */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/25 mb-8 shadow-lg animate-float">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white drop-shadow-sm">
                Powered by Advanced AI Mentorship
              </span>
            </div>

            {/* Headline with smooth entrance motion */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom duration-500">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
                Placement Preparation
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal animate-in fade-in slide-in-from-bottom duration-700">
              Get personalized career recommendations, practice aptitude tests,
              ace mock interviews, and track your preparation — all powered by
              cutting-edge AI technology.
            </p>

            {/* CTA Buttons with motion & hover glow */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl shadow-indigo-950/20 hover:shadow-2xl hover:scale-105 hover:bg-slate-50 transition-all duration-300 cursor-pointer text-sm sm:text-base"
              >
                <span>{session ? "Go to Dashboard" : "Get Started Free"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 hover:border-white/60 backdrop-blur-xs transition-all duration-300 font-semibold text-sm sm:text-base cursor-pointer"
              >
                Explore Features
              </a>
            </div>

            {/* Floating Live Motion Chips (Subtle Levitation) */}
            <div className="mt-12 hidden md:flex items-center justify-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/90 shadow-md animate-float" style={{ animationDelay: "0.2s" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Cloudflare Fast AI Active</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/90 shadow-md animate-float-reverse" style={{ animationDelay: "1s" }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-semibold">120+ Curated Placement MCQs</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/90 shadow-md animate-float" style={{ animationDelay: "1.8s" }}>
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span className="font-semibold">&lt; 1s Response Latency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Smooth Transition Wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-10">
          <svg
            className="w-full h-12 sm:h-20 lg:h-28 text-white fill-current"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-3.5 py-1.5 rounded-full">
              Comprehensive Portal Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Get Placed
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
              Comprehensive tools and AI-powered features designed to maximize
              your placement success across every technical round.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`group relative bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-2xl ${feature.border} transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
              >
                {/* Gradient Icon Badge with Hover Lift */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadow} mb-6 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Smooth Elevation */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Trusted by Students Everywhere
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Our placement numbers speak for themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="text-center bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-slate-600 font-semibold text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-10 sm:p-16 shadow-2xl overflow-hidden">
            {/* Ambient pulse orbs in banner */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse-glow pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300/15 rounded-full blur-2xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "3s" }} />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-white/20 animate-float">
                <TrendingUp className="w-8 h-8 text-yellow-300" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto font-normal">
                Join hundreds of engineering students who are already using PlacePrep AI to
                crack their campus placement drives.
              </p>

              <Link
                href={session ? "/dashboard" : "/signup"}
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-slate-50 transition-all duration-300 cursor-pointer"
              >
                <span>{session ? "Open Dashboard" : "Create Free Account"}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-sm text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PlacePrep AI</span>
            <span>•</span>
            <span>Intelligent Placement Portal</span>
          </div>
          <p>&copy; 2026 PlacePrep AI. Built for Engineering Students.</p>
        </div>
      </footer>
    </div>
  );
}
