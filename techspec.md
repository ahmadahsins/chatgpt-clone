# **Tech Spec: "ChatGPT Clone"**

## **1. Project Overview**

This document outlines the technical specifications for a fully-featured "ChatGPT Clone" web application. The project leverages a modern, fullstack TypeScript stack to deliver a real-time, streaming chat interface with persistent conversation history, file analysis capabilities, web search integration, and comprehensive chat management features.

### **1.1. Core Tech Stack**

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **AI/Streaming:** Vercel AI SDK (`useChat` hook) & AI UI Elements
- **AI Model:** Google Gemini 2.5 Flash (via `@ai-sdk/google`)
- **Styling:** TailwindCSS v4 + shadcn/ui components
- **Authentication:** Better Auth (Google OAuth + Email/Password)
- **Database:** Neon (Serverless Postgres)
- **ORM:** Drizzle ORM
- **File Storage:** Vercel Blob
- **Rate Limiting:** Upstash Redis + @upstash/ratelimit
- **Theme:** next-themes (Light/Dark mode)
- **Icons:** Lucide React

---

## **2. Main Features**

### **2.1. User Authentication**

- **Multiple Sign-in Methods:**
  - Google OAuth (one-click sign-in)
  - Email/Password authentication
  - Secure session management via Better Auth
- **Protected Routes:** All `/chat/*` routes require authentication
- **User Profile:** Avatar display with dropdown menu (logout option)
- **Data Isolation:** All chat data scoped to authenticated `userId`

### **2.2. Real-time Streaming Chat**

- **AI-Powered Responses:**
  - Powered by Google Gemini 2.5 Flash model
  - Token-by-token streaming display
  - Markdown rendering with syntax highlighting
  - Code block support with copy functionality
- **Smart Input:**
  - Auto-resizing textarea
  - File attachment support (images & PDFs)
  - Drag-and-drop file upload
  - Submit on Enter, new line on Shift+Enter
- **Loading States:**
  - Streaming indicators
  - Upload progress feedback
  - Disabled state during processing

### **2.3. File Upload & Analysis**

- **Supported Formats:**
  - Images (JPEG, PNG, GIF, WebP, etc.)
  - PDF documents
- **Storage:** Vercel Blob for scalable file storage
- **Features:**
  - Image preview in chat
  - PDF viewer embedded in chat
  - File metadata persistence (filename, size, MIME type)
  - Multiple file attachments per message
- **AI Analysis:**
  - Image content understanding
  - PDF text extraction and analysis
  - Context-aware responses based on file content

### **2.4. Web Search Integration**

- **Google Search Tool:**
  - Real-time web search capability
  - Grounding metadata extraction
  - Source attribution with clickable links
- **Smart Usage Policy:**
  - Only activates for current/recent information queries
  - Avoids unnecessary searches for general knowledge
  - Explicit search request support
- **Source Display:**
  - Inline citation badges
  - Hover cards with source previews
  - Direct links to source websites

### **2.5. Chat Management**

- **New Chat:** Button to start fresh conversation
- **Auto-Generated Titles:**
  - AI-powered title generation from first message
  - Async title generation (non-blocking)
  - Fallback to truncated prompt if generation fails
- **Rename Chat:**
  - Dialog-based rename interface
  - Enter key support for quick rename
  - Validation (no empty/unchanged titles)
- **Delete Chat:**
  - Confirmation dialog before deletion
  - Cascade delete (removes all messages)
  - Automatic redirect after deletion
- **Search Chats:**
  - Cmd/Ctrl+K keyboard shortcut
  - Real-time search filtering
  - Fuzzy search support

### **2.6. Chat History & Organization**

- **Sidebar Navigation:**
  - Collapsible sidebar (desktop)
  - Sheet overlay (mobile)
  - Auto-close on mobile after selection
- **Date Grouping:**
  - Today
  - Yesterday
  - Older (7 days, 30 days, etc.)
- **Chat Actions:**
  - Dropdown menu per chat (rename, delete)
  - Available in sidebar and header
  - Hover-to-show on desktop

