# Second Brain

A web application for capturing and organizing links, articles, ideas, and notes with AI-powered categorization.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Database & Auth**: Supabase
- **Automation**: n8n (webhooks for AI processing)

## Setup

### 1. Supabase Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/ccnbwzfdgfwwjrwozroo
2. Navigate to **SQL Editor**
3. Run the SQL schema from `supabase-schema.sql`
4. Enable **Email/Password** and **Google** auth providers in Authentication > Providers
5. Copy your **Project URL** and **anon public key** from Settings > API

### 2. Environment Variables

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://ccnbwzfdgfwwjrwozroo.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

VITE_N8N_PROCESS_ITEM_URL=https://n8n.apautomatebiz.com/webhook/second-brain/process
VITE_N8N_ADD_TO_CALENDAR_URL=https://n8n.apautomatebiz.com/webhook/second-brain/calendar
```

### 3. n8n Workflow Setup

1. Import `n8n-workflow-second-brain.json` into your n8n instance
2. Configure credentials:
   - OpenAI API (for AI categorization)
   - Google Calendar OAuth (for calendar integration)
3. Activate the workflow

### 4. Run Locally

```bash
npm install
npm run dev
```

## Features

- **Quick Capture**: Prominent input field to paste URLs or text
- **AI Categorization**: Automatically categorizes and summarizes content via n8n
- **Folder System**: Customizable folders (Inbox, Notes, Gratitude, Archive, custom)
- **Read/Unread Toggle**: Track what you've processed
- **Add to Calendar**: Create Google Calendar events from items
- **Search**: Real-time global search across all content
- **Responsive**: Works on desktop and mobile

## Project Structure

```
src/
├── components/
│   ├── items/          # ItemCard, ItemGrid, EditItemModal
│   ├── layout/         # Sidebar, Header, QuickCapture
│   └── ui/             # Button, Input, Modal, DropdownMenu
├── context/
│   └── AuthContext.tsx # Supabase auth context
├── lib/
│   ├── database.ts     # Supabase database operations
│   ├── n8n.ts          # n8n webhook integration
│   └── supabase.ts     # Supabase client
├── pages/
│   ├── Auth.tsx        # Login/Signup page
│   └── Dashboard.tsx   # Main dashboard
└── types/
    └── index.ts        # TypeScript types
```

## n8n Webhook Endpoints

### POST /webhook/second-brain/process

Processes new items with AI categorization.

**Request:**
```json
{
  "input": "https://example.com/article or plain text",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "title": "Generated title",
  "summary": "AI-generated summary",
  "category": "Notes",
  "item_type": "link",
  "tags": ["tag1", "tag2"],
  "url": "https://example.com/article"
}
```

### POST /webhook/second-brain/calendar

Creates a Google Calendar event.

**Request:**
```json
{
  "itemId": "item-uuid",
  "title": "Event title",
  "description": "Event description",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "google-event-id",
  "eventUrl": "https://calendar.google.com/..."
}
```

## Database Schema

### Tables

- `profiles` - User profiles (linked to auth.users)
- `categories` - Folders for organizing items
- `items` - Main content items (links, notes, ideas)

### Key Features

- Row Level Security (RLS) enabled
- Full-text search with PostgreSQL
- Auto-created default categories on signup
- Automatic timestamp updates

## Deployment

1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables in Vercel
4. Deploy
