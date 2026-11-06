"use client";

import { useState } from "react";
import {
  Play,
  Copy,
  Check,
  Terminal,
  Loader2,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Globe,
  Eye,
  Palette,
  FileCode,
} from "lucide-react";

interface InteractiveCodeBlockProps {
  code: string;
  language?: string;
}

export default function InteractiveCodeBlock({
  code: initialCode,
  language = "python",
}: InteractiveCodeBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [stdinInput, setStdinInput] = useState("");

  const normalizedLang = (language || "python").toLowerCase().trim();
  const isHtml =
    normalizedLang.includes("html") ||
    normalizedLang.includes("htm") ||
    normalizedLang.includes("svg") ||
    code.trim().toLowerCase().startsWith("<!doctype") ||
    code.trim().toLowerCase().startsWith("<html");

  const isCss =
    normalizedLang.includes("css") ||
    normalizedLang.includes("style") ||
    normalizedLang.includes("scss") ||
    normalizedLang.includes("sass") ||
    normalizedLang.includes("less");

  const isBrowserJs =
    (normalizedLang.includes("js") || normalizedLang.includes("javascript")) &&
    (code.includes("document.") ||
      code.includes("window.") ||
      code.includes("addEventListener") ||
      code.includes("alert("));

  const isWebCode = isHtml || isCss || isBrowserJs;

  const [showLivePreview, setShowLivePreview] = useState(isHtml);
  const [showStdin, setShowStdin] = useState(
    !isWebCode && (initialCode.includes("input(") || initialCode.includes("readline"))
  );

  const [result, setResult] = useState<{
    success: boolean;
    output: string;
    error?: string;
    executionTimeMs?: number;
    isHtml?: boolean;
  } | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRun() {
    // 1. If HTML, execute in client-side Live Sandbox directly
    if (isHtml) {
      setRunning(true);
      setTimeout(() => {
        setShowLivePreview(true);
        setResult({
          success: true,
          output: "Web page rendered in live client browser sandbox.",
          isHtml: true,
          executionTimeMs: 4,
        });
        setRunning(false);
      }, 80);
      return;
    }

    // 2. If CSS, explain presentation styling with zero server crash
    if (isCss) {
      setResult({
        success: true,
        output:
          "CSS Stylesheet: Defines presentation rules (colors, margins, layout). Link this as 'style.css' or place inside <style>...</style> in your HTML document.",
        executionTimeMs: 0,
      });
      return;
    }

    // 3. If Browser DOM JavaScript, explain DOM event attachment with zero crash
    if (isBrowserJs) {
      setResult({
        success: true,
        output:
          "Browser DOM Script: Attaches event listeners (e.g. click handler) to HTML elements. Run alongside your HTML page in a browser to test interactivity.",
        executionTimeMs: 1,
      });
      return;
    }

    // 4. Regular Python or Node.js execution
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: normalizedLang,
          input: stdinInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setResult({
          success: false,
          output: "",
          error: data.error || "Failed to execute code",
        });
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        output: "",
        error:
          err instanceof Error ? err.message : "Network error executing code",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg text-slate-100 font-sans">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full inline-block ${
              isHtml
                ? "bg-amber-400"
                : isCss
                ? "bg-blue-400"
                : isBrowserJs
                ? "bg-yellow-400"
                : "bg-emerald-500"
            }`}
          />
          <span className="font-mono font-bold uppercase tracking-wider text-slate-300 text-[11px]">
            {isHtml
              ? "HTML / Web"
              : isCss
              ? "CSS Stylesheet"
              : isBrowserJs
              ? "Browser JS"
              : normalizedLang || "code"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
            {isHtml
              ? "Live Web Sandbox"
              : isCss
              ? "Styling Rules"
              : isBrowserJs
              ? "Client DOM Script"
              : "Executable Sandbox"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stdin Toggle (only for Python/Node) */}
          {!isWebCode && (
            <button
              onClick={() => setShowStdin(!showStdin)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                showStdin
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
              title="Toggle custom input (stdin)"
            >
              {showStdin ? "Stdin: On" : "Add Input"}
            </button>
          )}

          {/* Edit Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
              isEditing
                ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Edit code before running"
          >
            <Edit3 className="w-3 h-3" />
            {isEditing ? "Editing" : "Edit"}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Action Button: Run vs Preview */}
          <button
            onClick={handleRun}
            disabled={running}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition disabled:opacity-50 text-white ${
              isHtml
                ? "bg-indigo-600 hover:bg-indigo-500"
                : isCss
                ? "bg-blue-600 hover:bg-blue-500"
                : isBrowserJs
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {running ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : isHtml ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Preview HTML</span>
              </>
            ) : isCss ? (
              <>
                <Palette className="w-3.5 h-3.5" />
                <span>Stylesheet Info</span>
              </>
            ) : isBrowserJs ? (
              <>
                <FileCode className="w-3.5 h-3.5" />
                <span>DOM Script Info</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Stdin Bar */}
      {!isWebCode && showStdin && (
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3 text-xs">
          <span className="text-slate-400 shrink-0 font-medium">
            Standard Input (stdin):
          </span>
          <input
            type="text"
            value={stdinInput}
            onChange={(e) => setStdinInput(e.target.value)}
            placeholder="e.g. 7 or sample inputs separated by space"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>
      )}

      {/* Code Editor / Viewer */}
      <div className="p-4 overflow-x-auto text-[12px] font-mono leading-relaxed">
        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={Math.min(code.split("\n").length + 2, 20)}
            className="w-full bg-slate-950 text-emerald-300 font-mono text-[12px] p-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y"
          />
        ) : (
          <pre className="text-slate-200">
            <code>
              {code.split("\n").map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell pr-4 text-slate-600 select-none text-right font-mono text-[11px] w-8">
                    {i + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>

      {/* Live HTML Browser Preview (rendered when HTML is previewed or active) */}
      {isHtml && showLivePreview && (
        <div className="border-t border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-slate-200">
                Live Interactive Browser Preview
              </span>
            </div>
            <button
              onClick={() => setShowLivePreview(false)}
              className="text-slate-400 hover:text-slate-200 text-[11px]"
            >
              Hide Preview
            </button>
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-slate-300">
            <iframe
              srcDoc={code}
              title="HTML Sandbox"
              className="w-full min-h-[220px] max-h-[400px] border-none bg-white text-slate-900"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      )}

      {/* Console Output Terminal (for Python / JS execution / Explanations) */}
      {result && !isHtml && (
        <div className="border-t border-slate-800 bg-black/90 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-slate-300">
                {isCss || isBrowserJs ? "Web Engine Info" : "Terminal Output"}
              </span>
              {result.executionTimeMs !== undefined && (
                <span className="text-[10px] text-slate-500">
                  (Executed in {result.executionTimeMs}ms)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {result.success ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-bold">
                  <AlertCircle className="w-3 h-3" /> Execution Error
                </span>
              )}
              <button
                onClick={() => setResult(null)}
                className="text-slate-500 hover:text-slate-300 text-[11px] transition"
              >
                Clear
              </button>
            </div>
          </div>

          {result.output && (
            <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-60">
              {result.output}
            </pre>
          )}

          {result.error && (
            <pre className="text-red-400 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-60 mt-1">
              {result.error}
            </pre>
          )}

          {!result.output && !result.error && (
            <div className="text-slate-500 italic">
              [Program completed with no console output]
            </div>
          )}
        </div>
      )}
    </div>
  );
}
