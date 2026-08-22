# MERN + Next.js

Full stack application using MongoDB, Next.js (App Router), and TypeScript.

## Tech Stack

| Category       | Technology               | Version  |
| -------------- | ------------------------ | -------- |
| Framework      | Next.js (App Router)     | 15.x     |
| UI Library     | React                    | 19.x     |
| Language       | TypeScript               | 5.x      |
| Styling        | Tailwind CSS             | 4.x      |
| Database       | MongoDB                  | —        |
| ODM            | Mongoose                 | 8.x      |
| Linting        | ESLint + eslint-config-next | 9.x   |
| Build Tool     | PostCSS                  | 8.x      |
| Runtime        | Node.js                  | 18+      |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
npm install
```

Copy and configure environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your MongoDB connection string.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts      # GET /api/health
│   │   └── users/
│   │       ├── route.ts          # GET, POST /api/users
│   │       └── [id]/route.ts     # GET, PUT, DELETE /api/users/:id
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   └── mongodb.ts                # MongoDB connection singleton
└── models/
    └── User.ts                   # Sample Mongoose model
```

## API Routes

| Method   | Endpoint          | Description      |
| -------- | ----------------- | ---------------- |
| `GET`    | `/api/health`     | Health check     |
| `GET`    | `/api/users`      | List all users   |
| `POST`   | `/api/users`      | Create a user    |
| `GET`    | `/api/users/:id`  | Get a user       |
| `PUT`    | `/api/users/:id`  | Update a user    |
| `DELETE` | `/api/users/:id`  | Delete a user    |
