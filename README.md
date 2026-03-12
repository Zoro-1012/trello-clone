# TaskOrbit Board

TaskOrbit Board is a Trello-inspired Kanban planning app built with Next.js. It now covers the full core feature set plus the requested bonus items, including comments, attachments, multiple boards, responsive layouts, card covers, and board background customization with a Trello-like purple default theme.

## Stack

- Frontend: Next.js (React App Router)
- Backend: Next.js Route Handlers on Node.js
- Drag and drop: `@hello-pangea/dnd`
- Database design: PostgreSQL modeled with Prisma
- Persistence mode: Prisma/PostgreSQL when `DATABASE_URL` is available, in-memory fallback when it is not

## Features

- Create and switch between boards
- Create, edit, delete, and reorder lists
- Create cards with an entered title and drag them within or across lists
- Edit card title and description
- Archive or delete cards
- Add labels, due dates, checklist items, members, comments, attachments, and cover images
- Search cards by title
- Filter cards by label, member, due date, and archived state
- Change board backgrounds from preset themes, including a Trello-style purple gradient
- Responsive layout for desktop, tablet, and mobile

## Database Notes

The repository includes a PostgreSQL Prisma schema in [prisma/schema.prisma](/Users/snehachoudhary/Documents/New project/prisma/schema.prisma) and a sample seed script in [prisma/seed.js](/Users/snehachoudhary/Documents/New project/prisma/seed.js).

The app reads and writes through [app/api/board/route.js](/Users/snehachoudhary/Documents/New project/app/api/board/route.js), using [lib/board-repository.js](/Users/snehachoudhary/Documents/New project/lib/board-repository.js). If a working `DATABASE_URL` is present, it persists to PostgreSQL through Prisma. If not, it falls back to the local in-memory store in [lib/store.js](/Users/snehachoudhary/Documents/New project/lib/store.js) so the project still runs for reviewers.

## Setup

1. Install dependencies with `npm install`
2. Start the app with `npm run dev`
3. Open `http://localhost:3000`

## Optional PostgreSQL Setup

1. Create a PostgreSQL database
2. Add `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME` to `.env`
3. Run `npx prisma generate`
4. Run `npx prisma db push`
5. Run `npm run seed`
6. Start the app with `npm run dev`

## Assumptions

- A default workspace is available and no authentication is required
- Sample members, labels, board data, and cards are preloaded
- Filtering disables drag-and-drop to avoid reordering against a partial card set
- Local file attachments are stored as data URLs in the current implementation so they work without third-party storage
- If PostgreSQL is unavailable, the app transparently falls back to in-memory persistence for local review
