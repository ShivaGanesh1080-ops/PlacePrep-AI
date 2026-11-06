import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Admin fetch companies error:", error);
    return NextResponse.json({ error: "Failed to load companies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, role, package: pkg, cgpaCutoff, description, eligibility, visitDate, status } = body;

    if (!name || !role || !pkg || cgpaCutoff === undefined) {
      return NextResponse.json({ error: "Missing required company fields" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        role,
        package: pkg,
        cgpaCutoff: parseFloat(cgpaCutoff),
        description: description || null,
        eligibility: eligibility || null,
        visitDate: visitDate ? new Date(visitDate) : null,
        status: status || "UPCOMING",
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Admin create company error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, role, package: pkg, cgpaCutoff, description, eligibility, visitDate, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name,
        role,
        package: pkg,
        cgpaCutoff: parseFloat(cgpaCutoff),
        description,
        eligibility,
        visitDate: visitDate ? new Date(visitDate) : null,
        status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update company error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete company error:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
