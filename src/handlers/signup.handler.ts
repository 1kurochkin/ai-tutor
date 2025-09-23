"use server";
import { SignupFormValues } from "@/app/(auth)/signup/page";
const signupHandler = async (
  values: Omit<SignupFormValues, "confirmPassword">,
) => {
  console.log("signupHandler", values);
  const response = await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(values),
  });
  const data = await response.json();
  console.log("signupHandler DATA", data);
  if (!response.ok) {
    throw new Error(data.error || "Failed to signup. Please try again later.");
  }
  return data;
};

export default signupHandler;
