'use client'
import {toast} from "sonner";
import {User} from "@prisma/client";

const getUserHandler = async (): Promise<User> => {
  console.log("getMeHandler")
  const response = await fetch('/api/auth/user')
  const data = await response?.json()
  if (!response?.ok) {
    toast(data?.error || "Failed to get user, please try again later!")
  }
  return data

}

export default getUserHandler
