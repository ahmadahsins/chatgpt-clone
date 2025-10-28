import { getUserChats } from "@/server/chat-actions";
import { ChatHistoryList } from "./chat-history-list";

// Server Component - Fetch data
export async function ChatHistorySidebar() {
  const chats = await getUserChats();

  return <ChatHistoryList chats={chats} />;
}
