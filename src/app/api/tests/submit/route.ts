import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, answers, timeTaken } = await req.json();

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    const questionIds = answers.map((a: { questionId: string }) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    const evaluatedAnswers = answers.map((userAns: { questionId: string; selected: string | null }) => {
      const q = questionMap.get(userAns.questionId);
      const isCorrect = q && userAns.selected?.toUpperCase() === q.answer.toUpperCase();
      if (isCorrect) correctCount++;
      return {
        questionId: userAns.questionId,
        selected: userAns.selected,
        correctAnswer: q?.answer || null,
        isCorrect: !!isCorrect,
      };
    });

    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        category: (category || "QUANTITATIVE").toUpperCase(),
        score: correctCount,
        total: answers.length,
        timeTaken: Number(timeTaken) || 0,
        answers: JSON.stringify(evaluatedAnswers),
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score: correctCount,
      total: answers.length,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}