### **2.7. UI/UX Features**

- **Theme Toggle:**
  - Light/Dark mode support
  - System preference detection
  - Persistent theme selection
- **Responsive Design:**
  - Mobile-first approach
  - Adaptive layouts for all screen sizes
  - Touch-friendly interactions
- **Custom Scrollbar:**
  - Theme-aware styling
  - Webkit and Firefox support
  - Smooth scrolling behavior
- **Empty State:**
  - Centered layout with greeting
  - Time-based greeting (morning/afternoon/evening)
  - Personalized with user's first name
- **Message Actions:**
  - Copy message content
  - Like/Dislike feedback (UI only)
  - Visible on hover (desktop)

### **2.8. Persistent Conversation History**

- **Database Storage:**
  - All messages saved to Neon Postgres
  - Chat metadata (title, timestamps)
  - File attachments metadata
  - Web search sources
- **Message Loading:**
  - Automatic load on chat selection
  - Conversion from DB format to UI format
  - Proper handling of message parts (text, files, sources)
- **Real-time Updates:**
  - Sidebar refresh after new chat
  - Optimistic UI updates
  - Router refresh for server components

### **2.9. API Protection & Rate Limiting**

- **Upstash Redis Integration:**
  - Serverless Redis for rate limit tracking
  - Edge-compatible for low latency
  - Global replication for reliability
- **Per-IP Rate Limiting:**
  - IP extraction from request headers (x-forwarded-for, x-real-ip, cf-connecting-ip)
  - Sliding window algorithm for accurate counting
  - Separate limits per endpoint
- **Endpoint-Specific Limits:**
  - Chat API: 10 requests per minute
  - Upload API: 5 uploads per minute
  - Auth API: 5 attempts per 5 minutes
- **Graceful Error Handling:**
  - 429 status code for rate limit exceeded
  - Retry-After header with seconds to wait
  - X-RateLimit headers (Limit, Remaining, Reset)
  - Clear error messages for users
- **Analytics:**
  - Request tracking per IP
  - Rate limit hit monitoring
  - Automatic cleanup of expired entries

---

## **3. Technology Deep Dive**

### **3.1. Next.js 15 App Router**

- **Server Components:**
  - `app/chat/layout.tsx` - Fetches chat history
  - `app/chat/[id]/page.tsx` - Loads specific chat messages
  - `app/chat/page.tsx` - New chat page with user session
- **Client Components:**
  - `ChatInterface` - Main chat UI with `useChat` hook
  - `ChatSidebar` - Interactive sidebar with state management
  - `ChatHistoryList` - Chat list with actions
  - Dialog components (rename, delete, search)
- **API Routes:**
  - `/api/chat` - Streaming chat responses
  - `/api/upload` - File upload to Vercel Blob
  - `/api/auth/[...all]` - Better Auth handler

### **3.2. Better Auth**

- **Configuration:**
  - Google OAuth provider
  - Email/Password provider
  - Session management with cookies
- **Usage:**
  - `auth.api.getSession()` in Server Components
  - `useSession()` hook in Client Components
  - Middleware protection for `/chat/*` routes
- **Database Integration:**
  - Auto-creates `user`, `session`, `account` tables
  - Seamless integration with Drizzle schema

### **3.3. Vercel AI SDK**

- **Client-side (`@ai-sdk/react`):**
  - `useChat` hook for state management
  - `message.parts` structure for content
  - `sendMessage()` for sending messages
  - `setMessages()` for initializing history
  - `status` tracking (ready, streaming, submitted)
- **Server-side (`ai`):**
  - `streamText()` for AI response generation
  - `convertToModelMessages()` for format conversion
  - `toUIMessageStreamResponse()` for streaming
  - `messageMetadata` for custom data (chatId, sources)
- **AI UI Elements:**
  - Pre-built components for chat interface
  - Conversation, Message, Response components
  - PromptInput with file attachment support
  - Reasoning component for tool usage display
  - InlineCitation for source attribution

