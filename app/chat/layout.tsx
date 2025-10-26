"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MessageSquarePlus, MoreHorizontal, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ButtonLogout } from "@/components/button-logout";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="border-b p-4">
            <Image
              src={theme === "dark" ? "/openai-dark.png" : "/openai-light.png"}
              alt="Logo"
              width={20}
              height={20}
            />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Chat History Items */}
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span className="truncate">New Chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span className="truncate">Previous conversation</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span className="truncate">Another chat example</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium truncate">User</p>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <ButtonLogout />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Header with Sidebar Toggle */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">ChatGPT</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          {/* Main Chat Area */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
