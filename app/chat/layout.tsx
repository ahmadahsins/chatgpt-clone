import { ChatHistoryList } from "@/components/chat-history-list";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatHeaderActions } from "@/components/chat-header-actions";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { getUserChats } from "@/server/chat-actions";
import { headers } from "next/headers";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const chats = await getUserChats();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full sticky top-0">
        {/* Sidebar - Client Component with Server Component as children */}
        <ChatSidebar
          chats={chats}
          chatHistoryContent={<ChatHistoryList chats={chats} />}
          userEmail={session?.user?.email || "user@example.com"}
          userName={session?.user?.name || "User"}
          userImage={session?.user?.image || "user@example.com"}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <header className="border-b p-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">ChatGPT</h1>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <ChatHeaderActions chats={chats} />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-hidden max-w-screen w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
