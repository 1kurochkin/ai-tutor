import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";
import {prisma} from "@/lib/prisma";

export async function GET() {
  console.log("GET ME");
  try {
    const cookieStore = await cookies();
    console.log(cookieStore, "cookieStore");
    const token = cookieStore.get("token")?.value;
    console.log("GET ME", token);
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    console.log("GET ME", decoded);
    const user = await prisma.user.findUnique({
      where: {id: decoded.userId}
    })
    if(!user) throw new Error()
    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
    });
  } catch (e) {
    console.error("Auth verification failed:", e);
    // Clear invalid token
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.set("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return response;
  }
}
