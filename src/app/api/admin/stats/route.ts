import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
    }

    const [totalUsers, totalTests, totalCompanies, questionsCount, attempts] = await Promise.all([
      prisma.user.count(),
      prisma.testAttempt.count(),
      prisma.company.count(),
      prisma.question.count(),
      prisma.testAttempt.findMany({ select: { score: true, total: true, category: true } }),
    ]);

    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.score / (a.total || 1)) * 100, 0) / attempts.length)
      : 0;

    const categoryDistribution: Record<string, number> = {};
    attempts.forEach((a) => {
      const cat = a.category.toUpperCase();
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryDistribution).map(([name, count]) => ({
      name,
      count,
    }));

    return NextResponse.json({
      totalStudents: totalUsers,
      totalTestsTaken: totalTests,
      totalCompaniesListed: totalCompanies,
      totalQuestions: questionsCount,
      averageScore: avgScore,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Admin stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to load admin metrics" }, { status: 500 });
  }
}
