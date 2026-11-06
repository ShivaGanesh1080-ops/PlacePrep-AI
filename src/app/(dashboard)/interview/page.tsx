"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import FormattedMarkdown from "@/components/FormattedMarkdown";
import {
  MessageSquare,
  Send,
  Loader2,
  Users,
  Code2,
  Heart,
  X,
  Award,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";

interface ChatMessage {
  role: "ai" | "user";
  content: string;
}

interface InterviewFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface PreviousInterview {
  id: string;
  type: string;
  score: number | null;
  feedback: string | null;
  createdAt: string;
}

const INTERVIEW_TYPES = [
  {
    type: "HR",
    label: "HR Interview",
    description: "Communication, culture fit, behavioral questions",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  {
    type: "Technical",
    label: "Technical Interview",
    description: "DSA, system design, coding concepts",
    icon: Code2,
    color: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
  },
  {
    type: "Behavioral",
    label: "Behavioral Interview",
    description: "STAR method, past experiences, soft skills",
    icon: Heart,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
];

export default function InterviewPage() {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [previousInterviews, setPreviousInterviews] = useState<PreviousInterview[]>([]);
  const [loadingPrevious, setLoadingPrevious] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPreviousInterviews();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchPreviousInterviews() {
    try {
      const res = await fetch("/api/interview");
      if (res.ok) {
        const data = await res.json();
        setPreviousInterviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setLoadingPrevious(false);
    }
  }

  async function startInterview(type: string) {
    setSelectedType(type);
    setMessages([]);
    setFeedback(null);
    setStarting(true);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([{ role: "ai", content: data.message }]);
      } else {
        alert("Failed to start interview. Please try again.");
        setSelectedType(null);
      }
    } catch (err) {
      console.error("Error starting interview:", err);
      alert("Something went wrong. Please try again.");
      setSelectedType(null);
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending || !selectedType) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setSending(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history,
          type: selectedType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "ai", content: data.message }]);
      } else {
        alert("Failed to get response. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  }

  async function endInterview() {
    if (!selectedType || messages.length === 0) return;
    setEnding(true);

    try {
      const transcript = messages.map((m) => ({
        role: m.role === "ai" ? "interviewer" : "candidate",
        content: m.content,
      }));

      const res = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, type: selectedType }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        fetchPreviousInterviews();
      } else {
        alert("Failed to generate feedback. Please try again.");
      }
    } catch (err) {
      console.error("Error ending interview:", err);
    } finally {
      setEnding(false);
    }
  }

  function resetInterview() {
    setSelectedType(null);
    setMessages([]);
    setFeedback(null);
    setInput("");
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  }

  function getScoreRingColor(score: number) {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-red-500";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          AI Mock Interview
        </h1>
        <p className="text-slate-600 mt-2">
          Practice interviews with our AI interviewer and get instant feedback.
        </p>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Interview Feedback</h3>
              <button
                onClick={resetInterview}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Score Circle */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    className={getScoreRingColor(feedback.score)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(feedback.score / 100) * 314} 314`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}>
                    {feedback.score}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
            </div>

            {/* Feedback Text */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-700 leading-relaxed">{feedback.feedback}</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {feedback.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <Award className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {feedback.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={resetInterview}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Start New Interview
            </button>
          </div>
        </div>
      )}

      {/* Type Selector */}
      {!selectedType && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INTERVIEW_TYPES.map((it) => (
            <button
              key={it.type}
              onClick={() => startInterview(it.type)}
              className={`p-6 rounded-2xl border-2 ${it.border} ${it.bg} hover:shadow-lg transition text-left group`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${it.color} flex items-center justify-center mb-4`}
              >
                <it.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition">
                {it.label}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{it.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Starting Spinner */}
      {starting && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-600 font-medium">Preparing your interview...</p>
        </div>
      )}

      {/* Chat Interface */}
      {selectedType && !starting && !feedback && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedType} Interviewer</p>
                <p className="text-xs text-slate-500">AI-powered mock interview</p>
              </div>
            </div>
            <button
              onClick={endInterview}
              disabled={ending || messages.length < 2}
              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {ending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating feedback...
                </>
              ) : (
                "End Interview"
              )}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md whitespace-pre-wrap"
                      : "bg-slate-100 text-slate-800 rounded-bl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <FormattedMarkdown content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your answer..."
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Interviews */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-500" />
          Previous Interviews
        </h3>
        {loadingPrevious ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : previousInterviews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No previous interviews yet. Select an interview type above to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {previousInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {interview.type} Interview
                      </span>
                      {interview.score !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            interview.score >= 80
                              ? "bg-emerald-100 text-emerald-700"
                              : interview.score >= 60
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {interview.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(interview.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
