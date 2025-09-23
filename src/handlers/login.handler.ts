"use client";
import { LoginFormValues } from "@/app/(auth)/login/page";

const loginHandler = async (values: LoginFormValues) => {
  console.log("loginHandler", values);
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
  const data = await response.json();
  console.log("loginHandler DATA", data);
  if (!response.ok) {
    throw new Error(data.error || "Failed to login. Please try again later.");
  }
  return data;
};

export default loginHandler;
