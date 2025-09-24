"use client";

import { toast } from "sonner";

const createChatHandler = async (file: File) => {
  console.log("createChatHandler");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/api/chat/create", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  const data = await res.json();
  console.log("createChatHandler DATA", data);
  if (!res.ok) {
    toast(data.error || "Failed to create chat. Please try again later.");
    throw new Error(
      data.error || "Failed to create chat. Please try again later.",
    );
  }
  return data;
};

export default createChatHandler;
