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

    const { type } = await req.json();
    const prompt = `You are a professional ${type || "Technical"} interviewer at a premier technology company.
Start the mock interview with a polite, realistic greeting and your first question.
Keep your response concise, professional, and ask exactly ONE question. Do not answer yourself.`;

    const aiResponse = await generateAIResponse(prompt);
    return NextResponse.json({
      message: aiResponse.trim(),
      type: type || "Technical",
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 });
  }
}
