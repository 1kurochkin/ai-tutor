"use client";
const getMeHandler = async () => {
  console.log("getMeHandler");
  const response = await fetch("http://localhost:3000/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await response.json();
  console.log("getMeHandler DATA", data);
  if (!response.ok) {
    throw new Error(data.error || "Failed to get me. Please try again later.");
  }
  return data;
};

export default getMeHandler;
