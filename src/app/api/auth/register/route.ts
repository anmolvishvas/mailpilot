import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerUserSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validated = registerUserSchema.parse(json);

    const normalizedEmail = validated.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    let user;
    if (existingUser && !existingUser.password) {
      // User was created via invitation or OAuth placeholder
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: validated.name,
          password: hashedPassword,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: validated.name,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 400 }
    );
  }
}
