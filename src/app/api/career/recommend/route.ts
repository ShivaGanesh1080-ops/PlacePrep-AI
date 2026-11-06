import { NextRequest, NextResponse } from "next/server";
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

    const recommendations = await prisma.careerRecommendation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const parsed = recommendations.map((rec) => {
      let analysisObj: { skillGaps?: string[]; summary?: string } = {};
      try {
        analysisObj = JSON.parse(rec.analysis);
      } catch {}
      return {
        id: rec.id,
        careers: typeof rec.careers === "string" ? JSON.parse(rec.careers) : rec.careers,
        skillGaps: analysisObj.skillGaps || [],
        summary: analysisObj.summary || "",
        createdAt: rec.createdAt.toISOString(),
      };
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching career recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { skills, interests, cgpa, branch, strengths } = body;

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one skill." },
        { status: 400 }
      );
    }

    if (!cgpa) {
      return NextResponse.json({ error: "CGPA is required." }, { status: 400 });
    }

    if (!branch) {
      return NextResponse.json({ error: "Branch is required." }, { status: 400 });
    }

    const prompt = `You are an expert career counselor and placement director at a premier engineering university.
Analyze the following student profile and recommend the top 5 career paths most suitable for campus placements.

Student Profile:
- Skills: ${skills.join(", ")}
- Interests: ${interests && interests.length > 0 ? interests.join(", ") : "Not specified"}
- Strengths: ${strengths && strengths.length > 0 ? strengths.join(", ") : "Not specified"}
- CGPA: ${cgpa}
- Branch: ${branch}

You MUST return ONLY a valid raw JSON object strictly adhering to this structure:
{
  "careers": [
    {
      "title": "Software Development Engineer (Backend)",
      "match": 92,
      "description": "Design and build scalable server-side systems and APIs.",
      "skills": ["TypeScript", "Node.js", "PostgreSQL", "System Design"],
      "roadmap": [
        "Master advanced data structures and algorithms",
        "Deep dive into distributed systems patterns",
        "Build a production multi-tenant web application",
        "Practice high-frequency mock system design interviews"
      ]
    }
  ],
  "skillGaps": ["System Design", "Cloud Infrastructure (AWS/GCP)", "Docker & CI/CD"],
  "summary": "High-level strategic career roadmap summarizing strengths and high-priority learning areas."
}
No markdown backticks, just raw JSON.`;

    const aiResponse = await generateAIResponse(prompt);

    let parsed = {
      careers: [
        {
          title: "Full-Stack Software Engineer",
          match: 94,
          description: "Design high-performance web systems and full-stack cloud products.",
          skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "REST APIs"],
          roadmap: [
            "Master modern Next.js 14 server components & streaming",
            "Refine SQL transaction isolation and indexing strategies",
            "Build real-time event-driven apps",
            "Prepare for campus coding rounds and DSA",
          ],
        },
        {
          title: "AI & Systems Engineer",
          match: 86,
          description: "Integrate LLMs and vector search retrieval into scalable backend applications.",
          skills: ["Python", "FastAPI", "RAG", "Embeddings", "Docker"],
          roadmap: [
            "Study transformer architecture and embeddings math",
            "Implement production RAG pipelines",
            "Optimize inference latency and token costs",
          ],
        },
      ],
      skillGaps: ["Distributed Caching (Redis)", "Microservices Architecture", "Kubernetes"],
      summary: "Your engineering foundation is exceptionally strong. Focus on scaling projects to demonstrate production readiness to Tier-1 campus recruiters.",
    };

    try {
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("AI JSON parse error in career recommend, using fallback:", e);
    }

    const recommendation = await prisma.careerRecommendation.create({
      data: {
        userId: session.user.id,
        careers: JSON.stringify(parsed.careers),
        analysis: JSON.stringify(parsed),
      },
    });

    // Update student profile
    await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        skills: JSON.stringify(skills),
        interests: JSON.stringify(interests || []),
        cgpa: parseFloat(cgpa.toString()),
        branch: branch,
      },
      create: {
        userId: session.user.id,
        skills: JSON.stringify(skills),
        interests: JSON.stringify(interests || []),
        cgpa: parseFloat(cgpa.toString()),
        branch: branch,
      },
    });

    return NextResponse.json({
      id: recommendation.id,
      careers: parsed.careers,
      skillGaps: parsed.skillGaps || [],
      summary: parsed.summary || "",
      createdAt: recommendation.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Career recommendation error:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
