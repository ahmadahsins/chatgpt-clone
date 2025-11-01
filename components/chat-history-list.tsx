"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";
import { DeleteChatDialog } from "./delete-chat-dialog";
import { RenameChatDialog } from "./rename-chat-dialog";
import { Chat } from "@/types/chat";
import { ChatActionsDropdown } from "./chat-actions-dropdown";

interface ChatHistoryListProps {
  chats: Chat[];
}

// Client Component - Handle interactivity
export function ChatHistoryList({ chats }: ChatHistoryListProps) {
  const { setOpenMobile } = useSidebar();

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
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={() => setOpenMobile(false)}
                    >
                      <span className="truncate text-xs">{chat.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  <ChatActionsDropdown
                    isLayout={false}
                    chatId={chat.id}
                    chatTitle={chat.title}
                    onRename={(chatId, currentTitle) => {
                      setRenameDialog({
                        open: true,
                        chatId,
                        currentTitle,
                      });
                    }}
                    onDelete={(chatId, title) => {
                      setDeleteDialog({
                        open: true,
                        chatId,
                        title,
                      });
                    }}
                    className="h-7 w-7 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  />
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
