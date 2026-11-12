import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { detail: "Invalid request payload. Expected JSON body." },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { detail: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { detail: "Invalid email or password" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    };
    const access_token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");

    return NextResponse.json({
      access_token,
      role: user.role.toLowerCase(),
      name: user.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      success: true,
    });
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json(
      { detail: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
