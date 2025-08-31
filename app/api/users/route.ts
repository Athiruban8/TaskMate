// app/api/users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(req: Request) {
  const body = await req.json();
  const { email, name } = body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    const newUser = await prisma.user.create({
      data: { email, name },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}
