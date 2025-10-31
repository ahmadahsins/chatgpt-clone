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
  const initialMessages = chatMessages.map((msg) => {
    const parts: any[] = [];

    // Add attachments first (so they appear above text)
    if (msg.attachments && Array.isArray(msg.attachments)) {
      msg.attachments.forEach((attachment: any) => {
        parts.push({
          type: "file",
          url: attachment.url,
          filename: attachment.filename,
          mediaType: attachment.mimeType,
          size: attachment.size,
        });
      });
    }

    // Add text content
    parts.push({ type: "text", text: msg.content });

    // Add sources if available
    if (msg.sources && Array.isArray(msg.sources)) {
      msg.sources.forEach((source: any) => {
        parts.push({
          type: "source-url",
          url: source.url,
          title: source.title,
        });
      });
    }

    return {
      id: msg.id,
      role: msg.role,
      parts,
      createdAt: msg.createdAt,
    };
  });

  return <ChatInterface chatId={id} initialMessages={initialMessages} />;
}
