# RepairConnect

AI-powered repair intelligence platform. Upload a photo of a broken item, get instant AI diagnosis, repair vs. replacement cost comparison, nearby repair shops, spare parts, and a step-by-step DIY guide — all in one place.

**Live Demo:** [repair-connect-alpha.vercel.app](https://repair-connect-alpha.vercel.app)

## Tech Stack

| Category           | Technology                     | Version |
| ------------------ | ------------------------------ | ------- |
| **Framework**      | Next.js (App Router)           | 15.x    |
| **UI Library**     | React                          | 19.x    |
| **Language**       | TypeScript                     | 5.x     |
| **Styling**        | Tailwind CSS                   | 4.x     |
| **Database**       | MongoDB (Atlas / Local)        | 6.x     |
| **ODM**            | Mongoose                       | 8.x     |
| **Authentication** | NextAuth.js v5 (Credentials)   | 5.x     |
| **AI**             | OpenAI API (GPT via Memcode)   | 7.x     |
| **Image Hosting**  | Cloudinary                     | 2.x     |
| **Icons**          | Lucide React + React Icons     | 5.x     |
| **Password Hash**  | bcryptjs                       | 3.x     |
| **Linting**        | ESLint + eslint-config-next    | 9.x     |
| **Build Tool**     | PostCSS                        | 8.x     |
| **Runtime**        | Node.js                        | 18+     |
| **Deployment**     | Vercel                         | —       |

## Features

- **AI Diagnosis** — Upload an image + describe the problem, get an instant AI-powered diagnosis with severity, repair score (1–100), and cost estimates
- **Repair vs. Replacement** — Side-by-side cost comparison with source transparency
- **DIY Repair Guide** — Step-by-step instructions with difficulty level, estimated time, and required tools
- **Spare Parts** — AI-suggested parts with costs and links to buy on Amazon/Flipkart
- **Repair Options** — Compare DIY, local shop, and authorized service center
- **Nearby Repair Shops** — Location-based service provider discovery with ratings, specialties, and distance
- **Shop Comparison** — Select multiple shops and compare them side-by-side
- **Repair Tracking** — Track status from Diagnosed → In Repair → Repaired
- **Environmental Impact** — CO₂ saved, water conserved, and waste diverted per repair
- **User Dashboard** — View all repair requests, stats, earned badges, and sustainability impact
- **Authentication** — Secure sign-up/login with NextAuth.js and bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier)
- OpenAI API key or Memcode gateway key

### Setup

```bash
git clone https://github.com/ChiruDevv/repair-connect-app.git
cd mern-next-app
npm install
```

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/mern-next-app
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-or-memcode-key
OPENAI_BASE_URL=https://api.memcode.in/v1
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

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
│   │   ├── auth/
│   │   │   ├── register/route.ts        # POST - Create account
│   │   │   └── [...nextauth]/route.ts   # NextAuth handler
│   │   ├── upload/route.ts              # POST - Upload image to Cloudinary
│   │   ├── requests/
│   │   │   ├── route.ts                 # GET/POST - List & create repair requests
│   │   │   └── [id]/route.ts            # GET/DELETE/PATCH - Single request
│   │   ├── services/route.ts            # GET - Nearby repair shops
│   │   ├── impact/stats/route.ts        # GET - Environmental impact stats
│   │   └── seed/route.ts               # POST - Seed repair shop data
│   ├── auth/
│   │   ├── login/page.tsx               # Login page
│   │   └── register/page.tsx            # Registration page
│   ├── dashboard/page.tsx               # User dashboard
│   ├── new-request/page.tsx             # Create repair request
│   ├── request/[id]/page.tsx            # Request detail + AI results
│   ├── services/page.tsx                # Nearby repair shops
│   ├── page.tsx                         # Landing page
│   ├── layout.tsx                       # Root layout
│   ├── providers.tsx                    # Session provider
│   └── globals.css                      # Global styles
├── components/
│   └── FileUpload.tsx                   # Drag-and-drop image upload
├── lib/
│   ├── mongodb.ts                       # MongoDB connection singleton
│   ├── auth.ts                          # NextAuth config
│   ├── openai.ts                        # OpenAI client
│   └── cloudinary.ts                    # Cloudinary config
└── models/
    ├── User.ts                          # User model
    ├── RepairRequest.ts                 # Repair request model
    └── ServiceProvider.ts               # Repair shop model
```

## API Routes

| Method   | Endpoint                  | Description                          | Auth? |
| -------- | ------------------------- | ------------------------------------ | ----- |
| `POST`   | `/api/auth/register`       | Create a new account                 | No    |
| `POST`   | `/api/auth/callback/...`   | NextAuth login/logout/session        | No    |
| `POST`   | `/api/upload`              | Upload image to Cloudinary           | Yes   |
| `GET`    | `/api/requests`            | List user's repair requests          | Yes   |
| `POST`   | `/api/requests`            | Create request + run AI diagnosis    | Yes   |
| `GET`    | `/api/requests/[id]`       | Get full request details             | Yes   |
| `DELETE` | `/api/requests/[id]`       | Delete a request                     | Yes   |
| `PATCH`  | `/api/requests/[id]`       | Update request status                | Yes   |
| `GET`    | `/api/services`            | Get repair shops (supports location) | No    |
| `GET`    | `/api/impact/stats`        | Get environmental impact stats       | Yes   |
| `POST`   | `/api/seed`                | Seed database with repair shops      | No    |

## Environment Variables

| Variable            | Description                              | Where to get it                     |
| ------------------- | ---------------------------------------- | ------------------------------------ |
| `MONGODB_URI`       | MongoDB connection string                | [MongoDB Atlas](https://mongodb.com/atlas) |
| `NEXTAUTH_SECRET`   | Random string for JWT encryption         | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL`      | Your deployed URL                        | Your Vercel domain                   |
| `OPENAI_API_KEY`    | OpenAI or Memcode gateway key            | [Memcode](https://memcode.in)        |
| `OPENAI_BASE_URL`   | OpenAI-compatible API base URL           | `https://api.memcode.in/v1`          |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name               | [Cloudinary](https://cloudinary.com) |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                  | [Cloudinary](https://cloudinary.com) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                | [Cloudinary](https://cloudinary.com) |

## Deployment

This project is deployed on [Vercel](https://vercel.com). Push to `main` triggers automatic deployment.

1. Import repository on Vercel
2. Add environment variables in Settings
3. Redeploy after adding variables
4. Seed shops: `POST /api/seed`
