import { NextResponse } from "next/server";

export function setTokenCookie(res: NextResponse, token: string) {
  const cookieObj = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: token ? 60 * 60 * 24 * 7 : 0, // 7 days or expire immediately
  };

  res.cookies.set("token", token || "", cookieObj);
  return res;
}
