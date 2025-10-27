import { auth } from "@/lib/auth";
import { getChatMessages } from "@/server/chat-actions";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ChatInterface from "@/components/chat-interface";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    notFound();
  }

  const chatMessages = await getChatMessages(id, session.user.id);

  if (!chatMessages) {
    notFound();
  }

  // Convert messages to format expected by useChat
  const initialMessages = chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: "text", text: msg.content }],
    createdAt: msg.createdAt,
  }));

  return <ChatInterface chatId={id} initialMessages={initialMessages} />;
}
