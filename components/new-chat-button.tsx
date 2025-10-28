"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function NewChatButton() {
  const params = useParams();
  const isNewChat = !params.id;

  return (
    <SidebarMenuButton asChild isActive={isNewChat}>
      <Link href="/chat">
        <Edit className="h-4 w-4" />
        <span className="text-xs">New Chat</span>
      </Link>
    </SidebarMenuButton>
  );
}
