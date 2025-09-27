'use client'
import { LoginFormValues } from '@/app/(auth)/login/page'
import {apiFetch} from "@/lib/auth";
import {toast} from "sonner";

const loginHandler = async (values: LoginFormValues) => {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(values),
  })
  const data = await response?.json()
  if (!response?.ok) {
    toast(data?.error || "Failed to login, please try again later!")
  }
  return data

}

export default loginHandler
