# ChatGPT Clone

A fully-featured ChatGPT clone built with Next.js 15, featuring real-time AI chat, file analysis, web search integration, and comprehensive chat management.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🔐 Authentication
- **Multiple Sign-in Methods**: Google OAuth & Email/Password
- **Secure Sessions**: Better Auth integration
- **Protected Routes**: Middleware-based route protection
- **User Profiles**: Avatar display with dropdown menu

### 💬 Real-time Chat
- **AI-Powered**: Google Gemini 2.5 Flash model
- **Streaming Responses**: Token-by-token display
- **Markdown Support**: Full markdown rendering with syntax highlighting
- **Code Blocks**: Syntax highlighting with copy functionality
- **Message Actions**: Copy, Like/Dislike feedback

### 📁 File Upload & Analysis
- **Supported Formats**: Images (JPEG, PNG, GIF, WebP) & PDFs
- **Vercel Blob Storage**: Scalable file storage
- **AI Analysis**: Image understanding & PDF text extraction
- **Preview**: In-chat image preview & PDF viewer
- **Multiple Attachments**: Upload multiple files per message

### 🔍 Web Search Integration
- **Google Search Tool**: Real-time web search capability
- **Smart Usage**: Only activates for current/recent information
- **Source Attribution**: Clickable citations with hover previews
- **Grounding Metadata**: Automatic source extraction

### 📝 Chat Management
- **Auto-Generated Titles**: AI-powered title generation
- **Rename Chat**: Dialog-based with Enter key support
- **Delete Chat**: Confirmation dialog with cascade delete
- **Search Chats**: Cmd/Ctrl+K keyboard shortcut
- **Date Grouping**: Today, Yesterday, Older

### 🎨 UI/UX
- **Theme Toggle**: Light/Dark mode with system preference
- **Responsive Design**: Mobile-first, adaptive layouts
- **Custom Scrollbar**: Theme-aware styling
- **Empty State**: Personalized greeting with time-based message
- **shadcn/ui**: Modern, accessible components

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI/Streaming**: [Vercel AI SDK](https://sdk.vercel.ai/) & AI UI Elements
- **AI Model**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **File Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Neon database account
- Google Cloud Console project (for OAuth & Gemini API)
- Vercel account (for Blob storage)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/chatgpt-clone.git
cd chatgpt-clone
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

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

4. **Set up the database**

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Project Structure

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
│   └── globals.css                   # Global styles
├── components/
│   ├── ai-elements/                  # AI UI components
│   ├── ui/                           # shadcn/ui components
│   ├── chat-interface.tsx           # Main chat interface
│   ├── chat-sidebar.tsx             # Sidebar component
│   └── ...                          # Other components
├── lib/
│   ├── db/
│   │   ├── index.ts                 # Database connection
│   │   └── schema.ts                # Drizzle schema
│   ├── actions/
│   │   └── chat.ts                  # Server actions
│   └── auth.ts                      # Better Auth config
└── utils/
    └── chat.ts                      # Helper functions
```

## 🔑 Key Features Implementation

### Authentication Flow

- **Google OAuth**: One-click sign-in with Google
- **Email/Password**: Traditional authentication with form validation
- **Session Management**: Secure cookie-based sessions
- **Route Protection**: Middleware guards `/chat/*` routes

### Chat Functionality

- **Streaming**: Real-time AI responses using Vercel AI SDK
- **Message Parts**: Supports text, files, and tool calls
- **Persistence**: All messages saved to Neon database
- **History**: Load previous conversations from sidebar

### File Upload

1. User selects file (drag-and-drop or button)
2. Client uploads to Vercel Blob
3. File URL included in message
4. Gemini analyzes file content
5. Metadata saved to database

### Web Search

1. User asks question requiring current info
2. Gemini evaluates if search needed (based on system prompt)
3. Google Search tool activated
4. Sources extracted from grounding metadata
5. Citations displayed with clickable links

## 🎯 Usage

### Creating a New Chat

1. Click "New Chat" button or navigate to `/chat`
2. Type your message in the input field
3. Optionally attach files (images or PDFs)
4. Press Enter or click Send
5. AI responds with streaming text
6. Chat automatically titled and saved

### Managing Chats

- **Rename**: Click dropdown → Rename → Enter new title
- **Delete**: Click dropdown → Delete → Confirm
- **Search**: Press Cmd/Ctrl+K → Type query → Select chat

### File Analysis

1. Click attachment icon or drag file into chat
2. Select image or PDF file
3. Preview appears in input area
4. Send message with or without text
5. AI analyzes file and responds

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

## 📦 Build

Create a production build:

```bash
npm run build
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Enable Vercel Blob
5. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chatgpt-clone)

### Environment Variables

Make sure to set all required environment variables in your Vercel project settings:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

## 📚 Documentation

- [Tech Spec](./techspec.md) - Detailed technical specifications
- [Dev Workflow](./dev-workflow.md) - Development workflow and phases

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com/) for AI SDK and hosting
- [Google](https://ai.google.dev/) for Gemini AI model
- [shadcn](https://ui.shadcn.com/) for beautiful UI components
- [Better Auth](https://www.better-auth.com/) for authentication
- [Neon](https://neon.tech/) for serverless Postgres

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/chatgpt-clone](https://github.com/yourusername/chatgpt-clone)

---

Made with ❤️ using Next.js 15
