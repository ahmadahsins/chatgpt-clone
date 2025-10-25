"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export function ButtonLogout() {
  const handleLogout = () => {
    authClient.signOut({});
    redirect("/login");
  };
  return <Button onClick={handleLogout}>Sign out</Button>;
}
