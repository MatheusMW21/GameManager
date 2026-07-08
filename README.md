# GameBacklog

A full-stack game backlog manager that lets you track, review, and discover games. Integrates with IGDB, Steam, and HowLongToBeat to enrich your library with covers, metadata, and completion time estimates.

## Tech Stack

**Backend** — `GameBacklog.API`
- ASP.NET Core 9.0 Web API
- Entity Framework Core + PostgreSQL (Npgsql)
- JWT authentication via Clerk
- Swagger / OpenAPI

**Frontend** — `client`
- Next.js 16 (React 19, TypeScript)
- Tailwind CSS + shadcn/ui (Radix UI)
- TanStack Query for server state
- @dnd-kit for drag-and-drop

## Features

- **Backlog** — Add games with statuses: Planning, Playing, Completed, or Dropped. Set a gameplay goal (Main Story, Main + Extras, Completionist) and track hours played.
- **Reviews & Diary** — Write reviews, rate games on a 1–5 scale (0.5 increments), and log the date you played them.
- **Game Discovery** — Browse popular games and search IGDB. Game covers and metadata are fetched automatically when you add a title.
- **HowLongToBeat** — View estimated completion times (main story, main + extras, completionist) for any game.
- **Steam Integration** — Steam App IDs are resolved automatically so you can link backlog entries to your Steam library.
- **Profile** — Customize your profile with up to 4 favorite games, reorderable via drag-and-drop.
- **Public Feed** — Community-visible feed of recent reviews and recently reviewed games.
- **Wishlist** — Keep track of games you want to play next.
- **Dashboard** — At-a-glance stats: total games, completions, and reviews.

## Project Structure

```
GameManager/
├── GameBacklog.API/        # ASP.NET Core backend
│   ├── Controllers/        # API endpoints
│   ├── Models/             # Domain models (GameBacklogItem, Review, User)
│   ├── Services/           # IGDB, Steam, HowLongToBeat integrations
│   ├── Data/               # EF Core DbContext & migrations
│   └── Dtos/               # Request/response shapes
└── client/                 # Next.js frontend
    └── src/
        └── app/
            ├── dashboard/
            ├── discovery/
            ├── diary/
            ├── profile/
            └── wishlist/
```

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 20+ and pnpm
- PostgreSQL
- A [Clerk](https://clerk.com) account (for authentication)
- IGDB API credentials (Client ID + Access Token from Twitch Developer)

### Backend

1. Set up your connection string and secrets:

```bash
cd GameBacklog.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=gamebacklog;Username=postgres;Password=yourpassword"
dotnet user-secrets set "IgdbSettings:ClientId" "your_client_id"
dotnet user-secrets set "IgdbSettings:AccessToken" "your_access_token"
```

2. Apply migrations and run:

```bash
dotnet ef database update
dotnet run
```

The API will be available at `https://localhost:7xxx` with Swagger UI at `/swagger`.

### Frontend

```bash
cd client
pnpm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=https://localhost:7xxx
```

Then start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/games` | List / add backlog games |
| PUT/DELETE | `/api/games/{id}` | Update / remove a game |
| GET/POST | `/api/games/{id}/reviews` | List / create reviews |
| PUT/DELETE | `/api/games/{gameId}/reviews/{id}` | Edit / delete a review |
| GET | `/api/diary` | Personal review history |
| GET | `/api/externalgames/search` | Search IGDB |
| GET | `/api/externalgames/popular` | Trending games on IGDB |
| GET | `/api/externalgames/{id}` | Game details from IGDB |
| GET | `/api/feed/reviews` | Public recent reviews |
| GET | `/api/feed/recent-games` | Recently reviewed games |
| GET | `/api/profile` | User profile & favorite games |
| PUT | `/api/profile/favorites` | Update favorite game slots |
| GET | `/api/profile/stats` | User stats (totals, completions) |
| GET | `/api/hltb` | HowLongToBeat completion times |
| GET | `/api/steam` | Steam App ID lookup |
