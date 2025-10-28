"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { headers } from "next/headers";
import { asc, desc, eq } from "drizzle-orm";

export async function getUserChats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
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
    .where(eq(chats.userId, session.user.id))
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ title: newTitle.trim() })
    .where(eq(chats.id, chatId));
}