### **3.4. Google Gemini Integration**

- **Model:** `gemini-2.5-flash` via `@ai-sdk/google`
- **Features:**
  - Text generation
  - Image understanding
  - PDF analysis
  - Google Search tool integration
- **System Prompt:**
  - ChatGPT persona emulation
  - Web search usage guidelines
  - Response style instructions

### **3.5. Drizzle ORM + Neon**

- **Schema Definition:**
  - Type-safe table definitions
  - Relations between tables
  - Enums for role types
- **Queries:**
  - `db.select()` for fetching data
  - `db.insert()` for creating records
  - `db.update()` for modifications
  - `db.delete()` for removals
- **Migrations:**
  - `drizzle-kit` for schema management
  - Version-controlled migrations

### **3.6. Vercel Blob**

- **Upload API:**
  - `put()` function for file storage
  - Automatic URL generation
  - Content-type detection
- **Integration:**
  - `/api/upload` route handler
  - Client-side file conversion (data URL → Blob)
  - Metadata storage in database

### **3.7. shadcn/ui Components**

- **Used Components:**
  - `Button`, `Input`, `Label`
  - `Dialog`, `AlertDialog`
  - `DropdownMenu`, `Command`
  - `Sidebar`, `Sheet`
  - `Avatar`, `Badge`, `Separator`
  - `HoverCard`, `Tooltip`
  - `ScrollArea`, `Collapsible`
- **Customization:**
  - TailwindCSS v4 integration
  - Theme-aware styling
  - Custom variants and sizes

### **3.8. Theme System**

- **next-themes:**
  - `ThemeProvider` wrapper
  - `useTheme()` hook
  - System preference detection
- **Implementation:**
  - CSS variables for colors
  - `oklch` color format
  - Light/Dark mode variants
  - Custom scrollbar theming

### **3.9. Rate Limiting with Upstash Redis**

- **Upstash Redis:**
  - Serverless Redis database
  - REST API for edge compatibility
  - Global replication for low latency
  - Automatic connection pooling
- **@upstash/ratelimit:**
  - `Ratelimit` class for rate limiting logic
  - `slidingWindow()` algorithm for accurate counting
  - Per-endpoint configuration
  - Built-in analytics support
- **Implementation:**
  - `lib/rate-limit.ts` - Utility functions and rate limiters
  - `getClientIp()` - Extract IP from various headers
  - `createRateLimitResponse()` - Standardized error responses
  - Applied in API routes before authentication check
- **Sliding Window Algorithm:**
  - Tracks requests in time windows
  - Prevents burst attacks
  - More accurate than fixed window
  - Automatic cleanup of old entries

---

## **4. User Flows**

### **4.1. Authentication Flow**

**Sign Up:**
1. User navigates to `/signup`
2. User chooses authentication method:
   - **Google OAuth:** One-click sign-in
   - **Email/Password:** Fill form with name, email, password
3. System creates user account via Better Auth
4. System redirects to `/chat`

**Sign In:**
1. User navigates to `/login`
2. User chooses authentication method:
   - **Google OAuth:** One-click sign-in
   - **Email/Password:** Enter credentials
3. System validates credentials
4. System creates session
5. System redirects to `/chat`

**Sign Out:**
1. User clicks avatar in sidebar
2. User selects "Logout" from dropdown
3. System terminates session
4. System redirects to `/login`

### **4.2. New Chat & Conversation Flow**

**Starting New Chat:**
1. User lands on `/chat` (empty state)
2. System displays:
   - Personalized greeting ("Good evening, Ahmad")
   - Centered prompt input
   - "How can I help you today?" message
3. User types first message (optional: attach files)
4. User presses Enter or clicks Send

**Message Processing:**
5. Client (`useChat` hook):
   - Displays user message optimistically
   - Uploads files to Vercel Blob (if any)
   - Sends POST to `/api/chat` with message + file URLs
