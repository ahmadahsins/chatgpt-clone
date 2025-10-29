import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Chat } from "@/types/chat";
import { groupChatsByDate } from "@/utils/chat";
import { Edit, MessageCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ChatSearchDialog({ chats }: { chats: Chat[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  const groupedChats = groupChatsByDate(filteredChats);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton asChild className="cursor-pointer">
          <div>
            <Search className="h-4 w-4" />
            <span className="text-xs">Search</span>
          </div>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl">
        <Command>
          <DialogHeader className="mb-3">
            <DialogTitle>
              <CommandInput
                placeholder="Search chats..."
                className="h-9"
                value={search}
                onValueChange={setSearch}
              />
            </DialogTitle>
          </DialogHeader>
          <CommandList>
            <CommandEmpty>No chat found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  router.push("/chat");
                }}
                className="cursor-pointer"
              >
                <Edit className="h-5 w-5" />
                New Chat
              </CommandItem>
            </CommandGroup>

            {/* Today */}
            {groupedChats.today.length > 0 && (
              <CommandGroup>
                <h3 className="text-[12px] opacity-50 mb-1">Today</h3>
                {groupedChats.today.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => {
                      router.push(`/chat/${chat.id}`);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {chat.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Yesterday */}
            {groupedChats.yesterday.length > 0 && (
              <CommandGroup>
                <h3 className="text-[12px] opacity-50 mb-1">Yesterday</h3>
                {groupedChats.yesterday.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => {
                      router.push(`/chat/${chat.id}`);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {chat.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Older */}
            {groupedChats.older.length > 0 && (
              <CommandGroup>
                <h3 className="text-[12px] opacity-50 mb-1">Older</h3>
                {groupedChats.older.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => {
                      router.push(`/chat/${chat.id}`);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {chat.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
