"use client";

import { useState, useRef, useEffect } from "react";
import InteractiveCodeBlock from "@/components/InteractiveCodeBlock";
import FormattedMarkdown from "@/components/FormattedMarkdown";
import {
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Paperclip,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  History,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Code2,
  Terminal,
  Cpu,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface ParsedMessage {
  text: string;
  suggestions: string[];
}

function parseMessageContent(rawContent: string): ParsedMessage {
  const suggestionRegex = /<<<SUGGESTIONS>>>([\s\S]*?)<<<END_SUGGESTIONS>>>/;
  const match = suggestionRegex.exec(rawContent);

  if (!match) {
    return { text: rawContent, suggestions: [] };
  }

  const cleanText = rawContent.replace(suggestionRegex, "").trim();
  const suggestionsBlock = match[1];
  const suggestions = suggestionsBlock
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.]\s*/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("<"));

  return { text: cleanText, suggestions };
}

const QUICK_START_CARDS = [
  {
    icon: Code2,
    tag: "Data Structures & DSA",
    title: "Optimal Two Sum in C++",
    prompt: "Write an optimal Two Sum algorithm in C++ with O(n) hash map and edge case analysis",
    desc: "Complexity analysis, hash maps, and pointer mechanics",
  },
  {
    icon: Terminal,
    tag: "Code Debugging",
    title: "Fix Recursion Stack Overflow",
    prompt: "Analyze this recursive tree traversal for stack overflow and rewrite it iteratively",
    desc: "Call stack limits, recursion vs iteration, memory profiling",
  },
  {
    icon: Cpu,
    tag: "System Design & DBMS",
    title: "B+ Tree vs Hash Indexing",
    prompt: "Explain Database Indexing: B-Tree vs Hash vs LSM Trees with production trade-offs",
    desc: "Storage engines, range queries, write amplification",
  },
  {
    icon: Sparkles,
    tag: "Mock HR / Behavioral",
    title: "STAR Technique for Conflict",
    prompt: "How to answer: 'Tell me about a time you had a technical disagreement with a teammate' using STAR format",
    desc: "Situation, Task, Action, Result framework for FAANG/Tier-1",
  },
];

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

const SUGGESTED_PROMPTS = [
  "Explain B+ Tree vs B Tree with indexing trade-offs",
  "Write an optimal Two Sum algorithm in C++ with O(n) time",
  "How to answer: 'Tell me about a time you had a technical disagreement'",
  "What is the difference between TCP and UDP with real-world examples?",
  "How do Database Indexes (B-Tree vs Hash) work under the hood?",
  "Give me 5 questions Google asks for SDE-1 backend roles",
];

const THINKING_STEPS = [
  "Prep AI is analyzing your query...",
  "Evaluating optimal algorithmic complexity & edge cases...",
  "Formulating structured interview-ready response...",
  "Synthesizing optimal solution...",
];

