import { NextResponse } from "next/server";
import { setTokenCookie } from "@/lib/set-token-cookie";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });
  return setTokenCookie(res, "");
}
