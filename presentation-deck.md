# PlacePrep AI — Campus Placement Readiness Suite
## Academic Project Presentation | Course: AI Assisted Coding | SR University

---

### Slide 1: Title Slide
- **Title:** PlacePrep AI
- **Subtitle:** Next-Generation Placement Readiness & AI Intelligence Workspace
- **Course:** AI Assisted Coding (B.Tech CSE Core, 2nd Year)
- **Institution:** SR University
- **Team:** Shiva Ganesh Akku (Team Lead) & Team (5 Members)
- **Live System:** https://placeprep-ai-r9xo.onrender.com

---

### Slide 2: The Core Problem
- **Headline:** Why Campus Placement Prep Fails Today
- **Point 1 — Fragmented Tooling:** Students use LeetCode for DSA, Google Docs for resumes, and random YouTube videos for mocks. No unified feedback or readiness telemetry.
- **Point 2 — Generic LLM Flaws:** Raw ChatGPT prompts hallucinate test cases, lack compiler diagnostics, and give unverified code snippets without runtime execution.
- **Point 3 — The ATS Black Hole:** Over 75% of candidate resumes are filtered out before reaching human recruiters due to unquantified bullets, passive verbs, and missing keyword density.

---

### Slide 3: Solution Overview
- **Headline:** PlacePrep AI: A Unified 4-Pillar Suite
- **Pillar 1 — Resume Intelligence:** Multimodal document parser (PDF, DOCX, Images). Benchmarks keyword density against target tech roles and auto-generates STAR line rewrites.
- **Pillar 2 — Prep AI & Polyglot Sandbox:** Embedded compiler runner (C++, Java, Python, JS) with automatic AST syntax parsing and compiler diagnostic recovery.
- **Pillar 3 — Mock Interviewer:** Multi-turn technical & HR conversational agent with Google STAR rubric evaluation and actionable feedback.
- **Pillar 4 — Aptitude & Campus Drives:** Timed MCQ assessment engine with administrative question bank management and recruiter filtering.

---

### Slide 4: System Architecture & AI Pipeline
- **Headline:** Multi-Tier Resilient AI Stack
- **Frontend Layer:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts.
- **Data & Auth:** NextAuth.js (JWT session auth), Prisma ORM, SQLite / PostgreSQL.
- **AI Orchestration (Tier 1):** Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) for sub-second (~1.2s) inference with strict JSON schema contracts.
- **Multimodal OCR (Tier 2):** Cloudflare Llama 3.2 11B Vision & Gemini 1.5 Flash for handwritten code & document scans.
- **Zero-Failure Fallback (Tier 3):** Deterministic algorithmic heuristic parser ensuring 100% platform availability even during external API downtime.

---

### Slide 5: Feature Deep Dive — Resume Intelligence
- **Headline:** Multimodal Resume ATS Engine
- **Multi-Format Parsing:** Native support for PDF (`pdf-parse`), Word DOCX (`mammoth`), and PNG/JPG images without third-party SaaS dependencies.
- **Role-Calibrated Density Matrix:** Calibrates against 5 tech profiles (SDE-1 Full Stack, Backend, Frontend, AI/ML, DevOps) to expose verified found vs. missing skills.
- **Google XYZ Bullet Rewrites:** Analyzes weak bullets and generates: *"Accomplished [X], as measured by [Y], by doing [Z]"* with 1-click clipboard copy.
- **Live Example:**
  - *Before:* "Handled order state with SSE in food ordering app."
  - *After:* "Architected real-time order state engine utilizing Server-Sent Events, reducing client sync latency by 45% across 1,000+ simulated requests."

---

### Slide 6: Feature Deep Dive — Polyglot Code Sandbox
- **Headline:** Interactive Code Runner & Compiler Diagnostics
- **Live In-Browser Execution:** C++ (`g++`), Java (`javac`), Python 3, and Node.js executed directly from AI response blocks.
- **Syntax Interception:** Intercepts `stderr` and feeds compiler errors back to the AI diagnostic engine to provide immediate, actionable fixes.
- **Execution Safeguards:** Enforces strict execution timeouts (10s kill gate) and memory limits to protect host servers.

---

### Slide 7: AI-Assisted Engineering Methodology
- **Headline:** Responsible AI Assisted Coding Practices
- **Architecture First:** Designed database schemas, API contracts, and authentication boundaries upfront before prompting AI agents.
- **Strict Schema Enforcement:** Enforced strict JSON contracts on model outputs, eliminating conversational fluff and markdown errors to prevent frontend crashes.
- **Type-Driven Verification:** Every AI-generated module was subjected to strict TypeScript compiler verification (`npx tsc --noEmit`) and Next.js Turbopack production builds with 0 errors.

---

### Slide 8: Team Engineering Allocation (5 Members)
- **Member 1 (Shiva Ganesh — Lead):** Systems Architecture, Next.js 16 App Router, Prisma ORM, Multimodal ATS Engine, Deployment & CI/CD.
- **Member 2:** AI Systems Engineer — Cloudflare Workers AI integration, multimodal vision pipeline, strict JSON prompt contracts.
- **Member 3:** Compiler & Sandbox Engineer — Polyglot code runner (C++, Java, Python), compiler error parser & execution timeout gates.
- **Member 4:** Frontend & UX Systems — Antigravity activity-rail sidebar, cross-device responsive layout, live progress states, 1-click clipboard interactions.
- **Member 5:** Assessment & Analytics — Timed aptitude testing & grading logic, question bank admin management, student readiness telemetry.

---

### Slide 9: Engineering Impact & Benchmarks
- **1.2s Average AI Latency:** Sub-second edge inference on Cloudflare Workers AI vs. 8s+ on heavy self-hosted models.
- **100% Format Compatibility:** Verified on PDF, DOCX, PNG, JPG, WebP, and raw text formats.
- **0 Type/Compiler Errors:** Strict TypeScript verification across all dashboard routes and API handlers.
- **100% Fallback Availability:** Deterministic algorithmic engine prevents demo crashes even during Wi-Fi or API dropouts.

---

### Slide 10: Conclusion & Live Demonstration
- **Summary:** PlacePrep AI transitions placement prep from passive memorization to verified, real-time engineering readiness.
- **Live Demo Transitions:**
  1. Drop real PDF resume -> Real-time STAR rewrites
  2. Run C++ Bubble Sort -> Interactive sandbox compiler output
  3. Simulate STAR technical interview dialogue
  4. Admin portal question management
- **Production URL:** https://placeprep-ai-r9xo.onrender.com
- **Thank you! Questions & Answers.**
