import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAIResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history, type } = await req.json();

    const formattedHistory = (history || [])
      .map((m: { role: string; content: string }) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n");

    const prompt = `You are an expert ${type || "Technical"} interviewer conducting a placement interview.
Here is the previous conversation:
${formattedHistory}

Candidate's latest response:
"${message}"

Instructions:
1. Provide a 1-sentence brief constructive evaluation/acknowledgement of the candidate's response.
2. Ask the next question relevant to the role and the conversation flow.
3. Keep the total output brief, realistic, and professional. Ask only ONE question.`;

    const aiResponse = await generateAIResponse(prompt);
    return NextResponse.json({ message: aiResponse.trim() });
  } catch (error) {
    console.error("Error continuing interview chat:", error);
    return NextResponse.json({ error: "Failed to process interview response" }, { status: 500 });
  }
}
