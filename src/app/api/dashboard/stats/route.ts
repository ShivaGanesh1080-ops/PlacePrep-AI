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

    const userId = session.user.id;

    const [testAttempts, interviews, resumes, user] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mockInterview.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.resumeAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
    ]);

    const totalTests = testAttempts.length;
    const avgScore = totalTests > 0
      ? Math.round(testAttempts.reduce((sum, t) => sum + (t.score / (t.total || 1)) * 100, 0) / totalTests)
      : 0;

    // Calculate genuine profile completeness (0-100%)
    let profileCompleteness = 0;
    if (user?.profile) {
      if (user.profile.cgpa) profileCompleteness += 15;
      if (user.profile.branch) profileCompleteness += 10;
      try {
        const parsedSkills = user.profile.skills ? JSON.parse(user.profile.skills) : [];
        if (parsedSkills.length >= 3) profileCompleteness += 25;
        else if (parsedSkills.length > 0) profileCompleteness += parsedSkills.length * 8;
      } catch {
        if (user.profile.skills) profileCompleteness += 15;
      }
      try {
        const parsedInterests = user.profile.interests ? JSON.parse(user.profile.interests) : [];
        if (parsedInterests.length >= 1) profileCompleteness += 15;
      } catch {
        if (user.profile.interests) profileCompleteness += 15;
      }
      try {
        const parsedStrengths = user.profile.strengths ? JSON.parse(user.profile.strengths) : [];
        if (parsedStrengths.length >= 1) profileCompleteness += 10;
      } catch {
        if (user.profile.strengths) profileCompleteness += 10;
      }
      if (user.profile.linkedinUrl || user.profile.githubUrl) profileCompleteness += 10;
      if (user.profile.resumeText) profileCompleteness += 15;
    }
    profileCompleteness = Math.min(profileCompleteness, 100);

    // Calculate dynamic readiness score based strictly on real milestones
    const profileWeight = (profileCompleteness / 100) * 35; // up to 35%
    const aptitudeWeight = totalTests > 0
      ? ((avgScore / 100) * 35) * Math.min(totalTests / 3, 1) // up to 35%
      : 0;
    const interviewWeight = Math.min(interviews.length * 10, 20); // up to 20%
    const resumeWeight = Math.min(resumes.length * 10, 10); // up to 10%
    const readinessScore = Math.min(100, Math.round(profileWeight + aptitudeWeight + interviewWeight + resumeWeight));

    // Category performance breakdown
    const categoryTotals: Record<string, { total: number; score: number }> = {
      QUANTITATIVE: { total: 0, score: 0 },
      VERBAL: { total: 0, score: 0 },
      LOGICAL: { total: 0, score: 0 },
      TECHNICAL: { total: 0, score: 0 },
    };

    testAttempts.forEach((t) => {
      const cat = t.category.toUpperCase();
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, score: 0 };
      }
      categoryTotals[cat].total += t.total;
      categoryTotals[cat].score += t.score;
    });

    const categoryPerformance = Object.entries(categoryTotals).map(([name, val]) => ({
      name,
      score: val.total > 0 ? Math.round((val.score / val.total) * 100) : 0,
    }));

    // Performance trend (last 7 attempts in chronological order)
    const performanceTrend = testAttempts
      .slice(0, 7)
      .reverse()
      .map((t, idx) => ({
        test: `Test ${idx + 1}`,
        score: Math.round((t.score / (t.total || 1)) * 100),
        category: t.category,
      }));

    // Real combined activities
    const activities = [
      ...testAttempts.slice(0, 3).map((t) => ({
        type: "TEST",
        title: `Attempted ${t.category} Aptitude Test`,
        subtitle: `Scored ${t.score}/${t.total} (${Math.round((t.score / (t.total || 1)) * 100)}%)`,
        date: t.createdAt,
      })),
      ...resumes.slice(0, 2).map((r) => ({
        type: "RESUME",
        title: `Scanned Resume with ATS Intelligence`,
        subtitle: `ATS Compatibility Score: ${r.score}%`,
        date: r.createdAt,
      })),
      ...interviews.slice(0, 2).map((i) => ({
        type: "INTERVIEW",
        title: `Completed ${i.type} Mock Interview`,
        subtitle: `Performance Score: ${i.score || 80}/100`,
        date: i.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      userName: user?.name || "Student",
      cgpa: user?.profile?.cgpa || null,
      branch: user?.profile?.branch || "CSE",
      profileCompleteness,
      readinessScore,
      stats: {
        testsTaken: totalTests,
        avgScore,
        interviewSessions: interviews.length,
        resumesScanned: resumes.length,
      },
      categoryPerformance,
      performanceTrend,
      activities,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
