# ChatGPT Clone - Technical Specification Document

## Project Overview

A full-stack ChatGPT clone built with modern web technologies, featuring real-time AI conversations, user authentication, and conversation management.

### Tech Stack
- **Frontend & Backend**: Next.js 15 (App Router, TypeScript)
- **AI Integration**: Vercel AI SDK + AI UI Elements
- **Styling**: Tailwind CSS
- **Database**: Neon Serverless Postgres
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth

---

## Core Features

### 1. Authentication & User Management
- Email/password authentication
- OAuth providers (Google, GitHub)
- Session management
- User profile management
- Password reset functionality

### 2. Chat Interface
- Real-time streaming AI responses
- Markdown rendering with syntax highlighting
- Code block copy functionality
- Message regeneration
- Stop generation capability
- Token usage tracking

### 3. Conversation Management
- Create new conversations
- View conversation history
- Delete conversations
- Rename conversations
- Search conversations
- Pin important conversations

### 4. AI Features
- Multiple AI model selection (GPT-3.5, GPT-4, etc.)
- System prompts customization
- Temperature and parameter controls
- Context window management
- Streaming responses

### 5. UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Dark/light mode toggle
- Sidebar with conversation list
- Empty state guidance
- Loading states and skeletons
- Error handling and retry mechanisms

---

## User Flows

### User Registration & Login Flow
```
1. User visits homepage
2. Click "Sign Up" or "Login"
3. Choose authentication method:
   - Email/Password → Fill form → Verify email → Access dashboard
   - OAuth (Google/GitHub) → Authorize → Access dashboard
4. Redirect to main chat interface
```

### Chat Interaction Flow
```
1. User lands on chat interface
2. Options:
   a. Start new conversation → Empty chat view
   b. Select existing conversation → Load chat history
3. User types message in input field
4. User clicks send or presses Enter
5. Message appears in chat
6. AI response streams in real-time
7. Response completes with token count
8. User can:
   - Continue conversation
   - Regenerate response
   - Copy response
   - Start new chat
```

### Conversation Management Flow
```
1. User opens sidebar
2. View list of all conversations
3. User can:
   - Click conversation → Load in main view
   - Hover conversation → Show actions (rename, delete, pin)
   - Search conversations → Filter by keyword
   - Create new conversation → Navigate to empty chat
   - Delete conversation → Confirm → Remove from list
```

### Settings & Preferences Flow
```
1. User clicks settings icon
2. Access settings panel/page
3. Configure:
   - AI model selection
   - System prompt
   - Temperature/parameters
   - Theme (dark/light)
   - Account settings
4. Save changes → Apply immediately
```

---

## Database Schema

### Users Table
```sql
users {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  email: varchar(255) UNIQUE NOT NULL
  name: varchar(255)
  password_hash: varchar(255) -- null for OAuth users
  avatar_url: text
  provider: varchar(50) -- 'email', 'google', 'github'
  provider_id: varchar(255) -- external provider user ID
  email_verified: boolean DEFAULT false
  created_at: timestamp DEFAULT now()
  updated_at: timestamp DEFAULT now()
}
```

### Sessions Table (Better Auth)
```sql
sessions {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
  token: varchar(255) UNIQUE NOT NULL
  expires_at: timestamp NOT NULL
  created_at: timestamp DEFAULT now()
  updated_at: timestamp DEFAULT now()
}
```

### Conversations Table
```sql
conversations {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
  title: varchar(255) NOT NULL
  is_pinned: boolean DEFAULT false
  model: varchar(50) DEFAULT 'gpt-3.5-turbo'
  system_prompt: text
  temperature: decimal(3,2) DEFAULT 0.7
  created_at: timestamp DEFAULT now()
  updated_at: timestamp DEFAULT now()
  
  INDEX idx_user_conversations (user_id, created_at DESC)
  INDEX idx_pinned_conversations (user_id, is_pinned, updated_at DESC)
}
```

### Messages Table
```sql
messages {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  conversation_id: uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE
  role: varchar(20) NOT NULL -- 'user', 'assistant', 'system'
  content: text NOT NULL
  tokens_used: integer
  model: varchar(50) -- specific model used for this response
  created_at: timestamp DEFAULT now()
  
  INDEX idx_conversation_messages (conversation_id, created_at ASC)
}
```

### User Preferences Table
```sql
user_preferences {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
  theme: varchar(20) DEFAULT 'light' -- 'light', 'dark', 'system'
  default_model: varchar(50) DEFAULT 'gpt-3.5-turbo'
  default_temperature: decimal(3,2) DEFAULT 0.7
  default_system_prompt: text
  sidebar_collapsed: boolean DEFAULT false
  created_at: timestamp DEFAULT now()
  updated_at: timestamp DEFAULT now()
}
```

