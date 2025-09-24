import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

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