export default function CopilotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Responsive sidebar state: open on desktop (md+), closed by default on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const initialGreeting: Message = {
    role: "assistant",
    content:
      "Hello! I am **Prep AI**, your intelligent placement mentor and technical interview coach.\n\nAsk me any Data Structures & Algorithms problem, Operating Systems doubt, System Design query, or Mock HR question. You can also attach screenshots of code, problem statements, or error logs! How can I help your placement prep today?",
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, "up" | "down">>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default sidebar open state based on screen size on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Load chat conversations on mount (continue where user stopped)
  useEffect(() => {
    async function fetchConversations() {
      setLoadingHistory(true);
      try {
        const res = await fetch("/api/copilot/conversations");
        if (res.ok) {
          const data = await res.json();
          const list: Conversation[] = data.conversations || [];
          setConversations(list);

          // Auto-resume: select the most recent conversation if one exists
          if (list.length > 0) {
            await loadConversationMessages(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch conversation history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchConversations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Dynamic Thinking Rotator
  useEffect(() => {
    if (!loading) {
      setThinkingIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setThinkingIdx((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [loading]);

  async function loadConversationMessages(convId: string) {
    setCurrentConversationId(convId);
    setLoadingMessages(true);
    
    // Close sidebar on mobile when a chat is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    try {
      const res = await fetch(`/api/copilot/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        const rawMsgs = data.conversation?.messages || [];
        if (rawMsgs.length > 0) {
          setMessages(
            rawMsgs.map((m: { role: "user" | "assistant"; content: string; imageUrl?: string }) => ({
              role: m.role,
              content: m.content,
              image: m.imageUrl || undefined,
            }))
          );
        } else {
          setMessages([initialGreeting]);
        }
      }
    } catch (err) {
      console.error("Error loading conversation:", err);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleNewChat() {
    setCurrentConversationId(null);
    setMessages([initialGreeting]);
    setAttachedImage(null);
    setInput("");
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }

  async function handleDeleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/copilot/conversations/${convId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = conversations.filter((c) => c.id !== convId);
        setConversations(updated);

        if (currentConversationId === convId) {
          if (updated.length > 0) {
            await loadConversationMessages(updated[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  }

  async function handleSaveTitle(convId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const res = await fetch(`/api/copilot/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: editTitle.trim() } : c))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to update title:", err);
    }
  }

  async function handleClearAllHistory() {
    if (!confirm("Are you sure you want to clear all chat history? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/copilot/conversations", { method: "DELETE" });
      if (res.ok) {
        setConversations([]);
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if ((!text.trim() && !attachedImage) || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim() || (attachedImage ? "Please analyze this attached problem image." : ""),
      image: attachedImage || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);

        if (data.conversationId && data.conversationId !== currentConversationId) {
          setCurrentConversationId(data.conversationId);
          const listRes = await fetch("/api/copilot/conversations");
          if (listRes.ok) {
            const listData = await listRes.json();
            setConversations(listData.conversations || []);
          }
        }
      } else {
        const errData = await res.json().catch(() => null);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              errData?.response ||
              "I'm here to help with your placement preparation! What Data Structures, Algorithms, or Core CS doubt would you like to solve?",
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error communicating with Prep AI. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function handleSpeak(text: string, idx: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text: strip markdown code blocks and symbols for natural pronunciation
    const speechText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/[*#_`>]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  }

  function handleRegenerate() {
    if (loading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    if (messages[messages.length - 1].role === "assistant") {
      setMessages((prev) => prev.slice(0, -1));
    }
    handleSend(lastUserMsg.content);
  }

  function handleFeedback(idx: number, type: "up" | "down") {
    setFeedbackState((prev) => ({
      ...prev,
      [idx]: prev[idx] === type ? undefined! : type,
    }));
  }

  function renderMessageContent(content: string) {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(
          <div key={`text-${lastIndex}`} className="py-1">
            <FormattedMarkdown content={textBefore} />
          </div>
        );
      }

      const lang = match[1] || "python";
      const codeSnippet = match[2];

      parts.push(
        <InteractiveCodeBlock
          key={`code-${match.index}`}
          code={codeSnippet.trimEnd()}
          language={lang}
        />
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    const remaining = content.substring(lastIndex);
    if (remaining.trim()) {
      parts.push(
        <div key={`text-${lastIndex}`} className="py-1">
          <FormattedMarkdown content={remaining} />
        </div>
      );
    }

    return parts.length > 0 ? parts : <FormattedMarkdown content={content} />;
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find((c) => c.id === currentConversationId);

  const HistorySidebarContent = () => (
    <>
      {/* Sidebar Header: New Chat Button */}
      <div className="p-3 border-b border-slate-200/70 space-y-2.5 bg-white/70">
        <div className="flex items-center justify-between">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>New Chat</span>
          </button>

          {/* Close button on mobile modal drawer */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-2 p-2 rounded-xl text-slate-500 hover:bg-slate-200/60"
            title="Close history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingHistory ? (
          <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading past chats...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No chat history yet</p>
            <p className="text-[11px] mt-1 text-slate-400">
              Start asking doubts and your conversations will appear here automatically!
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === currentConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && loadConversationMessages(conv.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? "bg-white text-indigo-700 font-semibold border border-indigo-200/90 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100/70 border border-transparent"
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveTitle(conv.id, e)}
                    className="flex-1 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-0.5 text-xs border border-indigo-300 rounded bg-white text-slate-900 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    {/* Action buttons (Rename & Delete) on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60"
                        title="Rename thread"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-200/60"
                        title="Delete thread"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer: Clear History */}
      {conversations.length > 0 && (
        <div className="p-2.5 border-t border-slate-200/70 bg-white/40">
          <button
            onClick={handleClearAllHistory}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="w-full h-[calc(100dvh-5.5rem)] sm:h-[calc(100vh-6.5rem)] flex rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden relative">
      {/* Full-size Image Zoom Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 shadow-xl border border-slate-700"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}

      {/* MOBILE DRAWER BACKDROP (Only active on mobile when history is toggled open) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CHAT HISTORY SIDEBAR:
          - On Desktop (md+): Smooth side-by-side collapsible pane
          - On Mobile (<md): Slide-over drawer modal that takes 80vw without squeezing the chat! */}
      <aside
        className={`bg-slate-50/90 border-slate-200/80 transition-all duration-300 flex flex-col shrink-0 ${
          // Mobile: Modal slide-over drawer
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl border-r md:shadow-none md:static md:z-auto"
        } ${
          // Desktop: Collapsible width
          isSidebarOpen
            ? "translate-x-0 md:w-64 lg:w-72 md:border-r"
            : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden"
        }`}
      >
        <HistorySidebarContent />
      </aside>

      {/* Main Chat Workspace: Always full width on mobile! */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0 h-full">
        {/* Workspace Top Bar */}
        <div className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 border-b border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Toggle History Sidebar button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
              title={isSidebarOpen ? "Collapse chat history" : "Open chat history"}
            >
              <History className="w-4 h-4 md:hidden text-indigo-600" />
              <span className="hidden md:block">
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </span>
            </button>

            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                  {activeConversation ? activeConversation.title : "Prep AI Mentor"}
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden xs:inline">Active</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                Placement Doubt Solver & Code Executor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Resuming conversation...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const parsed = msg.role === "assistant" ? parseMessageContent(msg.content) : null;
                const isLatestAssistant =
                  msg.role === "assistant" &&
                  (idx === messages.length - 1 ||
                    (idx === messages.length - 2 && messages[messages.length - 1].role === "user"));

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2 sm:gap-3 w-full ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`relative group max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-xs"
                            : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs"
                        }`}
                      >
                        {/* Attached Image Preview */}
                        {msg.image && (
                          <div className="mb-2">
                            <div
                              className="relative inline-block cursor-pointer overflow-hidden rounded-xl border border-white/20 group/img"
                              onClick={() => setExpandedImage(msg.image || null)}
                              title="Click to zoom image"
                            >
                              <img
                                src={msg.image}
                                alt="Attached Problem Statement"
                                className="max-h-48 sm:max-h-56 max-w-full rounded-xl object-cover hover:scale-102 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[11px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> Zoom
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="text-xs sm:text-sm leading-relaxed overflow-x-auto">
                          {msg.role === "user" ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            renderMessageContent(parsed?.text || msg.content)
                          )}
                        </div>

                        {/* Contextual Suggestions Chips Under Assistant Response */}
                        {parsed && parsed.suggestions.length > 0 && (
                          <div className="mt-3.5 pt-2.5 border-t border-slate-200/70">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>Explore Next</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {parsed.suggestions.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => handleSend(sug)}
                                  className="text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1.5 group/chip"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/chip:scale-125 transition-transform" />
                                  <span>{sug}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Action Bar (like ChatGPT / Gemini) under Assistant Messages */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-1.5 ml-8 sm:ml-10 text-slate-400">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(parsed?.text || msg.content, idx)}
                          className="p-1.5 rounded-md hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Copy answer"
                        >
                          {copiedIdx === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Read Aloud Button (SpeechSynthesis) */}
                        <button
                          onClick={() => handleSpeak(parsed?.text || msg.content, idx)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            speakingIdx === idx
                              ? "text-indigo-600 bg-indigo-50"
                              : "hover:text-slate-700 hover:bg-slate-100"
                          }`}
                          title={speakingIdx === idx ? "Stop reading aloud" : "Read aloud (TTS)"}
                        >
                          {speakingIdx === idx ? (
                            <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Regenerate Button (on latest assistant response) */}
                        {isLatestAssistant && !loading && (
                          <button
                            onClick={handleRegenerate}
                            className="p-1.5 rounded-md hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Regenerate answer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Thumbs Up Feedback */}
                        <button
                          onClick={() => handleFeedback(idx, "up")}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            feedbackState[idx] === "up"
                              ? "text-emerald-600 bg-emerald-50"
                              : "hover:text-slate-700 hover:bg-slate-100"
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs Down Feedback */}
                        <button
                          onClick={() => handleFeedback(idx, "down")}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            feedbackState[idx] === "down"
                              ? "text-rose-600 bg-rose-50"
                              : "hover:text-slate-700 hover:bg-slate-100"
                          }`}
                          title="Needs improvement"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Hero Quick Start Cards (ChatGPT / Gemini style) on fresh chat */}
              {messages.length === 1 && !loading && (
                <div className="ml-8 sm:ml-10 mt-2 max-w-2xl">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-700">
                      Explore Placement & Technical Coaching Tracks
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {QUICK_START_CARDS.map((card, cIdx) => {
                      const IconComponent = card.icon;
                      return (
                        <button
                          key={cIdx}
                          onClick={() => handleSend(card.prompt)}
                          className="group text-left p-3 rounded-xl border border-slate-200/90 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 transition-all shadow-2xs cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                                {card.tag}
                              </span>
                              <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors">
                              {card.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                              {card.desc}
                            </p>
                          </div>
                          <div className="mt-2 text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                            <span>Ask Prep AI</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Thinking Bubble */}
              {loading && (
                <div className="flex gap-2 sm:gap-3 justify-start animate-in fade-in duration-200">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-2.5 text-xs text-slate-600">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    <span className="font-medium animate-pulse text-[11px] sm:text-xs">
                      {THINKING_STEPS[thinkingIdx]}
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Image Attachment Preview Ribbon */}
        {attachedImage && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50/60 border-t border-indigo-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-indigo-200 shadow-xs">
                <img src={attachedImage} alt="Attachment thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] sm:text-xs">
                <p className="font-bold text-indigo-900">Problem Image Attached</p>
                <p className="text-[9px] sm:text-[10px] text-indigo-600">Analyzed by Cloudflare Vision</p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-full hover:bg-indigo-200/60 text-indigo-700 transition"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sticky Input Bar */}
        <div className="p-2 sm:p-3 border-t border-slate-200/80 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Paperclip Button for Vision Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                attachedImage
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                  : "bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
              title="Attach problem screenshot or code image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any DSA doubt or interview query..."
              disabled={loading}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-slate-900 placeholder:text-slate-400"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !attachedImage)}
              className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
