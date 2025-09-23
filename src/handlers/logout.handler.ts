"use client";

export async function logoutHandler() {
  const res = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Logout failed");
}
