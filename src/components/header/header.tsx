"use server";
import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/get-user-from-token";
import NavButtons from "@/components/header/nav-buttons";

const Header = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user = null;
  if (token) {
    user = await getUserFromToken(token);
  }

  return (
    <header className="border-b border-dashed border-black transition-transform duration-300">
      <nav className="px-6 lg:px-20 py-5 lg:py-6 w-full flex justify-between items-center">
        <Link href="/home" className="font-mono text-xl hover:scale-105">
          {"< AI-TUTOR >"}
        </Link>
        <NavButtons user={user} />
      </nav>
    </header>
  );
};

export default Header;
