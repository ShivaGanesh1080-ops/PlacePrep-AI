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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileData = {
      name: user.name,
      email: user.email,
      role: user.role,
      cgpa: user.profile?.cgpa || null,
      branch: user.profile?.branch || "",
      year: user.profile?.year || null,
      skills: user.profile?.skills ? JSON.parse(user.profile.skills) : [],
      interests: user.profile?.interests ? JSON.parse(user.profile.interests) : [],
      strengths: user.profile?.strengths ? JSON.parse(user.profile.strengths) : [],
      resumeText: user.profile?.resumeText || "",
      linkedinUrl: user.profile?.linkedinUrl || "",
      githubUrl: user.profile?.githubUrl || "",
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      cgpa,
      branch,
      year,
      skills,
      interests,
      strengths,
      linkedinUrl,
      githubUrl,
      resumeText,
    } = body;

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        cgpa: cgpa ? parseFloat(cgpa) : null,
        branch: branch || null,
        year: year ? parseInt(year) : null,
        skills: Array.isArray(skills) ? JSON.stringify(skills) : null,
        interests: Array.isArray(interests) ? JSON.stringify(interests) : null,
        strengths: Array.isArray(strengths) ? JSON.stringify(strengths) : null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        resumeText: resumeText || null,
      },
      create: {
        userId: session.user.id,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        branch: branch || null,
        year: year ? parseInt(year) : null,
        skills: Array.isArray(skills) ? JSON.stringify(skills) : null,
        interests: Array.isArray(interests) ? JSON.stringify(interests) : null,
        strengths: Array.isArray(strengths) ? JSON.stringify(strengths) : null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        resumeText: resumeText || null,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
