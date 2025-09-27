import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export function generateToken(payload: object) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

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

type TokenPayload = {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
};

export async function getUserFromToken(token: string) {
    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as TokenPayload;
        console.log(payload, "getUserFromToken");
        if (!payload?.userId) {
            return null;
        }
        return await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true },
        });
    } catch (err) {
        console.error("Invalid token:", err);
        return null;
    }
}

export async function apiFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(url, { ...options, credentials: "include" });
    console.log(res, "RESPONSE")
    if (res.status === 401) {
        console.log("LOGOUT!!!!!!!!")
        await fetch("/api/auth/logout", { method: "POST" });
        return res;
    }
    return res;
}
