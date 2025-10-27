import { getUserChats } from "@/server/chat-actions";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export async function ChatHistorySidebar() {
  const chats = await getUserChats();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No chat history yet
            </div>
          ) : (
            chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/chat/${chat.id}`}>
                    <span className="truncate">{chat.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
