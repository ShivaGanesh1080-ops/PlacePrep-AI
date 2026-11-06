# PlacePrep AI — AI-Driven Placement Preparation & Career Recommendation Portal

A production-grade, full-stack placement readiness platform powered by Next.js, Google Gemini AI, Prisma ORM, and Tailwind CSS. Built to give engineering students a competitive edge in campus recruitments with AI-guided career roadmaps, real-time mock interviews, ATS resume analysis, timed aptitude test rounds, and company drive tracking.

---

## 🌟 Key Highlights & Modules

### 1. 🧠 AI Career Recommendation Engine
- Analyzes candidate technical skills, interests, strengths, CGPA, and branch using **Google Gemini 1.5 Flash**.
- Computes percentage match scores across top tech roles (SDE, Systems Engineer, Data Scientist, AI Engineer, Cloud Architect).
- Identifies **Skill Gaps** and generates a numbered, step-by-step preparation roadmap.
- Fallback resilience allows the portal to operate even without an external API key.

### 2. 📝 Aptitude Assessment Engine
- Categorized practice rounds:
  - **Quantitative Aptitude** (Time & Work, Permutations, Percentages, Ratios, Speed & Distance)
  - **Verbal Ability** (Vocabulary, Grammar, Idioms, Subject-Verb Agreement, Syntax)
  - **Logical Reasoning** (Number Series, Blood Relations, Syllogisms, Direction Sense, Coding-Decoding)
  - **Technical (Computer Science)** (Data Structures, Algorithms, OS, DBMS, Networks, System Design)
- **120 pre-seeded real placement questions** with four options, auto-evaluated scoring, and concept explanations.
- Timed assessment mode, unanswered tracking, and detailed answer review keys.

### 3. 🎤 AI Mock Interview Simulator
- Realistic chat interface for **Technical**, **HR**, and **Behavioral** interviews.
- AI interviewer asks targeted single questions, acknowledges candidate answers, and conducts multi-turn interviews.
- Post-interview evaluation provides an overall score out of 100, executive feedback, strengths, and priority areas for improvement.

### 4. 📄 ATS Resume Analyzer & Scorer
- Evaluates resumes for Applicant Tracking System (ATS) parsers.
- Yields an Overall Score and ATS Pass Rate.
- Granular breakdown of individual sections: **Contact, Education, Experience, Skills, Projects, Formatting**.
- Generates high-priority actionable recommendations.

### 5. 🏢 Campus Recruitment & Company Tracker
- Pre-seeded with 10 top recruiters: **Google, Microsoft, Amazon, Atlassian, Flipkart, Adobe, Goldman Sachs, Deloitte, Infosys, TCS**.
- Tracks CTC packages (LPA), minimum CGPA cutoffs, visit dates, and drive statuses.
- Interactive candidate application pipeline: `Mark Interested` → `Applied` → `Shortlisted` → `Selected`.

### 6. 📊 Student Analytics Dashboard
- Comprehensive KPI cards: tests completed, average percentage, drives tracked, and interview sessions.
- **Recharts** interactive visualizations:
  - Aptitude score trajectory over time (LineChart)
  - Domain competence breakdown across Quant, Verbal, Logical, and Technical (BarChart)
- Milestone activity feed and module quick-launch cards.

### 7. ⚙️ Placement Cell Administration
- Restricted to users with the `ADMIN` role.
- Global metrics: total students, test volume, drive count, and question inventory.
- **Question Bank CRUD**: Add new MCQs with options, difficulty levels, and concept explanations, or delete obsolete questions.
- **Recruiter Drive Management**: Post visiting companies, update job roles and packages, and monitor student applicants.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Database** | SQLite + Prisma ORM (Zero-config, instantly portable) |
| **Authentication** | NextAuth.js (Credentials Provider, JWT Session Strategy, BCrypt hashing) |
| **AI Engine** | Google Gemini Generative AI (`@google/generative-ai`) |
| **Charts** | Recharts (Responsive Line & Bar Charts) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- npm or pnpm

### 2. Installation
```bash
cd placement-portal
npm install --legacy-peer-deps
```

### 3. Environment Setup
Review the `.env` file (already pre-configured for local development):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-key-placement-portal-2024"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Add your Gemini API key for live dynamic AI generations
# (Fallback responses are provided automatically if left blank)
GEMINI_API_KEY=""
```

### 4. Database Setup & Seeding
Push the schema to SQLite and populate 120 questions, 10 companies, and demo users:
```bash
npx prisma db push
node prisma/seed.ts
```

### 5. Run the Application
```bash
# Start in Development mode:
npm run dev

# Or run the optimized Production build:
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Accounts for Testing

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Student** | `shiva@student.com` | `student123` | Pre-populated profile (9.52 CGPA, CSE), test attempts & applications |
| **Student (Demo)** | `demo@student.com` | `student123` | Alternate student account |
| **Placement Admin** | `admin@placeprep.ai` | `admin123` | Full access to Admin Panel, Question CRUD & Company CRUD |

---

## 📁 Repository Directory Structure

```
placement-portal/
├── prisma/
│   ├── schema.prisma            # Prisma schema (User, StudentProfile, Question, TestAttempt, Company, etc.)
│   └── seed.ts                  # Seed script with 120 curated MCQs, 10 companies, admin & student accounts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx   # Login page
│   │   │   └── signup/page.tsx  # Registration page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Sidebar navigation layout with role checks
│   │   │   ├── dashboard/       # Student performance analytics & charts
│   │   │   ├── career/          # AI Career Recommendation module
│   │   │   ├── tests/           # Aptitude test hub & timed test runner
│   │   │   │   ├── [category]/  # Category test taking view
│   │   │   │   └── result/[id]/ # Test result breakdown & explanations
│   │   │   ├── interview/       # AI Mock Interview simulator
│   │   │   ├── resume/          # AI Resume Analyzer & ATS scorer
│   │   │   ├── companies/       # Campus Recruitment drive tracker
│   │   │   ├── profile/         # Student placement profile management
│   │   │   └── admin/           # Admin Dashboard, Question Bank & Company listings
│   │   ├── api/                 # 15 App Router REST API endpoints
│   │   ├── globals.css          # Styling & design system
│   │   ├── layout.tsx           # Root Next.js layout & SessionProvider
│   │   └── page.tsx             # PlacePrep AI landing page
│   ├── components/
│   │   ├── navbar.tsx           # Global responsive navigation bar
│   │   └── providers.tsx        # NextAuth SessionProvider wrapper
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── gemini.ts            # Google Gemini AI helper with fallbacks
│   │   └── utils.ts             # Tailwind class merge helper
│   ├── middleware.ts            # Route protection middleware
│   └── types/
└── package.json
```
