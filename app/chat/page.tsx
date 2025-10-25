import { ButtonLogout } from "@/components/button-logout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if session is invalid
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Chat</h1>
      <ButtonLogout />
    </div>
  );
}
