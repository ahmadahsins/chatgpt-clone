"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteChat } from "@/server/chat-actions";
import { toast } from "sonner";

interface DeleteChatDialogProps {
  chatId: string;
  chatTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteChatDialog({
  chatId,
  chatTitle,
  open,
  onOpenChange,
}: DeleteChatDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteChat(chatId);
      toast.success("Chat deleted successfully");

      // If user is currently viewing this chat, redirect to /chat
      if (currentChatId === chatId) {
        router.push("/chat");
      } else {
        router.refresh();
      }

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-96">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chat</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete
            <span className="font-semibold text-foreground">{` ${chatTitle}`}</span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
