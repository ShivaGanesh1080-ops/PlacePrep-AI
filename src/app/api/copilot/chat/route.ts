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
  if (!clean) return "Placement Doubt";
  const firstSentence = clean.split("\n")[0].split(/[.?!]/)[0];
  if (firstSentence.length <= 40) return firstSentence.trim();
  return firstSentence.slice(0, 37).trim() + "...";
}

async function getAuthenticatedDbUser() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    if (session.user.id) {
      const userById = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (userById) return userById;
    }

    if (session.user.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
      });
      if (userByEmail) return userByEmail;
    }
  } catch (err) {
    console.warn("User lookup error:", err);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1];
    const userContent = lastUserMessage?.content || "";
    const userImage = lastUserMessage?.image || null;

    // 1. Resolve logged-in DB user (graceful fallback)
    const dbUser = await getAuthenticatedDbUser();
    let conversation: { id: string; title: string } | null = null;

    // 2. Safely create or locate conversation thread in database
    if (dbUser) {
      try {
        if (conversationId) {
          conversation = await prisma.chatConversation.findFirst({
            where: { id: conversationId, userId: dbUser.id },
          });
        }

        if (!conversation) {
          conversation = await prisma.chatConversation.create({
            data: {
              userId: dbUser.id,
              title: "New Chat",
            },
          });
        }

        // Save incoming user message
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: "user",
            content: userContent,
            imageUrl: userImage ? userImage.slice(0, 200) : null,
          },
        });

        // Auto-title thread from first prompt if "New Chat"
        if (conversation.title === "New Chat" && userContent) {
          const generatedTitle = generateTitleFromPrompt(userContent);
          await prisma.chatConversation.update({
            where: { id: conversation.id },
            data: { title: generatedTitle },
          });
        }
      } catch (dbErr) {
        console.warn("Database conversation save error (continuing with AI generation):", dbErr);
      }
    }

    // 3. Generate AI Response
    let aiResponse = "";
    try {
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
    } catch (aiErr) {
      console.error("AI Generation error:", aiErr);
      aiResponse = "I'm having a brief issue reaching the AI inference engine. Please try asking again in a moment.";
    }

    // 4. Safely save Assistant Response to database
    if (dbUser && conversation) {
      try {
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: aiResponse,
          },
        });

        await prisma.chatConversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
      } catch (dbErr) {
        console.warn("Database assistant save error:", dbErr);
      }
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation?.id || null,
    });
  } catch (error) {
    console.error("Copilot chat route error:", error);
    return NextResponse.json(
      {
        response:
          "I'm here to help with your placement preparation! What Data Structures, Algorithms, or Core CS doubt would you like to solve?",
      },
      { status: 200 }
    );
  }
}
