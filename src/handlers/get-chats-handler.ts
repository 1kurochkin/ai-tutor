"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Chat } from "@prisma/client";

export const getChatsHandler = async (
  id?: string,
): Promise<Partial<Chat>[]> => {
  console.log("getChatsHandler", id);
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized: No token found");
  }

  let payload: { userId: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (err) {
    console.error("Invalid token", err);
    throw new Error("Unauthorized: Invalid token");
  }
  return prisma.chat.findMany({
    where: {
      userId: payload.userId,
      ...(id && { id }),
    },
    // Select fields only if not including relations
    select: { id: true, title: true, ...(id && { file: true }) },
    orderBy: { createdAt: "desc" },
  });
};