6. Server (`/api/chat`):
   - Validates session
   - Creates new chat (if `chatId` is null):
     - Generates title from first message (async, non-blocking)
     - Stores fallback title initially
   - Saves user message to database
   - Forwards to Gemini model
7. Server streams AI response:
   - Token-by-token streaming
   - Includes metadata (chatId, sources)
   - Displays reasoning for tool usage
8. Client displays streaming response:
   - Markdown rendering
   - Code syntax highlighting
   - Inline citations for sources
9. Server `onFinish` callback:
   - Saves assistant message to database
   - Extracts and saves web search sources
10. Client `onFinish` callback:
    - Extracts chatId from metadata
    - Navigates to `/chat/[id]`
    - Refreshes sidebar (shows new chat)

**Continuing Conversation:**
11. User sends another message
12. System follows steps 5-9 (skips chat creation)
13. All messages linked to same `chatId`

### **4.3. Accessing Existing Chat Flow**

**Loading Chat History:**
1. User logs in, lands on `/chat`
2. Server Component (Sidebar):
   - Fetches all chats for `userId`
   - Groups by date (Today, Yesterday, Older)
   - Renders in sidebar
3. User sees chat history with titles
4. User clicks a chat from sidebar

**Opening Specific Chat:**
5. Client navigates to `/chat/[id]`
6. Server (`app/chat/[id]/page.tsx`):
   - Validates user owns the chat
   - Fetches all messages for `chatId`
   - Converts DB format to UIMessage format:
     - `content` string → `parts` array
     - Includes file attachments
     - Includes web search sources
   - Passes as `initialMessages` prop
7. Client (`ChatInterface`):
   - Receives `initialMessages`
   - Calls `setMessages(initialMessages)` in `useEffect`
   - Displays full conversation history
8. User can continue conversation
9. New messages saved to same `chatId`

**Mobile Experience:**
- Sidebar opens as sheet overlay
- Auto-closes after chat selection
- Swipe gestures supported

### **4.4. File Upload & Analysis Flow**

1. User clicks attachment button or drags file
2. Client validates file type (image/PDF)
3. Client creates preview (data URL)
4. User sends message with attachment
5. Client uploads to `/api/upload`:
   - Converts data URL to Blob
   - Sends via FormData
6. Server (`/api/upload`):
   - Validates session
   - Uploads to Vercel Blob
   - Returns file URL + metadata
7. Client sends message to `/api/chat`:
   - Includes file URL in message parts
   - Type: "file" with mediaType
8. Server forwards to Gemini:
   - Model analyzes file content
   - Generates context-aware response
9. Client displays:
   - Image preview in user message
   - PDF viewer in user message
   - AI response about file content
10. Server saves to database:
    - Message with attachments metadata
    - File URLs, filenames, sizes, MIME types

### **4.5. Web Search Flow**

1. User asks question requiring current info
2. Server (`/api/chat`):
   - Gemini evaluates if search needed
   - Decides based on system prompt guidelines
3. If search triggered:
   - Client shows "Searching the web..." reasoning
   - Gemini uses Google Search tool
   - Retrieves relevant web results
4. Server extracts grounding metadata:
   - Source URLs
   - Page titles
   - Grounding chunks
5. Server generates response:
   - Synthesizes information from sources
   - Includes inline citations
6. Client displays:
   - AI response with citations
   - "Sources:" section with badges
   - Clickable source links
7. Server saves to database:
   - Message content
   - Sources array (URLs + titles)

### **4.6. Chat Management Flows**

**Rename Chat:**
1. User clicks dropdown → "Rename"
2. Dialog opens with current title
3. User edits title
4. User presses Enter or clicks "Rename"
5. System validates (not empty, changed)
6. Server updates chat title
7. Sidebar refreshes
8. Dialog closes

**Delete Chat:**
1. User clicks dropdown → "Delete"
2. Confirmation dialog appears
3. User confirms deletion
4. Server deletes chat (cascade to messages)
5. If on deleted chat page:
   - Redirect to `/chat`
6. Sidebar refreshes

