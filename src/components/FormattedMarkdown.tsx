"use client";

import React from "react";

interface FormattedMarkdownProps {
  content: string;
}

/**
 * Robust markdown parser for inline text elements:
 * - **bold** and __bold__
 * - `inline code`
 * - *italic* and _italic_
 * - handles nested formatting like **`code` in bold**
 * - cleans up accidental raw asterisks
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Normalize double underscores to double asterisks for consistent parsing
  const normalized = text.replace(/__([^_]+)__/g, "**$1**");

  // Regex tokenizing: **bold**, `code`, *italic*
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    const textBefore = normalized.substring(lastIndex, match.index);
    if (textBefore) {
      // Remove any lingering accidental orphan double asterisks in prose
      tokens.push(textBefore.replace(/\*\*/g, ""));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
      const inner = token.slice(2, -2);
      // Support nested inline code inside bold, e.g. **`func()`:**
      tokens.push(
        <strong key={key} className="font-semibold text-slate-900">
          {parseInlineMarkdown(inner)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
      const inner = token.slice(1, -1);
      tokens.push(
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-indigo-700 font-mono text-[11px] font-medium border border-slate-200"
        >
          {inner}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
      const inner = token.slice(1, -1);
      tokens.push(
        <em key={key} className="italic text-slate-700">
          {inner}
        </em>
      );
    } else {
      tokens.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  const remaining = normalized.substring(lastIndex);
  if (remaining) {
    tokens.push(remaining.replace(/\*\*/g, ""));
  }

  return tokens.length > 0 ? tokens : [normalized.replace(/\*\*/g, "")];
}

export default function FormattedMarkdown({ content }: FormattedMarkdownProps) {
  if (!content) return null;

  // Split content into lines for block-level parsing
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty lines (paragraph spacing)
    if (!trimmed) {
      elements.push(<div key={`empty-${index}`} className="h-2" />);
      return;
    }

    // Headings: ###
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-sm font-bold text-slate-900 mt-3 mb-1 flex items-center gap-1.5">
          {parseInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
      return;
    }

    // Headings: ##
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-base font-bold text-slate-900 mt-4 mb-1.5">
          {parseInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
      return;
    }

    // Headings: #
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-lg font-extrabold text-slate-900 mt-4 mb-2">
          {parseInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
      return;
    }

    // Horizontal Rule: --- or ***
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr key={`hr-${index}`} className="my-3 border-slate-200" />);
      return;
    }

    // Bullet points: * or - or •
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 pl-2 my-1 text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
          <div className="flex-1 leading-relaxed">
            {parseInlineMarkdown(trimmed.substring(2))}
          </div>
        </div>
      );
      return;
    }

    // Numbered lists: 1. , 2. , etc.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${index}`} className="flex items-start gap-2 pl-2 my-1 text-slate-700">
          <span className="font-bold text-indigo-600 text-xs shrink-0 min-w-4">
            {numMatch[1]}.
          </span>
          <div className="flex-1 leading-relaxed">
            {parseInlineMarkdown(numMatch[2])}
          </div>
        </div>
      );
      return;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed text-slate-700 my-0.5">
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  return <div className="space-y-0.5 text-xs text-slate-800">{elements}</div>;
}
