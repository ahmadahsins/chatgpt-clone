## **Development Workflow: ChatGPT Clone Project**

This document details the complete development workflow for the "ChatGPT Clone" project.

---

### **Phase 0: Project Setup & Foundation**

**Goal:** Set up the project boilerplate, configure the database, and implement the authentication flow.

**Completed Tasks:**

1. **Initialize Next.js Project:**

   - Next.js 15 with App Router
   - TypeScript configuration
   - TailwindCSS v4 setup

2. **Install Core Dependencies:**

   - Drizzle ORM + Neon Database
   - Better Auth (Google OAuth + Email/Password)
   - AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/google`)
   - Vercel Blob for file storage
   - shadcn/ui components
   - next-themes for theme management

3. **Configure Neon Database & Drizzle:**

   - Database schema: `user`, `session`, `account`, `verification`, `chats`, `messages`
   - Support for file attachments (JSONB)
   - Support for web search sources (JSONB)
   - Drizzle config with Neon serverless driver
   - Migrations applied

4. **Implement Better Auth:**

   - API route: `/api/auth/[...all]/route.ts`
   - Google OAuth provider
   - Email/Password provider
   - Session management
   - Database integration

5. **Create Protected Routes:**

   - Middleware protects `/chat/*` routes
   - Redirect unauthenticated users to `/login`
   - Session validation on all protected pages

6. **Create Basic Layout Structure:**
   - Root layout with theme provider
   - Chat layout with collapsible sidebar
   - Login/Signup pages
   - Main chat page at `/chat`

---

### **Phase 1: Core Chat Functionality**

**Goal:** Implement fully functional chat interface with streaming AI responses.

**Completed Tasks:**

1. **Create API Route for AI SDK:**

   - API route at `/api/chat/route.ts`
   - Streaming AI responses with `streamText()` and `toUIMessageStreamResponse()`
   - Using Google Gemini 2.5 Flash model
   - System prompt with ChatGPT persona
   - Web search usage guidelines

2. **Create Chat Interface Component:**

   - Client component `ChatInterface.tsx` with `useChat` hook
   - AI Elements UI components for modern chat interface
   - Message rendering with `message.parts` structure
   - Streaming status indicators

3. **Design Chat UI:**

   - Conversation component with scroll management
   - Message bubbles (user/assistant)
   - Response component with markdown rendering
   - Code syntax highlighting
   - Copy message functionality
   - Like/Dislike actions (UI only)

4. **Implement Prompt Input:**
   - Auto-resizing textarea
   - Submit on Enter, new line on Shift+Enter
   - File attachment support
   - Drag-and-drop upload
   - Loading states

---

### **Phase 2: Database Integration & Chat Persistence**

**Goal:** Save conversations to database and enable chat history management.

**Completed Tasks:**

1. **Create Chat History Sidebar:**

   - Server Component fetches user's chats
   - Client Component (`ChatSidebar.tsx`) for UI interactions
   - Collapsible sidebar (desktop)
   - Sheet overlay (mobile)
   - Auto-close on mobile after selection

2. **Implement Date Grouping:**

   - Helper function `groupChatsByDate()`
   - Groups: Today, Yesterday, Older
   - Chronological ordering

3. **Create Dynamic Chat Route:**

   - Dynamic route `app/chat/[id]/page.tsx`
   - Server action `getChatMessages()` fetches messages
   - Security: validates user owns the chat
   - Converts DB format to UIMessage format
   - Passes messages to `ChatInterface`

4. **Configure `useChat` Hook:**

   - `DefaultChatTransport` for API configuration
   - Pass `chatId` in request body
   - `onFinish` callback for navigation
   - `useRef` to prevent duplicate redirects
   - `setMessages()` for initializing history

5. **Implement `/api/chat` API Route:**

   - Authentication with Better Auth
   - Parse `messages` and `chatId` from request
   - Create new chat if `chatId` is null
   - Async title generation (non-blocking)
   - Save user message to database
   - Stream AI response with Gemini
   - `onFinish` callback saves assistant message
   - Return stream with metadata (chatId)

6. **Client-side Chat ID Handling:**
   - Track chat ID state
   - Extract chatId from metadata
   - Navigate to `/chat/[id]` after first message
   - Refresh sidebar to show new chat

---

### **Phase 3: File Upload & Analysis**

**Goal:** Enable image and PDF upload with AI analysis.

**Completed Tasks:**

1. **Create Upload API Route:**

   - `/api/upload/route.ts`
   - Vercel Blob integration
   - File validation (images, PDFs)
   - Return file URL + metadata

2. **Implement File Upload in Chat:**

   - File attachment button in prompt input
   - Drag-and-drop support
   - Multiple file uploads
   - Preview before sending

3. **Client-side Upload Flow:**

   - Convert data URL to Blob
   - Upload to `/api/upload` before sending message
   - Include file URLs in message parts
   - Loading state during upload

4. **Database Integration:**

   - Store attachments metadata in `messages` table
   - JSONB column for file array
   - Include type, url, filename, size, mimeType

5. **AI Analysis:**

   - Gemini model analyzes image content
   - PDF text extraction and understanding
   - Context-aware responses

6. **Display Attachments:**
   - Image preview in user messages
   - PDF viewer (iframe) in user messages
   - Persistent display after streaming

---

### **Phase 4: Web Search Integration**

**Goal:** Integrate Google Search tool with smart usage policy.

**Completed Tasks:**

1. **Configure Google Search Tool:**

   - Add `google.tools.googleSearch()` to tools
   - Configure in `streamText()` call

2. **Implement Smart Usage Policy:**

   - Detailed system prompt guidelines
   - Only for current/recent information
   - Avoid for general knowledge
   - Explicit search request support

3. **Extract Grounding Metadata:**

   - Parse `groundingMetadata` from Gemini response
   - Extract source URLs and titles
   - Avoid duplicate sources

4. **Display Sources:**

   - Inline citation badges
   - Hover cards with previews
   - Clickable source links
   - "Sources:" section below messages

5. **Database Integration:**

   - Store sources in `messages` table
   - JSONB column for sources array
   - Include url and title

6. **Reasoning Display:**
   - Show "Searching the web..." during tool usage
   - Reasoning component with loading state

---

### **Phase 5: Chat Management Features**

**Goal:** Implement rename, delete, and search functionality.

**Completed Tasks:**

1. **Auto-Generated Titles:**

   - Async title generation with `generateChatTitleAsync()`
   - Fallback to truncated prompt
   - Retry logic (max 2 retries)
   - Timeout handling (8 seconds)
   - Background update (non-blocking)

2. **Rename Chat:**

   - `RenameChatDialog` component
   - Form submission with Enter key
   - Validation (not empty, changed)
   - Server action `renameChatTitle()`
   - Router refresh after rename

3. **Delete Chat:**

   - `DeleteChatDialog` component
   - Confirmation before deletion
   - Server action `deleteChatById()`
   - Cascade delete (removes messages)
   - Redirect if on deleted chat page
   - Router refresh after delete

4. **Search Chats:**

   - `ChatSearchDialog` component
   - Cmd/Ctrl+K keyboard shortcut
   - Real-time filtering with `searchChats()`
   - Command palette UI
   - Navigate to selected chat

5. **Chat Actions Dropdown:**
   - Reusable `ChatActionsDropdown` component
   - Available in sidebar and header
   - Rename and Delete options
   - Hover-to-show on desktop
   - Always visible on mobile

---

### **Phase 6: UI/UX Enhancements**

**Goal:** Polish the interface and add modern UX features.

**Completed Tasks:**

1. **Theme System:**

   - next-themes integration
   - Light/Dark mode toggle
   - System preference detection
   - Persistent theme selection
   - Theme-aware component styling

2. **Custom Scrollbar:**

   - Webkit scrollbar styling
   - Firefox scrollbar support
   - Theme-aware colors (oklch)
   - Smooth scrolling behavior
   - Isolated to chat history container

3. **Empty State Design:**

   - Centered layout
   - Time-based greeting (morning/afternoon/evening)
   - Personalized with user's first name
   - "How can I help you today?" message
   - Centered prompt input

4. **Responsive Design:**

   - Mobile-first approach
   - Sidebar as sheet on mobile
   - Touch-friendly interactions
   - Adaptive layouts for all screen sizes
   - Auto-close sidebar on mobile

5. **shadcn/ui Integration:**

   - Button, Input, Label
   - Dialog, AlertDialog
   - DropdownMenu, Command
   - Sidebar, Sheet
   - Avatar, Badge, Separator
   - HoverCard, Tooltip
   - ScrollArea, Collapsible

6. **Message Actions:**
   - Copy message content
   - Like/Dislike feedback (UI)
   - Visible on hover (desktop)
   - Only show when message is ready

---

### **Phase 7: Authentication UI**

**Goal:** Create professional login and signup pages.

**Completed Tasks:**

1. **Login Page:**

   - `LoginForm` component
   - Email/Password form
   - Google OAuth button
   - Form validation with react-hook-form + zod
   - Error handling
   - Link to signup page

2. **Signup Page:**

   - `SignupForm` component
   - Name, Email, Password fields
   - Google OAuth button
   - Form validation
   - Password strength indicator
   - Link to login page

3. **User Profile:**
   - Avatar display in sidebar
   - Dropdown menu with user info
   - Logout option
   - Theme toggle in dropdown

---

### **Phase 8: Performance & Optimization**

**Goal:** Optimize performance and user experience.

**Completed Tasks:**

1. **Async Title Generation:**

   - Non-blocking title generation
   - Instant chat creation with fallback title
   - Background AI title generation
   - Retry logic for failures

2. **Optimistic UI Updates:**

   - Immediate message display
   - Loading states during upload
   - Disabled states during processing

3. **Router Refresh Strategy:**

   - Refresh after new chat creation
   - Refresh after rename/delete
   - Preserve scroll position

4. **Hydration Handling:**
   - Client-side hydration check
   - Prevent hydration mismatches
   - Proper useEffect dependencies

---

## **Key Implementation Details**

### **AI SDK Integration**

**Client-side (`@ai-sdk/react`):**

- `useChat` hook manages state
- `message.parts` structure for content
- `sendMessage()` for sending messages
- `setMessages()` for initializing history
- `status` tracking (ready, streaming, submitted)

**Server-side (`ai`):**

- `streamText()` for AI generation
- `convertToModelMessages()` for format conversion
- `toUIMessageStreamResponse()` for streaming
- `messageMetadata` for custom data

### **Database Schema**

**Better Auth Tables:**

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth providers
- `verification` - Email verification

**Chat Tables:**

- `chats` - Conversation threads
- `messages` - Individual messages with attachments and sources

### **File Upload Flow**

1. User selects file
2. Client creates preview (data URL)
3. User sends message
4. Client uploads to Vercel Blob
5. Client sends message with file URL
6. Server forwards to Gemini
7. AI analyzes and responds
8. Server saves with metadata

### **Web Search Flow**

1. User asks question
2. Gemini evaluates if search needed
3. If yes, uses Google Search tool
4. Server extracts grounding metadata
5. Server generates response with citations
6. Client displays sources
7. Server saves with sources array

---

## **Testing Checklist**

### **Authentication**

- ✅ Google OAuth sign-in
- ✅ Email/Password sign-up
- ✅ Email/Password sign-in
- ✅ Session persistence
- ✅ Logout functionality
- ✅ Protected route access

### **Chat Functionality**

- ✅ Create new chat
- ✅ Send text messages
- ✅ Streaming responses
- ✅ Markdown rendering
- ✅ Code syntax highlighting
- ✅ Copy message content

### **File Upload**

- ✅ Upload images
- ✅ Upload PDFs
- ✅ Multiple file attachments
- ✅ Drag-and-drop
- ✅ Image preview
- ✅ PDF viewer
- ✅ AI analysis of files

### **Web Search**

- ✅ Smart search activation
- ✅ Source extraction
- ✅ Citation display
- ✅ Clickable source links
- ✅ Avoid unnecessary searches

### **Chat Management**

- ✅ Auto-generated titles
- ✅ Rename chat
- ✅ Delete chat
- ✅ Search chats (Cmd/Ctrl+K)
- ✅ Date grouping
- ✅ Chat history persistence

### **UI/UX**

- ✅ Light/Dark theme toggle
- ✅ Responsive design (mobile/desktop)
- ✅ Custom scrollbar
- ✅ Empty state greeting
- ✅ Loading states
- ✅ Error handling

---

## **Deployment Checklist**

### **Environment Variables**

- [ ] `DATABASE_URL` (Neon)
- [ ] `BETTER_AUTH_SECRET`
- [ ] `BETTER_AUTH_URL`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] `BLOB_READ_WRITE_TOKEN`

### **Database**

- [ ] Run migrations on production
- [ ] Verify schema is up to date
- [ ] Test database connection

### **Vercel Deployment**

- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] Configure environment variables
- [ ] Enable Vercel Blob
- [ ] Deploy and test

### **Post-Deployment**

- [ ] Test authentication flow
- [ ] Test chat creation
- [ ] Test file uploads
- [ ] Test web search
- [ ] Test on mobile devices
- [ ] Monitor error logs

---

## **Future Enhancements**

### **Potential Features**

- [ ] Voice input/output
- [ ] Chat export (PDF, Markdown)
- [ ] Chat sharing (public links)
- [ ] Custom AI instructions per chat
- [ ] Message editing
- [ ] Message regeneration
- [ ] Conversation branching
- [ ] Multi-modal responses (images, charts)
- [ ] Plugin system
- [ ] Team collaboration

### **Performance Optimizations**

- [ ] Message pagination
- [ ] Virtual scrolling for long chats
- [ ] Image optimization
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Caching strategy

### **Analytics**

- [ ] Usage tracking
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
- [ ] User feedback collection

---

### **Phase 7: API Protection & Rate Limiting**

**Goal:** Implement rate limiting to protect API endpoints from spam and DDoS attacks before public deployment.

**Completed Tasks:**

1. **Setup Upstash Redis:**
   - Created Upstash account
   - Created Redis database
   - Obtained REST URL and token
   - Added environment variables

2. **Install Dependencies:**
   ```bash
   pnpm add @upstash/ratelimit @upstash/redis
   ```

3. **Create Rate Limit Utility:**
   - File: `lib/rate-limit.ts`
   - Redis client configuration
   - Rate limiters for different endpoints:
     - `chatRateLimit`: 10 requests/minute
     - `uploadRateLimit`: 5 uploads/minute
     - `authRateLimit`: 5 attempts/5 minutes
   - `getClientIp()`: Extract IP from headers
   - `createRateLimitResponse()`: Standardized 429 responses

4. **Implement Rate Limiting in API Routes:**
   - **Chat API** (`app/api/chat/route.ts`):
     - Added rate limit check before authentication
     - Returns 429 if limit exceeded
     - Includes retry-after header
   - **Upload API** (`app/api/upload/route.ts`):
     - Added rate limit check for file uploads
     - Prevents upload spam
   - **Auth API** (future implementation):
     - Rate limit for login/signup attempts
     - Prevents brute force attacks

5. **Error Response Format:**
   ```json
   {
     "error": "Too many requests",
     "message": "Rate limit exceeded. Try again in X seconds.",
     "limit": 10,
     "remaining": 0,
     "reset": 1699999999999
   }
   ```

6. **Response Headers:**
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Requests remaining
   - `X-RateLimit-Reset`: Timestamp when limit resets
   - `Retry-After`: Seconds to wait before retry

**Environment Variables:**
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Testing:**
- Test rate limiting locally
- Verify 429 responses
- Check retry-after headers
- Test different IP addresses
- Verify limits reset correctly

**Deployment Checklist:**
- [ ] Upstash Redis configured in production
- [ ] Environment variables set in Vercel
- [ ] Rate limits tested in production
- [ ] Monitoring setup for rate limit hits
- [ ] Documentation updated

---
