import { Chat } from "@/types/chat";

export function groupChatsByDate(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {
    today: [] as Chat[],
    yesterday: [] as Chat[],
    older: [] as Chat[],
  };

  chats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt);
    const chatDay = new Date(
      chatDate.getFullYear(),
      chatDate.getMonth(),
      chatDate.getDate()
    );

    if (chatDay.getTime() === today.getTime()) {
      groups.today.push(chat);
    } else if (chatDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
}

export function searchChats(chats: Chat[], query: string) {
  if (!query.trim()) return chats;

  const lowerQuery = query.toLowerCase();
  return chats.filter((chat) => chat.title.toLowerCase().includes(lowerQuery));
}
