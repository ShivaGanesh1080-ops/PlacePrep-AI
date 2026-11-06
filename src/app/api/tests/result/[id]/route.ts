import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
    });

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Test attempt not found" }, { status: 404 });
    }

    const parsedAnswers = JSON.parse(attempt.answers || "[]");
    const questionIds = parsedAnswers.map((a: { questionId: string }) => a.questionId);

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const detailedQuestions = parsedAnswers.map((ans: { questionId: string; selected: string; isCorrect: boolean }) => {
      const q = questionMap.get(ans.questionId);
      return {
        id: ans.questionId,
        text: q?.text || "Question not found",
        optionA: q?.optionA || "",
        optionB: q?.optionB || "",
        optionC: q?.optionC || "",
        optionD: q?.optionD || "",
        userSelected: ans.selected,
        correctAnswer: q?.answer || "",
        isCorrect: ans.isCorrect,
        explanation: q?.explanation || "Review fundamental concepts related to this topic.",
      };
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        category: attempt.category,
        score: attempt.score,
        total: attempt.total,
        timeTaken: attempt.timeTaken,
        createdAt: attempt.createdAt,
      },
      questions: detailedQuestions,
    });
  } catch (error) {
    console.error("Error retrieving test results:", error);
    return NextResponse.json({ error: "Failed to load results" }, { status: 500 });
  }
}
