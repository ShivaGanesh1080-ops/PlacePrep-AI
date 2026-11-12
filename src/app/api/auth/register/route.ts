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

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { detail: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { detail: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json(
        { detail: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { detail: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { detail: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and profile in transaction
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "STUDENT",
        profile: {
          create: {
            skills: JSON.stringify(["Problem Solving", "Web Development"]),
            interests: JSON.stringify(["Software Engineering"]),
            strengths: JSON.stringify(["Core CS Fundamentals"]),
          },
        },
      },
    });

    // Generate robust bearer token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    };
    const access_token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");

    return NextResponse.json(
      {
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
        message: "Account created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register endpoint error:", error);
    return NextResponse.json(
      { detail: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
