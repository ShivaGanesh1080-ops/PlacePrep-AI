import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/copilot/conversations - List all chat conversations for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/copilot/conversations - Create a new empty conversation thread
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let title = "New Chat";
    try {
      const body = await req.json();
      if (body?.title && typeof body.title === "string") {
        title = body.title.slice(0, 50).trim() || "New Chat";
      }
    } catch {
      // Empty body is okay
    }

    const conversation = await prisma.chatConversation.create({
      data: {
        userId: session.user.id,
        title,
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

// DELETE /api/copilot/conversations - Clear all conversations for the user
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chatConversation.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing conversations:", error);
    return NextResponse.json(
      { error: "Failed to clear conversations" },
      { status: 500 }
    );
  }
}
