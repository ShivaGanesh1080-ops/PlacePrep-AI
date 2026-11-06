import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const minCgpa = searchParams.get("minCgpa") ? parseFloat(searchParams.get("minCgpa")!) : undefined;
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};

    if (minCgpa !== undefined && !isNaN(minCgpa)) {
      where.cgpaCutoff = { lte: minCgpa };
    }

    if (status && status !== "All") {
      where.status = status.toUpperCase();
    }

    let companies = await prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (search) {
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.role.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
