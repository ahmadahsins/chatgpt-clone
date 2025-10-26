"use client";

import { NewChatButton } from "@/components/new-chat-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

function ChatHistoryLoading() {
  return (
    <SidebarGroup>
      <div className="space-y-2 px-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </SidebarGroup>
  );
}

interface ChatSidebarProps {
  chatHistoryContent: ReactNode;
  userEmail?: string;
  userName?: string;
  userImage?: string;
}

export function ChatSidebar({
  chatHistoryContent,
  userEmail = "user@example.com",
  userName = "User",
  userImage = "",
}: ChatSidebarProps) {
  const { theme } = useTheme();

  const handleLogout = () => {
    authClient.signOut({});
    redirect("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <Image
          src={theme === "light" ? "/openai-light.png" : "/openai-dark.png"}
          alt="Logo"
          width={20}
          height={20}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* New Chat Button */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NewChatButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Chat History */}
            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <Suspense fallback={<ChatHistoryLoading />}>
                {chatHistoryContent}
              </Suspense>
            </SidebarGroup>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 min-w-0 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    <AvatarImage src={userImage} />
                  </Avatar>
                  <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium truncate">
                      {userName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>{userEmail}</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                  <DropdownMenuShortcut>
                    <LogOut />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
