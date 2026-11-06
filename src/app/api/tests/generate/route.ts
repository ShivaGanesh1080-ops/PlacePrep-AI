import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, difficulty, count } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const questionCount = Math.min(Math.max(Number(count) || 5, 3), 10);
    const selectedDifficulty = difficulty || "MEDIUM";

    const prompt = `You are a Senior Technical Examiner crafting placement exam questions for candidates applying to top tech companies.
Topic: "${topic}"
Difficulty Level: "${selectedDifficulty}"
Generate exactly ${questionCount} multiple-choice placement aptitude/technical questions.

You MUST return ONLY a valid JSON array of objects strictly following this format:
[
  {
    "text": "Precise and clear question statement?",
    "optionA": "Option 1",
    "optionB": "Option 2",
    "optionC": "Option 3",
    "optionD": "Option 4",
    "answer": "A",
    "explanation": "Clear 1-2 sentence concept explanation of why this answer is correct."
  }
]
Rules:
- Exactly 4 options (optionA, optionB, optionC, optionD).
- "answer" must be exactly one letter: "A", "B", "C", or "D".
- Questions must be technically accurate and realistic.
- Do NOT wrap in markdown backticks. Output raw JSON only.`;

    const aiResponse = await generateAIResponse(prompt);

    let parsedQuestions: Array<{
      text: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      answer: string;
      explanation: string;
    }> = [];

    try {
      const cleanJson = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedQuestions = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("AI generated test JSON parse error, using smart fallback:", e);
      parsedQuestions = [
        {
          text: `In ${topic}, what is the fundamental design objective?`,
          optionA: "Maximizing redundant computations",
          optionB: "Optimizing throughput, latency, and correctness",
          optionC: "Eliminating all data structures",
          optionD: "Restricting hardware concurrency",
          answer: "B",
          explanation: "Core engineering practices prioritize throughput, lower latency, and algorithmic correctness.",
        },
        {
          text: `Which trade-off is most prominent when working with ${topic}?`,
          optionA: "Time vs Space complexity",
          optionB: "Screen brightness vs volume",
          optionC: "Keyboard layout vs font size",
          optionD: "Mouse DPI vs audio bitrate",
          answer: "A",
          explanation: "Algorithmic and systems engineering regularly trades memory (space) for execution speed (time).",
        },
      ];
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return NextResponse.json({ error: "Failed to generate valid questions" }, { status: 500 });
    }

    // Determine category based on topic keywords
    const lowerTopic = topic.toLowerCase();
    let cat = "TECHNICAL";
    if (lowerTopic.includes("math") || lowerTopic.includes("percentage") || lowerTopic.includes("ratio") || lowerTopic.includes("number")) {
      cat = "QUANTITATIVE";
    } else if (lowerTopic.includes("english") || lowerTopic.includes("grammar") || lowerTopic.includes("verbal")) {
      cat = "VERBAL";
    } else if (lowerTopic.includes("puzzle") || lowerTopic.includes("logic") || lowerTopic.includes("reasoning")) {
      cat = "LOGICAL";
    }

    // Save questions to database
    const createdQuestions = [];
    for (const q of parsedQuestions) {
      if (q.text && q.optionA && q.optionB && q.optionC && q.optionD && q.answer) {
        const created = await prisma.question.create({
          data: {
            category: cat,
            difficulty: selectedDifficulty.toUpperCase(),
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            answer: q.answer.toUpperCase().trim(),
            explanation: q.explanation || `Core principles of ${topic}`,
          },
        });
        createdQuestions.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      category: cat,
      topic,
      count: createdQuestions.length,
      questions: createdQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
      })),
    });
  } catch (error) {
    console.error("Test generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
