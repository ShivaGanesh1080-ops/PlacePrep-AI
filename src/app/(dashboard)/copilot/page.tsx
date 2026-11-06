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
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I encountered an issue formulating a response. Please check your network connection or try asking again.",
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

  return (
    <div className="w-full h-[calc(100vh-7.5rem)] flex rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
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

      {/* Unified ChatGPT-Style Sidebar: Chat History */}
      <aside
        className={`transition-all duration-300 flex flex-col bg-slate-50/70 border-r border-slate-200/80 overflow-hidden shrink-0 ${
          isSidebarOpen ? "w-64 sm:w-72" : "w-0 border-r-0"
        }`}
      >
        {/* Sidebar Header: New Chat Button */}
        <div className="p-3 border-b border-slate-200/70 space-y-2.5 bg-white/60">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>New Chat</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat history..."
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
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
        {/* Workspace Top Bar */}
        <div className="flex items-center justify-between py-2.5 px-4 border-b border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Toggle History Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
              title={isSidebarOpen ? "Collapse chat history" : "Open chat history"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>

            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {activeConversation ? activeConversation.title : "Prep AI Mentor"}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Copilot
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                Placement Doubt Solver & Code Executor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Resuming conversation...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 shadow-xs ${
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
                            className="max-h-56 max-w-full rounded-xl object-cover hover:scale-102 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[11px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Zoom
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Copy Button */}
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy message"
                      >
                        {copiedIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Content */}
                    <div className="text-sm">
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        renderMessageContent(msg.content)
                      )}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Dynamic Thinking Bubble */}
              {loading && (
                <div className="flex gap-3 justify-start animate-in fade-in duration-200">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-3 text-xs text-slate-600">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                    </span>
                    <span className="font-medium animate-pulse">
                      {THINKING_STEPS[thinkingIdx]}
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Suggested Doubts Chips (Only visible in brand new chat with initial message) */}
        {messages.length === 1 && !loading && (
          <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 shrink-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⚡</span> Suggested Placement Doubts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 transition-all text-left shadow-xs cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Attachment Preview Ribbon */}
        {attachedImage && (
          <div className="px-4 py-2 bg-indigo-50/60 border-t border-indigo-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-indigo-200 shadow-xs">
                <img src={attachedImage} alt="Attachment thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-indigo-900">Problem Image Attached</p>
                <p className="text-[10px] text-indigo-600">Will be analyzed by Cloudflare Vision</p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-full hover:bg-indigo-200/60 text-indigo-700 transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sticky Input Bar */}
        <div className="p-3 border-t border-slate-200/80 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
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
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
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
              placeholder="Ask anything (e.g. explain AVL rotation, trace Dijkstra's algorithm, ask mock HR question)..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-slate-900 placeholder:text-slate-400"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !attachedImage)}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
