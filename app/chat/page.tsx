import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat-interface";

export default async function ChatPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if session is invalid
  if (!session) {
    redirect("/login");
  }

  return <ChatInterface userName={session.user?.name || "User"} />;
}
