"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

const verifySession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const verifyChatOwnership = async (chatId: string, userId: string) => {
  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  if (!chat[0] || chat[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
};

export async function getUserChats() {
  const userId = await verifySession();

  if (!userId) {
    return [];
  }

  const userChats = await db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      userId: chats.userId,
    })
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt));

  return userChats;
}

export async function getChatMessages(chatId: string, userId: string) {
  const chat = (
    await db.select().from(chats).where(eq(chats.id, chatId)).limit(1)
  )[0];

  if (!chat || chat.userId !== userId) {
    return null;
  }

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt));

  return chatMessages;
}

export async function renameChatTitle(chatId: string, newTitle: string) {
  const userId = await verifySession();

  await verifyChatOwnership(chatId, userId);

  await db
    .update(chats)
    .set({ title: newTitle.trim() })
    .where(eq(chats.id, chatId));
}

export async function deleteChat(chatId: string) {
  const userId = await verifySession();

  await verifyChatOwnership(chatId, userId);

  await db.delete(chats).where(eq(chats.id, chatId));
}
