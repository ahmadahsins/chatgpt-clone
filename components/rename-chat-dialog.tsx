"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { renameChatTitle } from "@/server/chat-actions";

interface RenameChatDialogProps {
  currentTitle: string;
  chatId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameChatDialog({
  currentTitle,
  chatId,
  open,
  onOpenChange,
}: RenameChatDialogProps) {
  const router = useRouter();
  const [newTitle, setNewTitle] = useState(currentTitle);

  useEffect(() => {
    if (open) {
      setNewTitle(currentTitle);
    }
  }, [open, currentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || newTitle === currentTitle) {
      return;
    }

    await renameChatTitle(chatId, newTitle);
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="hidden"></DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">New name</Label>
              <Input
                id="title"
                name="title"
                value={newTitle}
                placeholder="Enter new name"
                autoFocus
                onChange={(e) => setNewTitle(e.target.value)}
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
              type="submit"
              disabled={!newTitle.trim() || newTitle === currentTitle}
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
