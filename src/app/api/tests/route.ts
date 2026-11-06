import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    const whereClause: Record<string, string> = {};
    if (category) {
      whereClause.category = category.toUpperCase();
    }
    if (difficulty && difficulty.toUpperCase() !== "ALL") {
      whereClause.difficulty = difficulty.toUpperCase();
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      take: 30,
    });

    // Shuffle questions and omit correct answer & explanation so student cannot cheat
    const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, 10);
    const safeQuestions = shuffled.map((q) => ({
      id: q.id,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      category: q.category,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      questions: safeQuestions,
      total: questions.length,
      category: category ? category.toUpperCase() : "ALL",
    });
  } catch (error) {
    console.error("Error fetching test questions:", error);
    return NextResponse.json({ error: "Failed to load test questions" }, { status: 500 });
  }
}
