"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface ChatActionsDropdownProps {
  isLayout: boolean;
  chatId: string;
  chatTitle: string;
  onRename: (chatId: string, currentTitle: string) => void;
  onDelete: (chatId: string, title: string) => void;
  variant?: "ghost" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ChatActionsDropdown({
  isLayout = true,
  chatId,
  chatTitle,
  onRename,
  onDelete,
  variant = "ghost",
  size = "icon",
  className = "",
}: ChatActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isLayout ? "end" : "start"} className="w-32">
        <DropdownMenuItem
          onSelect={() => {
            onRename(chatId, chatTitle);
          }}
          className="cursor-pointer hover:bg-accent"
        >
          <Pencil className="mr-1 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onDelete(chatId, chatTitle);
          }}
          className="text-destructive hover:bg-red-500/10 cursor-pointer"
        >
          <Trash2 className="mr-1 h-4 w-4 focus:text-destructive" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
