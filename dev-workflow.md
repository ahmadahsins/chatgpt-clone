## **Development Workflow: ChatGPT Clone Project**

This document details the development workflow and recommended task list for building the "ChatGPT Clone" project according to the specified tech stack. The tasks are broken down into several phases to ensure a logical and incremental approach.

---

### **Phase 0: Project Setup & Foundation**

**Goal:** To set up the project boilerplate, configure the database, and implement the basic authentication flow.

**Task List:**

1.  **Initialize Next.js Project:**
    - `npx create-next-app@latest`
    - Select: App Router, TypeScript, TailwindCSS.
2.  **Install Main Dependencies:**
    - `npm install drizzle-orm @neondatabase/serverless`
    - `npm install -D drizzle-kit`
    - `npm install @better-auth/nextjs`
    - `npm install ai @ai-sdk/react`
3.  **Configure Neon Database & Drizzle:**
    - Create a new project in Neon and get the connection string (save in `.env`).
    - Create a `drizzle.config.ts` file for Drizzle Kit.
    - Create `src/lib/db/schema.ts` and define the `users`, `chats`, and `messages` schemas (as per the Tech Spec).
    - Run the first migration: `npx drizzle-kit push:pg` to create the tables in Neon.
4.  **Implement Better Auth:**
    - Create the dynamic API route: `src/app/api/auth/[...betterauth]/route.ts`.
    - Configure the Auth Provider in `layout.tsx` or a separate provider file.
    - Get your Better Auth API keys and save them in `.env`.
5.  **Create Protected Routes:**
    - Create a `middleware.ts` file in the project root.
    - Configure the middleware to protect all routes under `/chat`. Unauthenticated users will be redirected to the Better Auth login page.
6.  **Create Basic Layout Structure:**
    - Create `src/app/chat/layout.tsx` (to hold the sidebar) and `src/app/chat/page.tsx` (for the main chat page).

---

### **Phase 1: Core Chat Functionality (In-Memory Streaming)**

**Goal:** To get a fully functional chat interface working with streaming AI responses, without saving history to the database.

**Task List:**

1.  **Create API Route for AI SDK:**
    - Create the file `src/app/api/chat/route.ts`.
    - Configure this route to receive `messages` from the Vercel AI SDK.
    - Store your `OPENAI_API_KEY` (or other LLM key) in `.env`.
    - Use `StreamingTextResponse` to send the LLM's response back to the client.
2.  **Create Chat Interface Component:**
    - Create a client component `ChatInterface.tsx` (or build directly in `src/app/chat/page.tsx`).
    - Implement the `useChat` hook from `ai/react`.
3.  **Design Simple Chat UI (Tailwind):**
    - Create a `<form onSubmit={handleSubmit}>` with an `<input value={input} onChange={handleInputChange}>` and a send button.
    - Render `messages.map(...)` to display the list of messages.
    - Add basic styling to differentiate `user` and `assistant` messages.
4.  **Test Streaming:**
    - Run the project and ensure you can send a message, receive a streaming response from the AI, and continue the conversation (state is still client-side).

---

### **Phase 2: Database Integration & Chat Persistence**

**Goal:** To save conversations to the Neon database and allow users to load their previous chat histories.

**Task List:**

1.  **Create Chat History Sidebar:**
    - Create a Server Component (`ChatHistorySidebar.tsx`) inside `src/app/chat/layout.tsx`.
    - Use the Better Auth helper to get the `userId` on the server.
    - Fetch (using Drizzle) all `chats` owned by that `userId`.
    - Render the list of chats as `<Link href={'/chat/${chat.id}'}>`.
    - Add a "New Chat" button that links to `/chat`.
2.  **Create Dynamic Chat Route:**
    - Create the dynamic route `src/app/chat/[chatId]/page.tsx`.
    - On this page, fetch (Drizzle) all `messages` associated with the `chatId` from the URL parameters.
    - Ensure only the chat owner can access it (validate `userId`).
