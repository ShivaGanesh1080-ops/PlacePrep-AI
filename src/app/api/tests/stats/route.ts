import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await prisma.testAttempt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const totalTests = attempts.length;
    const averageScore = totalTests > 0
      ? Math.round(
          (attempts.reduce((sum, a) => sum + (a.score / (a.total || 1)) * 100, 0) / totalTests)
        )
      : 0;

    const categoryStats: Record<string, { totalQuestions: number; bestScore: number | null }> = {
      QUANTITATIVE: { totalQuestions: 30, bestScore: null },
      VERBAL: { totalQuestions: 30, bestScore: null },
      LOGICAL: { totalQuestions: 30, bestScore: null },
      TECHNICAL: { totalQuestions: 30, bestScore: null },
    };

    attempts.forEach((att) => {
      const cat = att.category?.toUpperCase();
      if (categoryStats[cat]) {
        const pct = Math.round((att.score / (att.total || 1)) * 100);
        if (categoryStats[cat].bestScore === null || pct > categoryStats[cat].bestScore!) {
          categoryStats[cat].bestScore = pct;
        }
      }
    });

    // Find best category
    let bestCatName: string | null = null;
    let highestBest = -1;
    Object.entries(categoryStats).forEach(([cat, data]) => {
      if (data.bestScore !== null && data.bestScore > highestBest) {
        highestBest = data.bestScore;
        bestCatName = cat;
      }
    });

    return NextResponse.json({
      totalTests,
      averageScore,
      bestCategory: bestCatName,
      recentAttempts: attempts.slice(0, 5).map((a) => ({
        id: a.id,
        category: a.category,
        score: a.score,
        total: a.total,
        createdAt: a.createdAt,
      })),
      categoryStats,
    });
  } catch (error) {
    console.error("Error fetching test stats:", error);
    return NextResponse.json({ error: "Failed to load test stats" }, { status: 500 });
  }
}
