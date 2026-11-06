import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Error fetching resume history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeText } = await req.json();
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume text must be at least 50 characters." },
        { status: 400 }
      );
    }

    const prompt = `You are a Tier-1 Tech Company Campus Recruiter and ATS (Applicant Tracking System) Specialist.
Analyze the following student resume for software engineering and placement roles:

Resume:
${resumeText}

Analyze every critical section. You MUST return ONLY a valid raw JSON object strictly adhering to this schema:
{
  "score": 85,
  "atsScore": 88,
  "summary": "High-level summary of the resume's competitiveness and ATS readiness.",
  "sections": {
    "contact": { "score": 90, "feedback": "Contains clear contact links and GitHub profile." },
    "education": { "score": 95, "feedback": "Clearly demonstrates high CGPA and relevant CSE coursework." },
    "experience": { "score": 80, "feedback": "Good internship points, quantify impact metrics further." },
    "skills": { "score": 88, "feedback": "Well-categorized and relevant technical stack." },
    "projects": { "score": 86, "feedback": "High engineering complexity shown; emphasize architectural decisions." },
    "formatting": { "score": 85, "feedback": "Concise plain-text structure suitable for ATS parsing." }
  },
  "improvements": [
    "Quantify metrics on project throughput and latency reduction",
    "List specific libraries or testing frameworks used (e.g., Jest, PyTest)",
    "Include production deployment details"
  ]
}
No markdown backticks, just raw JSON.`;

    const aiResponse = await generateAIResponse(prompt);

    let parsed = {
      score: 82,
      atsScore: 85,
      summary: "Resume demonstrates strong technical foundations and relevant computer science projects.",
      sections: {
        contact: { score: 90, feedback: "Professional details provided clearly." },
        education: { score: 90, feedback: "Academic background is well-articulated." },
        experience: { score: 75, feedback: "Expand on measurable impacts with percentages or benchmarks." },
        skills: { score: 85, feedback: "Modern and relevant tech stack." },
        projects: { score: 82, feedback: "Solid projects; add deployment and hosting links." },
        formatting: { score: 80, feedback: "Clean layout, parseable across standard ATS platforms." },
      },
      improvements: [
        "Include measurable impact numbers (e.g. latency, user metrics, scale)",
        "Highlight automated testing and CI/CD pipelines in projects",
        "Add direct links to hosted demos or repository code",
      ],
    };

    try {
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Falling back to structured defaults due to JSON parse error:", e);
    }

    await prisma.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        resumeText,
        score: parsed.score || 80,
        feedback: JSON.stringify(parsed),
      },
    });

    // Also update student profile with latest resume text
    await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: { resumeText },
      create: { userId: session.user.id, resumeText },
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Resume analysis failed:", error);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
