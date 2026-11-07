import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getAuthenticatedDbUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  if (session.user.id) {
    const userById = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (userById) return userById;
  }

  if (session.user.email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });
    if (userByEmail) return userByEmail;
  }

  return null;
}

// GET /api/copilot/conversations - List all chat conversations for logged-in user
export async function GET() {
  try {
    const dbUser = await getAuthenticatedDbUser();
    if (!dbUser) {
      return NextResponse.json({ conversations: [] });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId: dbUser.id },
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
      { error: "Failed to fetch conversations", conversations: [] },
      { status: 200 } // Return empty list rather than 500 error to keep UI functional
    );
  }
}

// POST /api/copilot/conversations - Create a new empty conversation thread
export async function POST(req: Request) {
  try {
    const dbUser = await getAuthenticatedDbUser();
    if (!dbUser) {
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
        userId: dbUser.id,
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
    const dbUser = await getAuthenticatedDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chatConversation.deleteMany({
      where: { userId: dbUser.id },
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
