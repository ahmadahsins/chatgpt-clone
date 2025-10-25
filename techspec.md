# **Tech Spec: "AI Chat" (ChatGPT Clone)**

## **1. Project Overview**

This document outlines the technical specifications for building a "ChatGPT Clone" web application. The project will leverage a modern, fullstack TypeScript stack to deliver a real-time, streaming chat interface with persistent conversation history.

### **1.1. Core Tech Stack**

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **AI/Streaming:** Vercel AI SDK (using `useChat` hook) & AI UI Elements
- **Styling:** TailwindCSS
- **Authentication:** Better Auth
- **Database:** Neon (Serverless Postgres)
- **ORM:** Drizzle ORM

---

## **2. Main Features**

1.  **User Authentication:**

    - Secure sign-up, sign-in, and sign-out functionality provided by Better Auth.
    - Protected routes for the chat interface, accessible only to authenticated users.
    - All chat data will be scoped to the authenticated `userId`.

2.  **Real-time Streaming Chat:**

    - A core chat input interface.
    - Messages sent to the backend (Next.js API Route) will be forwarded to an LLM (e.g., OpenAI).
    - Responses from the LLM will be streamed back to the client in real-time using the Vercel AI SDK and displayed token-by-token.

3.  **Persistent Conversation History:**

    - All user messages and AI responses will be saved to the Neon Postgres database.
    - A sidebar will list all past chat conversations for the logged-in user.
    - Selecting a conversation from the history will load the previous messages into the chat window.

4.  **Chat Management:**

    - **New Chat:** A "New Chat" button to clear the current conversation and start a new one.
    - **Chat Titling:** The first user prompt will be used to automatically generate a title for the chat (e.g., "History of Rome"), which is then saved in the database.
    - **(Future Scope):** Rename and Delete chat conversations.

---

## **3. Technology Deep Dive**

- **Next.js App Router:** Will be used for all routing. The chat history sidebar will be a Server Component (`layout.tsx`) fetching data via Drizzle. The main chat interface (`/chat/[id]/page.tsx`) will be a Client Component using the `useChat` hook.
- **Better Auth:** Will handle session management. We will use its server-side helpers to get the `userId` in Server Components and API Routes to query the database.
- **Vercel AI SDK:** The `useChat` hook will manage the client-side state (messages, input, loading status). A Next.js API Route (`/api/chat`) will use the `StreamingTextResponse` to stream the AI's output.
- **Drizzle + Neon:** Drizzle will define the schema (see section 5) and be used in Server Actions/API Routes to query the Neon database. It will handle saving messages and fetching chat history.

---

## **4. User Flow**

### **4.1. Authentication Flow**

1.  `User` navigates to the homepage (`/`).
2.  `System` checks for an active session (via Better Auth).
3.  If no session, `System` redirects `User` to the Better Auth sign-in/sign-up page.
4.  `User` authenticates.
5.  `System` (Better Auth) redirects `User` back to the app, now authenticated.
6.  `User` is redirected to the main chat dashboard (`/chat`).

### **4.2. New Chat & Conversation Flow**

1.  `User` (on `/chat`) sees an empty state and a persistent sidebar.
2.  `User` types their first prompt (e.g., "What is Next.js?") and hits "Send".
3.  `Client` (Vercel `useChat` hook) optimistically displays the user's message.
4.  `Client` sends a POST request to `/api/chat` with the message history.
5.  `Server` (`/api/chat` route):
    a. Gets the `userId` from Better Auth.
    b. **[First Message Logic]** Sees no `chatId` is provided.
    c. Creates a new `Chat` record in the database (Drizzle) linked to the `userId`, using the prompt to generate a `title`.
    d. Saves the `User` message to the `Message` table, linked to the new `chatId`.
    e. Forwards the prompt to the LLM.
6.  `Server` streams the LLM response back to the client using `StreamingTextResponse`.
7.  `Client` (`useChat` hook) displays the streaming response in real-time.
8.  `Server` (on stream completion, via `onFinish` callback) saves the full `Assistant` response to the `Message` table.
9.  `Client` sidebar automatically updates (via re-fetch or state update) to show the new chat title.

### **4.3. Accessing Existing Chat Flow**

1.  `User` logs in and lands on `/chat`.
2.  `Server Component` (Sidebar) fetches all `Chat` records for the `userId` from Neon via Drizzle.
3.  `User` sees their chat history (e.g., "What is Next.js?") in the sidebar and clicks it.
4.  `Client` navigates to `/chat/[id]` (e.g., `/chat/uuid-1234-abcd`).
5.  `Server` (on the `page.tsx` for `[id]`) fetches all `Message` records for that `chatId`.
6.  `Server` passes these historical messages as `initialMessages` to the `useChat` hook.
7.  `Client` interface loads, displaying the full conversation history.
8.  `User` can now continue this conversation, and new messages will be saved to the _same_ `chatId`.

---

## **5. Database Schema (Drizzle ORM for Neon)**

This schema defines three main tables: `User`, `Chat`, and `Message`, along with a supporting `enum`.

```typescript
import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * ----------------------------------------
 * ENUMS
 * ----------------------------------------
 */

// This enum is crucial for the AI model
export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

/**
 * ----------------------------------------
 * TABLES
 * ----------------------------------------
 */

/**
 * User Table
 * Stores basic user info. The 'id' MUST match the 'sub' (subject) ID
 * provided by Better Auth for session mapping.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // ID from Better Auth
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Chat Table
 * Represents a single conversation thread.
 * Each user can have multiple chats.
 */
export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Message Table
 * Stores individual messages within a chat.
 * Linked to a parent chat.
 */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ----------------------------------------
 * RELATIONS (for Drizzle ORM)
 * ----------------------------------------
 */

export const usersRelations = relations(users, ({ many }) => ({
  // A user can have many chats
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  // Each chat belongs to one user
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  // A chat can have many messages
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  // Each message belongs to one chat
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));
```
