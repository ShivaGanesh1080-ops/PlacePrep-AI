import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chatWithOllama, generateAIResponse } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are "Prep AI", an intelligent placement mentor and technical interview coach.
Tone and Behavior Guidelines (like ChatGPT):
1. Be natural, conversational, direct, and concise.
2. CRITICAL RULE FOR CODE: Do NOT provide unsolicited code blocks or Python boilerplate. ONLY include code snippets if:
   - The user explicitly asks for code or an implementation (e.g. "write code for...", "give me a python script", "implement in C++")
   - The user shares code and asks for a bug fix or code review.
3. If the user asks a conceptual question, asks for an explanation, asks "what is this", or asks about HR/interview advice, answer in clean, crisp prose with bullet points — DO NOT output code or a Python sandbox block.
4. If the user attaches an image or asks about an image, analyze the contents of the image directly and explain what it depicts clearly.
5. Format your answers with clean Markdown headings, bullet points, and bold text.`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Try multi-turn chat with Ollama first
    const chatResponse = await chatWithOllama(messages, SYSTEM_PROMPT);

    if (chatResponse) {
      return NextResponse.json({ response: chatResponse });
    }

    // If chat failed, format prompt for single-turn generate
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const conversationHistory = messages
      .slice(-6)
      .map((m: { role: string; content: string }) => `${m.role === "user" ? "Student" : "Copilot"}: ${m.content}`)
      .join("\n");

    const fallbackPrompt = `${conversationHistory}\nStudent: ${lastUserMessage}\nCopilot:`;
    const genResponse = await generateAIResponse(fallbackPrompt, SYSTEM_PROMPT);

    return NextResponse.json({ response: genResponse });
  } catch (error) {
    console.error("Copilot chat error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with AI Copilot" },
      { status: 500 }
    );
  }
}
