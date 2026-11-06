"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
  Brain,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Building2,
  BarChart3,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  Bot,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Career Guidance",
    description:
      "Get personalized career recommendations powered by AI based on your skills, interests, and academic performance.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: ClipboardCheck,
    title: "Aptitude Tests",
    description:
      "Practice with comprehensive aptitude tests covering quantitative, verbal, and logical reasoning sections.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "Prepare with AI-powered mock interviews with real-time feedback and detailed performance analysis.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Upload your resume and get AI-powered suggestions to make it stand out to top recruiters.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Bot,
    title: "Prep AI Assistant",
    description:
      "Ask any coding, DSA, or technical doubt with instant AI code solutions and complexity analysis.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description:
      "Monitor your preparation progress with detailed analytics and actionable insights.",
    color: "from-indigo-500 to-blue-600",
  },
];

const stats = [
  { icon: Users, value: "500+", label: "Students" },
  { icon: Target, value: "95%", label: "Placement Rate" },
  { icon: Sparkles, value: "100%", label: "Real Placement MCQs" },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDB2MWgtNHYtMXptMC0yaDB2MWgtNHYtMXoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white/90">
                Powered by Advanced AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Placement Preparation
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Get personalized career recommendations, practice aptitude tests,
              ace mock interviews, and track your preparation — all powered by
              cutting-edge AI technology.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {session ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Get Placed
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools and AI-powered features designed to maximize
              your placement success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Trusted by Students Everywhere
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Our numbers speak for themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-12 sm:p-16 shadow-2xl">
            <TrendingUp className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of students who are already using PlacePrep AI to
              prepare for their dream placements.
            </p>
            <Link
              href={session ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {session ? "Go to Dashboard" : "Create Free Account"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            &copy; 2026 PlacePrep AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
