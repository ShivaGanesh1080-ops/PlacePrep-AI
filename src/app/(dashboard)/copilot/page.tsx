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
  RotateCcw,
  Zap,
  Paperclip,
  Image as ImageIcon,
  X,
  Maximize2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // Stored only temporarily in session memory (Data URL)
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **Prep AI**, your intelligent placement mentor and technical interview coach.\n\nAsk me any Data Structures & Algorithms problem, Operating Systems doubt, System Design query, or Mock HR question. You can also attach screenshots of code, problem statements, or error logs! How can I help your placement prep today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Reset input so same file can be re-selected if needed
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

  function handleReset() {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation cleared. What placement concept, coding problem, or interview topic would you like to explore next?",
      },
    ]);
    setAttachedImage(null);
  }

  function renderMessageContent(content: string) {
    // Regex matching markdown code fences: ```language \n code ```
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

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-7rem)] flex flex-col pb-4">
      {/* Full-size Image Preview Modal */}
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

      {/* Header bar */}
      <div className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Prep AI</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Placement Mentor
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive placement doubt solver, code executor & technical interview coach
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          title="Reset chat"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pr-3">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-white shadow-sm"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-3xl rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium whitespace-pre-wrap"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none w-full"
                }`}
              >
                {/* Temporary Image in User Message Bubble */}
                {isUser ? (
                  <div className="space-y-2">
                    {m.image && (
                      <div className="relative group/img inline-block">
                        <img
                          src={m.image}
                          alt="Uploaded attachment"
                          onClick={() => setExpandedImage(m.image || null)}
                          className="max-h-52 max-w-full rounded-xl object-contain border border-white/20 bg-black/10 cursor-pointer hover:opacity-90 transition shadow-sm"
                        />
                        <button
                          onClick={() => setExpandedImage(m.image || null)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition backdrop-blur-xs"
                          title="Click to expand"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div>{m.content}</div>
                  </div>
                ) : (
                  <div className="space-y-2">{renderMessageContent(m.content)}</div>
                )}

                {!isUser && (
                  <button
                    onClick={() => handleCopy(m.content, idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50/80 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                    title="Copy full message"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic Thinking Bubble */}
        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-700 flex items-center gap-2.5 shadow-sm">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="absolute w-2 h-2 rounded-full bg-indigo-400 animate-ping opacity-75" />
              </div>
              <span className="font-medium text-slate-600 animate-pulse">
                {THINKING_STEPS[thinkingIdx]}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="pt-3 pb-2 px-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Suggested Doubts & Prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 font-medium transition text-left cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form with Temporary Image Attachment */}
      <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm space-y-2">
        {/* Temporary Image Preview before sending */}
        {attachedImage && (
          <div className="flex items-center justify-between gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl w-fit max-w-sm">
            <div className="flex items-center gap-2.5">
              <img
                src={attachedImage}
                alt="Selected screenshot thumbnail"
                className="w-10 h-10 object-cover rounded-lg border border-slate-300"
              />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-slate-800">Screenshot Attached</p>
                <p className="text-[10px] text-slate-500">Stored in temporary session memory</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-200 transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hidden File Input for Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Paperclip / Image Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 border border-transparent hover:border-indigo-200 transition shrink-0 cursor-pointer"
            title="Attach problem screenshot, diagram, or error log (temporary)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              attachedImage
                ? "Describe what you want Prep AI to solve or analyze in this image..."
                : "Ask anything (e.g. explain AVL rotation, trace Dijkstra's algorithm, ask mock HR question)..."
            }
            rows={1}
            className="flex-1 text-xs p-2 rounded-xl focus:outline-none resize-none font-medium text-slate-800"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !attachedImage)}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-100 transition shrink-0 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