### API Keys Table (Optional - for user's own keys)
```sql
api_keys {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
  provider: varchar(50) NOT NULL -- 'openai', 'anthropic', etc.
  encrypted_key: text NOT NULL
  is_active: boolean DEFAULT true
  created_at: timestamp DEFAULT now()
  updated_at: timestamp DEFAULT now()
  
  INDEX idx_user_api_keys (user_id, provider)
}
```

### Usage Tracking Table (Optional)
```sql
usage_tracking {
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
  conversation_id: uuid REFERENCES conversations(id) ON DELETE SET NULL
  model: varchar(50) NOT NULL
  prompt_tokens: integer NOT NULL
  completion_tokens: integer NOT NULL
  total_tokens: integer NOT NULL
  cost: decimal(10,6) -- estimated cost in USD
  created_at: timestamp DEFAULT now()
  
  INDEX idx_user_usage (user_id, created_at DESC)
  INDEX idx_monthly_usage (user_id, date_trunc('month', created_at))
}
```

---

## API Routes Structure

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/reset-password` - Password reset request
- `POST /api/auth/oauth/[provider]` - OAuth authentication

### Chat Routes
- `POST /api/chat` - Send message and stream response
- `POST /api/chat/regenerate` - Regenerate last response

### Conversation Routes
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get conversation with messages
- `PATCH /api/conversations/[id]` - Update conversation (rename, pin)
- `DELETE /api/conversations/[id]` - Delete conversation

### User Routes
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/preferences` - Get user preferences
- `PATCH /api/user/preferences` - Update preferences
- `GET /api/user/usage` - Get usage statistics

---

## Key Implementation Details

### AI SDK Integration
```typescript
// Using Vercel AI SDK for streaming responses
import { OpenAIStream, StreamingTextResponse } from 'ai'

// Server action or API route
const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  stream: true,
  messages: conversationHistory,
})

const stream = OpenAIStream(response)
return new StreamingTextResponse(stream)
```

### Real-time Message Updates
- Use React Server Components for initial load
- Implement optimistic updates for immediate feedback
- Stream AI responses using Vercel AI SDK's `useChat` hook
- WebSocket or Server-Sent Events for multi-device sync (optional)

### Security Considerations
- API keys stored encrypted in database
- Rate limiting on API routes
- Input sanitization and validation
- CSRF protection via Better Auth
- Row-level security with user_id checks
- Secure session management

### Performance Optimizations
- Infinite scroll for conversation history
- Lazy loading of messages
- Debounced search
- Cached conversation list
- Optimistic UI updates
- Edge runtime for API routes where possible

---

## Project Structure

```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(dashboard)
    /page.tsx (main chat interface)
    /c/[id]/page.tsx (specific conversation)
    /settings/page.tsx
  /api
    /auth/[...auth]/route.ts
    /chat/route.ts
    /conversations/route.ts
    /conversations/[id]/route.ts
    /user/route.ts
/components
  /chat
    /ChatInterface.tsx
    /MessageList.tsx
    /MessageInput.tsx
    /Message.tsx
  /sidebar
    /Sidebar.tsx
    /ConversationList.tsx
    /ConversationItem.tsx
  /ui (shadcn/ui components)
/lib
  /db
    /schema.ts (Drizzle schema)
    /index.ts (database connection)
  /auth
    /config.ts (Better Auth config)
  /ai
    /client.ts (AI SDK setup)
/hooks
  /useChat.ts
  /useConversations.ts
/types
  /index.ts
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# AI Provider
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project with TypeScript
- Configure Drizzle ORM with Neon
- Implement Better Auth
- Create database schema and migrations
- Basic UI layout with Tailwind

### Phase 2: Core Features (Week 3-4)
- Build chat interface
- Integrate Vercel AI SDK
- Implement streaming responses
- Create conversation management
- Message persistence

### Phase 3: Enhancement (Week 5-6)
- Add conversation search
- Implement user preferences
- Add multiple model support
- Usage tracking
- Error handling and edge cases

### Phase 4: Polish (Week 7-8)
- UI/UX refinements
- Performance optimizations
- Mobile responsiveness
- Testing and bug fixes
- Documentation

---

## Future Enhancements
- File upload and analysis
- Image generation integration
- Voice input/output
- Conversation sharing
- Team/workspace features
- Plugin system
- Custom AI model fine-tuning
- Export conversations
- Multi-language support