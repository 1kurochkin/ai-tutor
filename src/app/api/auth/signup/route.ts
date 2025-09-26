import {NextResponse} from "next/server";
import bcrypt from "bcrypt";
import {prisma} from "@/lib/prisma";
import {generateToken, setTokenCookie} from "@/lib/auth";


export async function POST(req: Request) {
  console.log("SIGNUP ROUTE");
  try {
    const { email, password } = await req.json();
    console.log("payload", email, password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const { id } = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken({ userId: id, email });

    const res = NextResponse.json({
      message: "Signup successful",
      user: { id, email },
    });

    return setTokenCookie(res, token);
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
