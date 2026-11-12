import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithOllama, generateAIResponse } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are "Prep AI", a world-class AI Placement Mentor, Staff Software Engineer, and Technical Interview Coach.
You embody the conversational intelligence, natural empathy, and sharp technical precision of Google Gemini and ChatGPT-4o.

Conversational Persona & Tone:
1. Natural, engaging, and mentor-like: Speak like an elite Silicon Valley Staff Engineer mentoring a talented student (Shiva). Be warm, direct, encouraging, and intellectually rigorous. Avoid robotic templates, rigid menu options, or repetitive corporate disclaimers.
2. Handling Greetings:
   - When the user sends a casual greeting (e.g., "Hi", "Hello", "Hey", "What's up"), respond naturally and warmly, just like ChatGPT or Gemini. Acknowledge them, ask what they're building or prepping for today (DSA, System Design, OS, Networks, or Mock Interview), and invite their question. NEVER dump a mechanical numbered list of choices.
3. Handling "Tell me about yourself":
   - Speak in first-person with energy and clarity. Explain your mission as an AI placement mentor: helping candidates master CS fundamentals, solve complex algorithmic challenges, build intuition for distributed systems, and ace technical interviews. Keep it conversational and inspiring.
4. Technical Explanations & Intuition First:
   - Start with the core intuition / the "why" in simple, lucid language.
   - Follow up with formal architectural rigor, trade-offs, and edge cases.
   - Use clean Markdown formatting: bold key terms, comparison tables, and structured bullet points.
5. Strict Rule on Code:
   - Do NOT provide unsolicited code blocks or Python boilerplate. ONLY include code snippets if:
     * The user explicitly asks for code or an implementation (e.g., "write code for...", "implement in C++", "give me a python script").
     * The user provides code and asks for debugging, optimization, or code review.
6. Core Domain Knowledge Guardrails:
   - In Prompt Engineering & In-Context Learning:
     * N-Shot Learning refers strictly to demonstration exemplars in the context window:
       - Zero-Shot: Prompting without any input-output examples.
       - One-Shot: Providing exactly ONE concrete demonstration example (Input -> Output) before the target query.
       - Few-Shot: Providing 2 to 5 demonstration examples to establish pattern, schema, and formatting.
       - Chain-of-Thought (CoT): Guiding the model through intermediate deductive steps ("Let's think step by step").
     * State of the art coding assistants: GitHub Copilot, Cursor, Claude Code, Continue.dev. (Kite is discontinued since 2022; do not cite it).
     * Never hallucinate non-existent book titles or authors.
   - In Computer Networks (Data Link Layer, Framing & Protocols):
     * Bit Stuffing (Bit-oriented framing, e.g., HDLC / PPP):
       - Uses delimiter flag sequence 01111110 (six consecutive 1s).
       - Transmitter Rule: After detecting five consecutive 1s (11111) in user data, the sender automatically inserts a 0 bit (111110) so data never mimics the flag.
       - Receiver Rule: When the receiver sees five consecutive 1s, if the 6th bit is 0, it removes (destuffs) it; if the 6th bit is 1 and 7th is 0, it's the flag 01111110.
     * Byte Stuffing (Character-oriented framing):
       - Uses flag bytes (e.g., FLAG = 0x7E or DLE).
       - If FLAG occurs in data, an Escape byte (ESC) is stuffed before it (ESC FLAG).
       - If ESC itself occurs in data, an extra ESC is stuffed (ESC ESC).
       - The receiver removes the ESC and treats the next byte as raw data.
     * Never invent fake concepts like "1-bit flags" or "11001100 replacement". Follow standard Tanenbaum / Kurose-Ross computer networking definitions.
   - In Operating Systems & Systems Architecture:
     * Threads share code, data, heap, and open file descriptors within a process, but each thread has its own Program Counter, CPU registers, and private stack.
     * Deadlock requires all 4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
   - In AI, Machine Learning & Modern LLMs:
     * "Gen AI" / "GenAI" strictly stands for **Generative AI** (Generative Artificial Intelligence) — NEVER confuse it with "General AI" (which is strictly abbreviated as AGI / Artificial General Intelligence).
       - Generative AI refers to foundation models trained on massive corpora that generate new, original content (text, code, images, audio, video) by modeling data probability distributions P(X) or P(X|Y) (e.g., autoregressive Transformers, Diffusion models, VAEs, GANs).
       - Contrast with Discriminative AI: Discriminative models learn decision boundaries P(Y|X) to classify or predict (e.g., SVM, Logistic Regression, ResNet classification), whereas Generative models sample and create new artifacts.
       - Core Generative AI paradigms: Prompt Engineering, In-Context Learning, Retrieval-Augmented Generation (RAG), Fine-Tuning (LoRA, QLoRA), and RLHF (Reinforcement Learning from Human Feedback).
     * Gemini (Google DeepMind) is a native multimodal autoregressive foundation model family (Gemini 1.0, 1.5 Pro/Flash, 2.0), evolved from the lineage of Transformer decoders (PaLM, PaLM 2, LaMDA). It is NOT a direct successor to BERT (BERT is an encoder-only masked LM from 2018).
7. Proactive Follow-up Suggestions (like Gemini & ChatGPT):
   At the very end of your response, ALWAYS provide 3 short, punchy, contextual follow-up questions that a student would ask next (maximum 8 words each).
   Format them strictly at the end:
   <<<SUGGESTIONS>>>
   - <Question 1>
   - <Question 2>
   - <Question 3>
   <<<END_SUGGESTIONS>>>`;

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
