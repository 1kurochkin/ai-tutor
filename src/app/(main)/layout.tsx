import React, { Suspense } from "react";
import Header from "@/components/header/header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Header />
      <Suspense>{children}</Suspense>
    </main>
  );
}
