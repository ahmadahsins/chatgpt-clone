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
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { renameChatTitle } from "@/server/chat-actions";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    chatId: string;
    currentTitle: string;
  }>({
    open: false,
    chatId: "",
    currentTitle: "",
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
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          // TODO: Open delete dialog
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

      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="hidden"></DialogTitle>
          </DialogHeader>
          <form>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">New name</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={renameDialog.currentTitle}
                  placeholder="Enter new name"
                  autoFocus
                  onChange={(e) =>
                    setRenameDialog({
                      ...renameDialog,
                      currentTitle: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={() => {
                  renameChatTitle(
                    renameDialog.chatId,
                    renameDialog.currentTitle
                  );
                  setRenameDialog({ ...renameDialog, open: false });
                  router.refresh();
                }}
              >
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}
