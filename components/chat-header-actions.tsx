"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChatActionsDropdown } from "./chat-actions-dropdown";
import { DeleteChatDialog } from "./delete-chat-dialog";
import { RenameChatDialog } from "./rename-chat-dialog";
import { Chat } from "@/types/chat";

interface ChatHeaderActionsProps {
  chats: Chat[];
}

export function ChatHeaderActions({ chats }: ChatHeaderActionsProps) {
  const params = useParams();
  const currentChatId = params?.id as string;

  // Find current chat
  const currentChat = chats.find((chat) => chat.id === currentChatId);

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

  // Don't show if no current chat
  if (!currentChat) {
    return null;
  }

  return (
    <>
      <ChatActionsDropdown
        isLayout={true}
        chatId={currentChat.id}
        chatTitle={currentChat.title}
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
        variant="ghost"
        size="icon"
      />

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
    </>
  );
}
