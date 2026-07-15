# Shortly — URL Shortener

A full-stack URL shortener with custom aliases, click tracking, expiry controls, and a sleek dark-mode dashboard.

![Tech Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20React%20%7C%20TypeScript-6366f1?style=flat-square)
![License](https://img.shields.io/badge/license-ISC-8b5cf6?style=flat-square)

---

## Features

- **Custom aliases** — choose your own short slug instead of a random code
- **Click tracking** — every redirect logs timestamp, IP, and user-agent
- **Click limits** — links auto-deactivate after a configurable max click count
- **Expiry dates** — links expire automatically after a set duration
- **Status filters** — view active, expired, disabled, or click-limited links
- **Dashboard analytics** — live stats and a link distribution chart
- **JWT authentication** — secure, stateless auth with token refresh on every request
- **Soft delete** — "deleted" links are disabled, not erased

---

## Project Structure

```
URL_Shortener/
├── backend/          # Express + MongoDB API
│   └── src/
│       ├── config/       # Database connection
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, validation, error handling
│       ├── models/        # Mongoose schemas (User, Link)
│       ├── routes/        # API route definitions
│       ├── services/      # Business logic
│       ├── utils/         # Helpers (APIFeatures, AppError, etc.)
│       └── validators/    # Zod schemas
└── frontend/         # React + TypeScript + Tailwind SPA
    └── src/
        ├── components/   # Reusable UI (Modal, CopyButton, StatusBadge…)
        ├── context/      # AuthContext (JWT state)
        ├── lib/          # Axios client, TypeScript types
        └── pages/        # Landing, Login, Register, Dashboard, Links
```

---

## API Reference

Base URL: `http://localhost:5000`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Login and receive a JWT |
| `GET` | `/api/auth/me` | ✅ | Get the current user |

### Links

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/links` | ✅ | Create a short link |
| `GET` | `/api/links` | ✅ | List links (search, filter, sort, paginate) |
| `PATCH` | `/api/links/:id` | ✅ | Update alias or toggle active state |
| `DELETE` | `/api/links/:id` | ✅ | Soft-delete (disable) a link |

**GET `/api/links` query params:**

| Param | Values | Description |
|-------|--------|-------------|
| `search` | string | Search alias or original URL |
| `status` | `active` \| `expired` \| `disabled` \| `clicklimit` | Filter by state |
| `sort` | `createdAt` \| `clicks` \| `alias` | Sort field |
| `order` | `asc` \| `desc` | Sort direction |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dashboard` | ✅ | Aggregated stats + recent + most-clicked links |

### Public Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:username/:alias` | Redirect to the original URL |

Protected routes require: `Authorization: Bearer <token>`

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (Atlas free tier works)

### 1. Clone

```bash
git clone https://github.com/Amitabh-Ozymandias/URL-Shortener.git
cd URL-Shortener
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
BASE_URL=http://localhost:5000
```

```bash
npm run dev     # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:3000
```

The frontend proxies all `/api` requests to the backend automatically — no extra configuration needed.

---

## Validation Rules

**Register**
- `username`: 3–20 chars, letters / numbers / `_` / `-`
- `email`: valid email address
- `password`: min 8 chars, must include uppercase, lowercase, and a number

**Create / Update Link**
- `url`: valid URL
- `alias`: 3–30 chars, letters / numbers / `_` / `-`

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `username` | String | Unique, 3–20 chars |
| `email` | String | Unique |
| `password` | String | Bcrypt hashed |

### Link
| Field | Type | Notes |
|-------|------|-------|
| `owner` | ObjectId | Ref → User |
| `alias` | String | Unique per user |
| `slug` | String | `username/alias`, globally unique |
| `originalUrl` | String | The long URL |
| `clicks` | Number | Incremented on each redirect |
| `maxClicks` | Number | Default 10 |
| `expiresAt` | Date | Set at creation |
| `active` | Boolean | False = soft-deleted |
| `visits` | Array | `{ timestamp, ip, userAgent }` per click |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod |
| Security | Helmet, express-rate-limit |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Charts | Recharts |

---

## Scripts

```bash
# Backend
npm run dev      # nodemon (hot reload)
npm start        # production

# Frontend
npm run dev      # Vite dev server
npm run build    # production bundle
npm run preview  # preview production build
```

---

## Author

**Amitabh Panda** — [GitHub](https://github.com/Amitabh-Ozymandias)
