import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

function generateTitleFromPrompt(prompt: string): string {
  const clean = prompt.replace(/[#*`_]/g, "").trim();
  if (!clean) return "Technical Query";
  const firstSentence = clean.split("\n")[0].split(/[.?!]/)[0];
  if (firstSentence.length <= 42) return firstSentence.trim();
  return firstSentence.slice(0, 39).trim() + "...";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, conversationId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // 1. Locate or create conversation
    let conversation = null;
    if (conversationId) {
      conversation = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId: session.user.id },
      });
    }

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId: session.user.id,
          title: "New Chat",
        },
      });
    }

    // 2. Identify the last user message
    const lastUserMessage = messages[messages.length - 1];
    const userContent = lastUserMessage?.content || "";
    const userImage = lastUserMessage?.image || null;

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: userContent,
        imageUrl: userImage ? userImage.slice(0, 200) : null, // Store reference/indicator if attached
      },
    });

    // Update title if it's currently "New Chat"
    if (conversation.title === "New Chat" && userContent) {
      const generatedTitle = generateTitleFromPrompt(userContent);
      await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { title: generatedTitle },
      });
    }

    // 3. Generate AI Response
    let aiResponse = "";

    // Try multi-turn chat with Cloudflare / Ollama first
    const chatResponse = await chatWithOllama(messages, SYSTEM_PROMPT);

    if (chatResponse) {
      aiResponse = chatResponse;
    } else {
      // Fallback single-turn generate
      const conversationHistory = messages
        .slice(-6)
        .map((m: { role: string; content: string }) => `${m.role === "user" ? "Student" : "Copilot"}: ${m.content}`)
        .join("\n");

      const fallbackPrompt = `${conversationHistory}\nStudent: ${userContent}\nCopilot:`;
      aiResponse = await generateAIResponse(fallbackPrompt, SYSTEM_PROMPT);
    }

    // 4. Save AI Response to database
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      },
    });

    // Touch conversation updatedAt
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Copilot chat error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with AI Copilot" },
      { status: 500 }
    );
  }
}
