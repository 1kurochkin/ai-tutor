import { NextResponse } from "next/server";

export function setTokenCookie(res: NextResponse, token: string) {
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
