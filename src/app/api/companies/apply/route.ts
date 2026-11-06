import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<string, string[]> = {
  INTERESTED: ["APPLIED"],
  APPLIED: [],
  SHORTLISTED: [],
  SELECTED: [],
  REJECTED: [],
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, status } = body;

    if (!companyId || !status) {
      return NextResponse.json(
        { error: "companyId and status are required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.companyApplication.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId,
        },
      },
    });

    if (existing) {
      const allowed = VALID_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${existing.status} to ${status}`,
          },
          { status: 400 }
        );
      }
    } else {
      if (status !== "INTERESTED") {
        return NextResponse.json(
          { error: "First action must be INTERESTED" },
          { status: 400 }
        );
      }
    }

    const application = await prisma.companyApplication.upsert({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId,
        },
      },
      update: { status },
      create: {
        userId: session.user.id,
        companyId,
        status,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error applying to company:", error);
    return NextResponse.json(
      { error: "Failed to apply" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.companyApplication.findMany({
      where: { userId: session.user.id },
      include: { company: true },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
