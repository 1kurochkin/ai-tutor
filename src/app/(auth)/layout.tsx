"use client";
import React, { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen overflow-hidden justify-center items-center px-12">
      <div className={"w-[500px]"}>
        <Suspense>{children}</Suspense>
      </div>
    </main>
  );
}