3.  **Connect `useChat` with Database:**
    - Modify the `ChatInterface.tsx` component to accept `initialMessages` and `chatId` as props.
    - Initialize the hook: `useChat({ id: chatId, initialMessages })`.
4.  **Modify the `/api/chat` API Route:**
    - Inside `route.ts`, get the `userId` from Better Auth.
    - Get `messages` and the optional `chatId` from the request body.
    - Save the user's last message (`userMessage`) to the `messages` table.
    - **New Chat Logic:** If `chatId` is missing (it's the first message of a new chat):
      - Create a new `chats` record in the database (generate a title, link the `userId`).
      - Use this `newChatId` to save the `userMessage`.
      - **IMPORTANT:** Send the `newChatId` back to the client via a custom header (e.g., `x-chat-id`).
    - **Existing Chat Logic:** If `chatId` exists, save the `userMessage` to that `chatId`.
    - Call the LLM with the message history.
    - Use the `onFinish` _server-side callback_ from `StreamingTextResponse` to save the full _assistant_ response to the `messages` table.
5.  **Client-side Navigation:**
    - In `ChatInterface.tsx` (client), use the `onResponse` callback from `useChat`.
    - Check the header: `const newChatId = res.headers.get('x-chat-id')`.
    - If `newChatId` exists, use `router.push('/chat/' + newChatId)` from `next/navigation` to redirect the user to the new chat URL.
    - Use the client-side `onFinish` to call `router.refresh()` so the layout (including the sidebar) fetches the new data.

---

### **Phase 3: UI/UX Polish & Additional Features**

**Goal:** To make the application look professional, responsive, and similar to ChatGPT.

**Task List:**

1.  **Integrate shadcn/ui (Optional, but recommended):**
    - Initialize `shadcn-ui`.
    - Use components like `Button`, `Input`, `ScrollArea`, and `Sheet` (for the mobile sidebar).
2.  **Fix Chat Layout:**
    - Create a `flex flex-col h-screen` layout.
    - Make the chat area (`ScrollArea`) take up the `flex-1` space and auto-scroll to the bottom.
    - Make the input form stick to the bottom of the screen.
3.  **Style Chat Bubbles:**
    - Add clear styling for user and assistant chat bubbles.
    - Add icons, timestamps, etc.
4.  **Render Markdown:**
    - Use the `<Markdown>` component from `@ai-sdk/react` to render AI responses, so formatting like code blocks, lists, and bold text appears correctly.
5.  **Responsiveness:**
    - Hide the sidebar on small (mobile) screens.
    - Use the `Sheet` component from `shadcn/ui` to display the sidebar when a hamburger menu button is clicked.
6.  **Loading & Empty States:**
    - Display a skeleton loader or indicator when `isLoading` from `useChat` is true.
    - Display a nice "empty state" page on `/chat` when there is no chat history yet.

---

### **Phase 4: Deployment & Finalization**

**Goal:** To publish the application to the public and ensure all environment variables are configured.

**Task List:**

1.  **Push to Git:**
    - Create a new repository on GitHub/GitLab and push your code.
2.  **Deploy to Vercel:**
    - Import your repository into Vercel.
    - Vercel will automatically detect the Next.js project.
3.  **Connect Vercel & Neon:**
    - Use the Vercel Neon integration to connect your project. This will automatically set the `DATABASE_URL` variable in Vercel.
4.  **Configure Environment Variables:**
    - Add all your other `.env` variables to your Vercel project settings:
      - Better Auth API Keys
      - `OPENAI_API_KEY`
      - Any other variables you are using.
5.  **Run Production Migration:**
    - For Drizzle, you may need to add a custom build command in `vercel.json` or run it manually to ensure your production database schema is up-to-date. (`npx drizzle-kit push:pg`)
6.  **Production Testing:**
    - Perform end-to-end testing on your production domain:
      - Login / Logout
      - Create a new chat
      - Load an old chat from the sidebar
      - Ensure streaming works correctly.
