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

// GET /api/copilot/conversations/[id] - Get messages for a specific conversation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getAuthenticatedDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/copilot/conversations/[id] - Rename a conversation
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getAuthenticatedDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Valid title string required" },
        { status: 400 }
      );
    }

    const updated = await prisma.chatConversation.updateMany({
      where: {
        id,
        userId: dbUser.id,
      },
      data: {
        title: title.slice(0, 60).trim(),
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Error updating conversation title:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// DELETE /api/copilot/conversations/[id] - Delete a conversation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getAuthenticatedDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.chatConversation.deleteMany({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
