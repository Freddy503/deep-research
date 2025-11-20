# Deep Research - Frontend

A Perplexity-style AI research interface built with Next.js, Shadcn UI, and Mastra streaming capabilities.

## Features

- 🔍 **Real-time streaming responses** - Get research results token-by-token as they're generated
- 📚 **Source citations** - View sources and citations for all research findings
- 🎨 **Modern UI** - Clean, responsive design using Shadcn UI components
- ⚡ **Fast & Responsive** - Built with Next.js 15 and React 19
- 🔗 **Mastra Integration** - Seamlessly integrated with Mastra research agents

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```

   Required keys:
   - `EXA_API_KEY` - For web search functionality
   - `OPENAI_API_KEY` or other model provider key (based on MODEL setting)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Frontend
- **Next.js 15** - App Router with React Server Components
- **Shadcn UI** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe code

### API Routes
- `/app/api/research/route.ts` - Streaming research endpoint

### Components
- `SearchInput` - Search bar with loading states
- `MessageList` - Message display with streaming support
- `SourcesCard` - Source citations display

### Streaming Flow
1. User submits a query
2. Frontend sends POST request to `/api/research`
3. API calls Mastra research agent with streaming
4. Text chunks stream back token-by-token
5. Sources are sent at the end of the stream
6. Frontend renders everything in real-time

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run mastra:dev` - Run Mastra CLI in dev mode
- `npm run mastra:build` - Build Mastra agents
- `npm run mastra:start` - Start Mastra in production

## Project Structure

```
/home/user/deep-research/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.ts          # Streaming API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── message-list.tsx          # Message display
│   ├── search-input.tsx          # Search input
│   └── sources-card.tsx          # Sources display
├── lib/
│   └── utils.ts                  # Utility functions
└── src/
    └── mastra/                   # Mastra agents & workflows
        ├── agents/
        ├── tools/
        └── workflows/
```

## How It Works

### Research Agent
The research agent performs two-phase research:
1. **Initial Research**: Generates 2-3 focused queries and searches the web
2. **Follow-up Research**: Extracts learnings and searches follow-up questions

### Streaming
- Uses Server-Sent Events (SSE) for real-time streaming
- Sends text chunks as `{type: 'text', content: string}`
- Sends sources at end as `{type: 'sources', content: Source[]}`
- Frontend incrementally builds the response

### UI Design
Inspired by Perplexity:
- Centered search on empty state
- Streaming responses with typing effect
- Inline source citations
- Clean, minimal design
- Responsive layout

## Customization

### Styling
- Edit `app/globals.css` for global styles
- Modify `tailwind.config.js` for theme customization
- Update color variables in `globals.css` `:root` and `.dark`

### Agent Configuration
- Edit agents in `src/mastra/agents/`
- Modify tools in `src/mastra/tools/`
- Update workflows in `src/mastra/workflows/`

## Troubleshooting

### Port already in use
If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Missing API keys
Ensure all required API keys are set in `.env` file.

### Streaming not working
- Check browser console for errors
- Verify API route is returning correct headers
- Ensure Mastra agent is properly initialized

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Mastra Documentation](https://mastra.dev)
- [Tailwind CSS](https://tailwindcss.com)
