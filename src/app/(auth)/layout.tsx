"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen overflow-hidden justify-center items-center px-12">
      <Button asChild className={"absolute top-4 left-4"}>
        <Link href={"/home"}>Home</Link>
      </Button>

      <div className={"w-[500px]"}>
        <Suspense>{children}</Suspense>
      </div>
    </main>
  );
}
