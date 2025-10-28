import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar - Client Component with Server Component as children */}
        <ChatSidebar
          chatHistoryContent={<ChatHistorySidebar />}
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
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
