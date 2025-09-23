"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutHandler } from "@/handlers/logout.handler";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NavigationButtonsProps {
  user: { id: string; email: string } | null;
}
const NavButtons = ({ user }: NavigationButtonsProps) => {
  const router = useRouter();
  const logout = async () => {
    try {
      await logoutHandler();
      toast("Logged out!");
      router.replace("/login");
    } catch (e) {
      toast("There was error logging out! Try again later");
    }
  };

  const navigationRender = user
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Logout", href: "", onClick: logout },
      ]
    : [
        { label: "Login", href: "/login" },
        { label: "Signup", href: "/signup" },
      ];

  return (
    <div className="flex gap-x-2 items-center">
      {navigationRender.map((item) => (
        <Button onClick={item.onClick} key={item.label} asChild>
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
    </div>
  );
};

export default NavButtons;
