# QA Ticket Tracking Application

A full-stack web application for tracking ticket validation across four environments: **Thor → QA → Release → Production**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, React Query |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (local login) |
| Deployment | Docker Compose |

## Quick Start (Docker)

**Prerequisites:** Docker and Docker Compose

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:3001/api |
| Health check | http://localhost:3001/api/health |

On first startup, the backend runs migrations and seeds example data.

### Demo credentials

| Email | Password |
|-------|----------|
| `qa@example.com` | `password123` |
| `admin@example.com` | `password123` |

### Example seeded tickets

- **TKT-1001** — Thor, In Progress
- **TKT-1002** — QA (Thor passed)
- **TKT-1003** — Thor failed (overall Failed)
- **TKT-1004** — Release blocked
- **TKT-1005** — Production passed (overall Passed)

## Local Development (without Docker)

### 1. Database

Start PostgreSQL locally, or run only the DB container:

```bash
docker-compose up db -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API runs at `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173` (Vite proxies `/api` to the backend).

## Workflow Rules

1. New tickets start in **Thor** with status **In Progress**.
2. Update environment status manually: Pass, Fail, Blocked, In Progress.
3. Promotion is **manual only** — use promote buttons when current environment is **Pass**.
4. Environments cannot be skipped: Thor → QA → Release → Production.
5. **Overall status** logic:
   - **Failed** if any environment failed
   - **Blocked** if any environment blocked
   - **Passed** only when Production passes
   - **In Progress** otherwise

All status changes and promotions are stored in **ActivityLog** (never deleted).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tickets` | List tickets (filters, search, sort) |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/stats` | Dashboard statistics |
| GET | `/api/tickets/activity/recent` | Recent activity |
| GET | `/api/tickets/:id` | Single ticket |
| PATCH | `/api/tickets/:id` | Update ticket details |
| PATCH | `/api/tickets/:id/status` | Update environment status |
| POST | `/api/tickets/:id/promote` | Promote to next environment |
| POST | `/api/tickets/:id/comments` | Add comment |
| GET | `/api/tickets/:id/activity` | Ticket activity log |

## Project Structure

```
TicketTrackingApp/
├── backend/
│   ├── prisma/          # Schema, migrations, seed
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── docker-compose.yml
└── README.md
```

## Features

- Dashboard with stats cards and charts
- Filter, search, and sort tickets
- Ticket detail with timeline, activity log, comments
- Dark mode
- CSV export
- Basecamp link copy / open in new tab
- Toast notifications

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticket_tracking?schema=public
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:3001/api
```

## Re-seed database

```bash
cd backend
npm run db:seed
```

Or with Docker:

```bash
docker-compose run --rm backend-seed
```

## License

MIT
