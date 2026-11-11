import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractDocumentText, analyzeResumeDeep } from "@/lib/resume-analyzer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Error fetching resume history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeText, fileData, targetRole } = body;

    let textToAnalyze = "";
    let parsedFrom: "pdf" | "docx" | "image" | "text" = "text";
    let fileName = fileData?.fileName || "resume.txt";

    if (fileData && fileData.base64) {
      const rawBase64 = fileData.base64.includes(",")
        ? fileData.base64.split(",")[1]
        : fileData.base64;
      const buffer = Buffer.from(rawBase64, "base64");
      const extraction = await extractDocumentText(
        buffer,
        fileData.mimeType || "",
        fileData.fileName || ""
      );
      textToAnalyze = extraction.text;
      parsedFrom = extraction.parsedFrom;
      fileName = fileData.fileName || fileName;
    } else if (resumeText && typeof resumeText === "string" && resumeText.trim().length > 0) {
      textToAnalyze = resumeText.trim();
      parsedFrom = "text";
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 30) {
      return NextResponse.json(
        {
          error:
            "Could not extract sufficient text from your resume. Please check that the file is not empty or password-protected, or paste your plain-text resume directly.",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeResumeDeep(textToAnalyze, targetRole, parsedFrom);

    // Save to Database
    await prisma.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        resumeText: textToAnalyze.slice(0, 10000),
        score: analysis.score,
        feedback: JSON.stringify(analysis),
      },
    });

    // Update Student Profile with the latest resume text
    await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: { resumeText: textToAnalyze.slice(0, 5000) },
      create: { userId: session.user.id, resumeText: textToAnalyze.slice(0, 5000) },
    });

    return NextResponse.json({
      ...analysis,
      fileName,
    });
  } catch (error) {
    console.error("Resume analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
