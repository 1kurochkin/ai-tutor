import {NextRequest, NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import {generateToken, getUserFromToken, setTokenCookie} from "@/lib/auth";


export async function GET(req: NextRequest) {
  // Check authentication
  console.log("GET ME")
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }
  console.log(token, 'TOKEN')
  const user = await getUserFromToken(token)
  console.log(user, 'USER')
  if (!user) {
    return NextResponse.json({error: 'Invalid token'}, {status: 401})
  }

  const res = NextResponse.json(user);

  return setTokenCookie(res, token);
}