**Search Chats:**
1. User presses Cmd/Ctrl+K
2. Search dialog opens
3. User types query
4. System filters chats in real-time
5. User selects chat from results
6. Navigate to selected chat
7. Dialog closes

---

## **5. Database Schema (Drizzle ORM for Neon)**

This schema defines the complete database structure including Better Auth tables, chat tables, and supporting enums.

```typescript
import { pgTable, text, timestamp, uuid, pgEnum, boolean, jsonb } from "drizzle-orm/pg-core";
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
 * BETTER AUTH TABLES
 * ----------------------------------------
 */

/**
 * User Table (Better Auth)
 * Stores user authentication data
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

/**
 * Session Table (Better Auth)
 * Manages user sessions
 */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

/**
 * Account Table (Better Auth)
 * Links users to OAuth providers
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

/**
 * Verification Table (Better Auth)
 * Stores email verification tokens
 */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

/**
 * ----------------------------------------
 * CHAT APPLICATION TABLES
 * ----------------------------------------
 */

/**
 * Chat Table
 * Represents a single conversation thread
 * Each user can have multiple chats
 */
export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Message Table
 * Stores individual messages within a chat
 * Supports text, file attachments, and web sources
 */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<Array<{
    type: "image" | "pdf";
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }>>(),
  sources: jsonb("sources").$type<Array<{
    url: string;
    title?: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ----------------------------------------
 * RELATIONS (for Drizzle ORM)
 * ----------------------------------------
 */

export const userRelations = relations(user, ({ many }) => ({
  chats: many(chats),
  sessions: many(session),
  accounts: many(account),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(user, {
    fields: [chats.userId],
    references: [user.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));
```

---

## **6. Environment Variables**

```env
# Database
DATABASE_URL=your_neon_database_url

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

---

## **7. Project Structure**

```
chatgpt-clone/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # Better Auth handler
│   │   ├── chat/route.ts             # Chat streaming API
│   │   └── upload/route.ts           # File upload API
│   ├── chat/
│   │   ├── [id]/page.tsx             # Specific chat page
│   │   ├── layout.tsx                # Chat layout with sidebar
│   │   └── page.tsx                  # New chat page
│   ├── login/page.tsx                # Login page
│   ├── signup/page.tsx               # Signup page
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home (redirects to /chat)
├── components/
│   ├── ai-elements/                  # AI UI components
│   │   ├── actions.tsx
│   │   ├── conversation.tsx
│   │   ├── inline-citation.tsx
│   │   ├── message.tsx
│   │   ├── prompt-input.tsx
│   │   ├── reasoning.tsx
│   │   └── response.tsx
│   ├── ui/                           # shadcn/ui components
│   ├── chat-actions-dropdown.tsx    # Reusable dropdown
│   ├── chat-header-actions.tsx      # Header actions
│   ├── chat-history-list.tsx        # Chat list component
│   ├── chat-interface.tsx           # Main chat interface
│   ├── chat-search-dialog.tsx       # Search dialog
│   ├── chat-sidebar.tsx             # Sidebar component
│   ├── delete-chat-dialog.tsx       # Delete confirmation
│   ├── login-form.tsx               # Login form
│   ├── rename-chat-dialog.tsx       # Rename dialog
│   ├── signup-form.tsx              # Signup form
│   └── theme-toggle.tsx             # Theme switcher
├── lib/
│   ├── ai-sdk/
│   │   └── title-generator.ts       # Async title generation
│   ├── db/
│   │   ├── index.ts                 # Database connection
│   │   └── schema.ts                # Drizzle schema
│   ├── actions/
│   │   └── chat.ts                  # Server actions
│   └── auth.ts                      # Better Auth config
├── utils/
│   └── chat.ts                      # Helper functions
├── types/
│   └── chat.ts                      # TypeScript types
├── .env.local                       # Environment variables
├── drizzle.config.ts               # Drizzle configuration
├── middleware.ts                    # Route protection
├── package.json
└── tsconfig.json
```
