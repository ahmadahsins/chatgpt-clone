## **Development Workflow: ChatGPT Clone Project**

This document details the development workflow and recommended task list for building the "ChatGPT Clone" project according to the specified tech stack. The tasks are broken down into several phases to ensure a logical and incremental approach.

---

### **Phase 0: Project Setup & Foundation** COMPLETED

**Goal:** To set up the project boilerplate, configure the database, and implement the basic authentication flow.

**Task List:**

1.  **Initialize Next.js Project:**

    - Next.js 15 with App Router, TypeScript, TailwindCSS

2.  **Install Main Dependencies:**

    - Drizzle ORM + Neon Database
    - Better Auth for authentication
    - AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/google`)

3.  **Configure Neon Database & Drizzle:**

    - Database schema: `users`, `sessions`, `accounts`, `chats`, `messages`
    - Drizzle config with Neon serverless driver
    - Migrations applied

4.  **Implement Better Auth:**

    - API route: `/api/auth/[...all]/route.ts`
    - Auth configuration with Google OAuth
    - Session management

5.  **Create Protected Routes:**

    - Middleware protects `/chat/*` routes
    - Redirect unauthenticated users to sign-in

6.  **Create Basic Layout Structure:**

    - Chat layout with sidebar
    - Main chat page at `/chat`

---

### **Phase 1: Core Chat Functionality (In-Memory Streaming)** COMPLETED

**Goal:** To get a fully functional chat interface working with streaming AI responses, without saving history to the database.

**Task List:**

1.  **Create API Route for AI SDK:**

    - API route at `/api/chat/route.ts`
    - Streaming AI responses with `streamText()` and `toUIMessageStreamResponse()`
    - Using Google Gemini 2.5 Flash model

2.  **Create Chat Interface Component:**

    - Client component `ChatInterface.tsx` with `useChat` hook
    - AI Elements UI components for modern chat interface

3.  **Design Chat UI:**

    - Message rendering with `message.parts` structure
    - Input form with file attachments support
    - Streaming status indicators

4.  **Test Streaming:**

    - Real-time AI responses working
    - Client-side state management functional

---

### **Phase 2: Database Integration & Chat Persistence** COMPLETED

**Goal:** To save conversations to the Neon database and allow users to load their previous chat histories.

**Task List:**

1.  **Create Chat History Sidebar:**

    - Server Component (`ChatHistorySidebar.tsx`) fetches user's chats
    - Client Component (`ChatSidebar.tsx`) for UI interactions
    - New Chat button navigates to `/chat`
    - Chat list with links to `/chat/[id]`

2.  **Create Dynamic Chat Route:**

    - Dynamic route `app/chat/[id]/page.tsx`
    - Server action `getChatMessages()` fetches messages
    - Security: validates user owns the chat
    - Passes messages to `ChatInterface`

3.  **Configure `useChat` Hook (AI SDK):**

    **Business Logic:**

    - Use `DefaultChatTransport` to configure API endpoint and request body
    - Pass `chatId` in request body (null for new chats, ID for existing chats)
    - Use `onFinish` callback to handle post-message actions (navigation, refresh)
    - Track navigation state with `useRef` to prevent duplicate redirects

    **Key Concepts:**

    - `sendMessage({ text })` - Send user messages (replaces old `append` method)
    - `message.parts` - Access message content (replaces old `message.content`)
    - `setMessages()` - Initialize or modify messages array
    - `status` - Track loading state ('ready', 'streaming', 'error')

4.  **Create `/api/chat` API Route:**

    **Business Logic Flow:**

5.  **Authentication:** Verify user session with Better Auth
6.  **Parse Request:** Extract `messages` (UIMessage[]) and `chatId` from request body
7.  **New Chat Creation:**
    - If `chatId` is null → create new chat in database
    - Generate title from first message (max 100 chars)
    - Store `userId` and `title` in `chats` table
8.  **Save User Message:** Insert last message to `messages` table with `chatId`
9.  **Stream AI Response:**
    - Use `streamText()` with Google Gemini model
    - Convert UIMessages to model format with `convertToModelMessages()`
    - Use `onFinish` callback to save assistant response to database
10. **Return Stream with Metadata:**

    - Use `toUIMessageStreamResponse()` to return streaming response
    - Add `messageMetadata` callback to send `chatId` to client
    - Set `X-Chat-ID` header for backward compatibility

    **Key Points:**

    - `UIMessage` has `parts` array structure (not `content` string)
    - Extract text from parts: `parts.filter(p => p.type === 'text').map(p => p.text)`
    - Use `messageMetadata` to send custom data (e.g., chatId) to client

11. **Client-side Chat ID Handling & Navigation:**

    **Business Logic:**

    **Problem:** When user creates new chat, they start at `/chat` (no ID). After first message, we need to navigate to `/chat/[id]`.

    **Solution:**

12. **Track Chat ID State:**

    - Use `useState` to track current chat ID
    - Initialize with `chatId` prop (undefined for new chats)

13. **Extract Chat ID from Metadata:**

    - Server sends `chatId` via `messageMetadata` callback
    - Client receives it in `onFinish({ message })` callback
    - Access via `message.metadata.chatId`

14. **Navigate to New Chat:**

    - Check if `metadata.chatId` exists AND `currentChatId` is null
    - Use `useRef` flag to prevent duplicate navigation
    - Call `router.push(/chat/${chatId})` to update URL
    - Call `router.refresh()` to update sidebar with new chat

    **Key Points:**

    - `messageMetadata` on server → `message.metadata` on client
    - Use `useRef` to track navigation state (prevents multiple redirects)
    - Always call `router.refresh()` after mutations to update server components

15. **Load Initial Messages for Existing Chats:**

    **Business Logic:**

    **Problem:** When user opens existing chat (`/chat/[id]`), we need to load previous messages from database.

    **Solution:**

16. **Server-Side (Page Component):**

    - Fetch messages from database using `getChatMessages(chatId, userId)`
    - Validate user owns the chat (security check)
    - Convert database format to UIMessage format:
      - Database: `{ id, role, content }` (content is string)
      - UIMessage: `{ id, role, parts: [{ type: 'text', text: content }] }`
    - Pass `initialMessages` as prop to `ChatInterface`

17. **Client-Side (ChatInterface):**

    - Receive `initialMessages` prop from server
    - Use `useEffect` to initialize messages on mount
    - Call `setMessages(initialMessages)` to populate chat history
    - Dependency array `[initialMessages, setMessages]` ensures it runs only once

    **Key Points:**

    - **Database → UIMessage conversion is critical:**
      - Must convert `content` string to `parts` array
      - Each part needs `type` field ('text', 'tool-call', etc.)
    - **`setMessages()` is the official API** for initializing messages in AI SDK
    - **Security:** Always validate `userId` matches chat owner before returning messages

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
