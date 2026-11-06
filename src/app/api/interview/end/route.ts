import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcript, type } = await req.json();

    const transcriptText = Array.isArray(transcript)
      ? transcript.map((m: { role: string; content: string }) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n")
      : String(transcript);

    const prompt = `You are an executive hiring manager and interview evaluator evaluating this ${type || "Technical"} interview transcript.
Transcript:
${transcriptText}

Evaluate the candidate's performance thoroughly. You must return ONLY a valid JSON object with the following schema:
{
  "score": 82,
  "feedback": "Overall performance summary highlighting communication, technical clarity, and areas needing polish.",
  "strengths": ["Clear articulation of technical concepts", "Good problem-solving structure", "Confident delivery"],
  "improvements": ["Provide deeper details on complexity analysis", "Use STAR method more consistently"]
}
Do not include markdown ticks, just raw JSON.`;

    const aiResponse = await generateAIResponse(prompt);
    
    let parsedData = {
      score: 75,
      feedback: "Good interview performance overall with clear communication.",
      strengths: ["Clear communication", "Structured thinking", "Confidence"],
      improvements: ["Elaborate more on trade-offs", "Provide concrete project metrics"],
    };

    try {
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Failed to parse AI evaluation JSON, using extracted or fallback:", e);
    }

    const interviewRecord = await prisma.mockInterview.create({
      data: {
        userId: session.user.id,
        type: type || "Technical",
        transcript: JSON.stringify(transcript),
        feedback: JSON.stringify(parsedData),
        score: parsedData.score || 75,
      },
    });

    return NextResponse.json({
      id: interviewRecord.id,
      score: parsedData.score,
      feedback: parsedData.feedback,
      strengths: parsedData.strengths,
      improvements: parsedData.improvements,
    });
  } catch (error) {
    console.error("Error finalizing interview:", error);
    return NextResponse.json({ error: "Failed to evaluate interview" }, { status: 500 });
  }
}
