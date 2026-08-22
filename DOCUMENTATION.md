# RepairConnect - Project Documentation

## 1. Problem Statement

Every year, millions of functional items end up in landfills simply because owners don't know how to fix them or where to find affordable repair services. The gap between broken and repairable is often just a diagnosis - knowing what's wrong, what it costs, and who can fix it.

**RepairConnect** bridges that gap using AI. Upload a photo of any broken item - electronics, furniture, bicycles, appliances - and get instant, actionable repair intelligence.

---

## 2. Solution Overview

RepairConnect is an AI-powered web platform that helps users:

1. **Diagnose** broken items using image analysis and natural language
2. **Compare** repair vs. replacement costs in Indian Rupees (INR)
3. **Find** nearby repair professionals filtered by location and category
4. **Track** repair progress from diagnosis to completion
5. **Understand** environmental impact (CO2 saved, waste prevented)

### Core Differentiator

Unlike generic repair directories, RepairConnect provides a **complete repair decision framework** - whether to fix it, what it costs, spare parts needed, and a step-by-step DIY guide.

---

## 3. User Flow

1. **Landing Page** - Value proposition and calls to action
2. **Sign Up / Login** - Email + password (NextAuth + bcrypt)
3. **New Request** - Upload photo, describe problem, select category
4. **AI Diagnosis** - Backend sends to OpenAI API, returns structured diagnosis
5. **Results Page** - 5 tabs: Diagnosis, Spare Parts, Impact, Fix It, Status
6. **Dashboard** - Track requests, view stats, earn badges
7. **Services** - Find nearby shops filtered by items, compare side-by-side
8. **Repair Tracking** - Diagnosed -> In Repair -> Repaired

---

## 4. Architecture

- **Frontend:** React 19 + TypeScript + Tailwind CSS (Next.js 15 App Router)
- **Backend:** Next.js API Routes (serverless on Vercel)
- **Database:** MongoDB Atlas + Mongoose ODM
- **AI:** OpenAI API via Memcode Gateway
- **File Storage:** Cloudinary (cloud image hosting)
- **Auth:** NextAuth.js v5 with JWT strategy

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 15 | Full-stack, serverless API routes, Vercel optimized |
| Database | MongoDB | Flexible schema for AI responses |
| Auth | NextAuth v5 JWT | No session DB, works in serverless |
| AI | OpenAI via Memcode | $10 free credits, compatible API |
| Images | Cloudinary | Free tier, CDN, serverless compatible |
| Deployment | Vercel | Auto-deploy, free tier |
---

## 5. Database Schema

### User Model
- name - String, required
- email - String, required, unique, lowercase
- password - String, bcrypt-hashed, select: false
- image - String, optional
- badges - Array of strings
- totalCO2Saved - Number
- timestamps - Automatic

### RepairRequest Model
- user - ObjectId (required)
- imageUrl - Cloudinary URL (required)
- description - String (required)
- category - Enum: electronics, furniture, bicycle, appliance, other
- diagnosis - { problem, severity, repairScore, worthRepairing, estimatedRepairCost, estimatedReplaceCost }
- impact - { co2Saved, waterSaved, wastePrevented }
- diyGuide - { difficulty, estimatedTime, tools[], steps[], safetyNotes }
- spareParts - [{ name, estimatedCost, availableAt, link }]
- repairOptions - [{ option, estimatedCost, timeEstimate, pros, cons }]
- status - Enum: pending, diagnosed, in_repair, completed, abandoned

### ServiceProvider Model
- name, category, address, city, state
- location - { lat, lng }
- phone, rating, specialties[], priceRange
- reviews - [{ user, rating, comment }]

---

## 6. API Documentation

All protected routes require NextAuth JWT session cookie.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Create account | No |
| POST | /api/upload | Upload image to Cloudinary | Yes |
| POST | /api/requests | Create request + AI diagnosis | Yes |
| GET | /api/requests | List user requests | Yes |
| GET | /api/requests/[id] | Get request details | Yes |
| PATCH | /api/requests/[id] | Update status only | Yes |
| DELETE | /api/requests/[id] | Delete request | Yes |
| GET | /api/services | Get shops (?category&lat&lng) | No |
| GET | /api/impact/stats | Environmental impact stats | Yes |
---

## 7. AI Integration

1. User submits: image URL + text description + category
2. Backend constructs detailed prompt for structured JSON response
3. AI (GPT via Memcode) returns diagnosis data
4. Backend parses JSON and normalizes cost fields (parseCost helper)
5. Data saved to MongoDB and returned to frontend

The AI returns: problem description, severity, repair score (1-100), cost estimates, DIY guide with steps/tools, spare parts with buy links, repair options comparison, and environmental impact.

---

## 8. Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcryptjs, 12 salt rounds |
| Sessions | JWT strategy (serverless-friendly) |
| API auth | NextAuth.js on all protected routes |
| PATCH whitelist | Only status field can be updated |
| Upload validation | image/video only, 5MB limit |
| Secrets | Environment variables only, never in code |
| Git safety | .env.local in .gitignore |

---

## 9. Deployment

**Platform:** Vercel (repair-connect.vercel.app)
**Trigger:** Push to master branch
**Database:** MongoDB Atlas (cloud)

### Environment Variables
- MONGODB_URI - MongoDB Atlas connection string
- NEXTAUTH_SECRET - JWT encryption key
- NEXTAUTH_URL - https://repair-connect.vercel.app
- OPENAI_API_KEY - Memcode gateway key
- OPENAI_BASE_URL - https://api.memcode.in/v1
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

Auto-seeds 20 repair shops on first deployment (Bangalore 8, Delhi 4, Mumbai 4, Chennai 2, Kolkata 1, Noida 1).

---

## 10. Project Structure

```
src/
  app/
    api/auth/ - Registration + NextAuth
    api/upload/ - Cloudinary image upload
    api/requests/ - CRUD for repair requests
    api/services/ - Location-based shop discovery
    api/impact/ - Environmental stats
    api/seed/ - Database seeding
    auth/ - Login + Register pages
    dashboard/ - User dashboard
    new-request/ - Create repair request
    request/[id]/ - Request detail (5 tabs)
    services/ - Nearby repair shops
  components/ - Reusable UI components
  lib/ - MongoDB, Auth, OpenAI, Cloudinary configs
  models/ - User, RepairRequest, ServiceProvider schemas
```

---

## 11. Limitations and Future Work

**Current:** AI accuracy depends on image quality. Shops are pre-seeded. Prices are estimates. No payment integration.

**Future:** OAuth login, real shop APIs, price tracking, community reviews, mobile app, multi-language, spare parts marketplace.

---

*Documentation last updated: August 2026*
*Repository: https://github.com/ChiruDevv/repair-connect-app*
