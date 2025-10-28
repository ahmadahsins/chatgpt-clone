"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteChatDialog } from "./delete-chat-dialog";
import { RenameChatDialog } from "./rename-chat-dialog";
import { Button } from "./ui/button";

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface ChatHistoryListProps {
  chats: Chat[];
}

// Client Component - Handle interactivity
export function ChatHistoryList({ chats }: ChatHistoryListProps) {
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    chatId: string;
    currentTitle: string;
  }>({
    open: false,
    chatId: "",
    currentTitle: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    chatId: "",
    title: "",
  });

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
              <SidebarMenuItem key={chat.id} className="group/item relative">
                <div className="flex items-center gap-1">
                  <SidebarMenuButton asChild className="flex-1">
                    <Link href={`/chat/${chat.id}`}>
                      <span className="truncate text-xs">{chat.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-32">
                      <DropdownMenuItem
                        onSelect={() => {
                          setRenameDialog({
                            open: true,
                            chatId: chat.id,
                            currentTitle: chat.title,
                          });
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setDeleteDialog({
                            open: true,
                            chatId: chat.id,
                            title: chat.title,
                          });
                        }}
                        className="text-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="mr-1 h-4 w-4 focus:text-destructive" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>

      <RenameChatDialog
        chatId={renameDialog.chatId}
        currentTitle={renameDialog.currentTitle}
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
      />

      <DeleteChatDialog
        chatId={deleteDialog.chatId}
        chatTitle={deleteDialog.title}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      />
    </SidebarGroup>
  );
}
