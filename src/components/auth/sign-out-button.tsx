"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return <Button variant="outline" size="sm" className="sign-out-button" onClick={()=>void signOut({ callbackUrl: "/login" })}>تسجيل الخروج</Button>;
}
