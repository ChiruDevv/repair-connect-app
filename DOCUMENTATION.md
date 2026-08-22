# RepairConnect - Build Documentation

## How We Built RepairConnect

This document describes the step-by-step process of building RepairConnect, from initial setup to production deployment.

---

## 1. Project Initialization

**Starting point:** A blank folder with no code.

### Step 1: Scaffold the project
- Created a Next.js 15 project with TypeScript and Tailwind CSS using `npx create-next-app`
- Configured App Router (not Pages Router) for modern routing
- Set up project structure with `src/` directory

### Step 2: Set up the tech stack
- Installed MongoDB driver + Mongoose for database
- Installed NextAuth.js v5 for authentication
- Installed bcryptjs for password hashing
- Installed OpenAI SDK for AI integration
- Installed Cloudinary SDK for image uploads
- Installed Lucide React + React Icons for UI icons

### Step 3: Configure environment variables
- Created `.env.local` for local development secrets
- Created `.env.example` with placeholder names (no real values)
- Added `.env.local` to `.gitignore` to prevent secret leaks
- Set up 8 environment variables: MongoDB URI, NextAuth secret, OpenAI key, Cloudinary credentials

---

## 2. Database Design

### Step 4: Design the data models
Three Mongoose models were created based on the app's needs:

**User Model** - Stores user accounts
- Fields: name, email (unique), password (hashed, hidden from queries), badges, CO2 saved
- Password field has `select: false` so it's never returned in API responses by default

**RepairRequest Model** - The core data model
- Stores the uploaded image URL, user description, category
- Contains nested objects for: AI diagnosis results, environmental impact, DIY guide, spare parts list, repair options
- Status field tracks progress: pending -> diagnosed -> in_repair -> completed -> abandoned
- Uses MongoDB enums for category and status to enforce valid values

**ServiceProvider Model** - Pre-seeded repair shop data
- Fields: name, category, address, city, state, lat/lng coordinates, phone, rating, specialties
- Includes a reviews sub-schema for future use

### Step 5: Set up MongoDB connection
- Created a connection utility (`lib/mongodb.ts`) with singleton pattern
- Uses `global.mongooseCache` to prevent multiple connections during hot-reload in development
- Reads `MONGODB_URI` from environment variables
- Configured with `bufferCommands: false` for serverless compatibility

---

## 3. Authentication System

### Step 6: Configure NextAuth.js
- Used NextAuth v5 with Credentials provider (email + password login)
- Configured JWT strategy (session stored as token in cookie, not in database)
- Set session maxAge to 30 days
- Custom JWT callback stores user ID in the token
- Custom session callback exposes user ID to frontend
- Custom pages: login at `/auth/login`, logout redirects to login page

### Step 7: Build registration system
- Created `POST /api/auth/register` endpoint
- Validates required fields (name, email, password)
- Enforces minimum password length of 6 characters
- Checks for existing email before creating
- Hashes password with bcryptjs (12 salt rounds)
- Returns user object (without password) on success

### Step 8: Build login/signup pages
- Registration page: name, email, password fields with form validation
- Login page: email and password fields
- Both pages redirect to dashboard on success
- Styled with consistent design system (forest green branding)

---

## 4. File Upload System

### Step 9: Set up Cloudinary
- Configured Cloudinary SDK with cloud name, API key, and API secret from environment variables
- Set upload folder to "repairconnect" for organization

### Step 10: Build upload endpoint
- Created `POST /api/upload` that accepts FormData with a file field
- Added file type validation (only image/* and video/* allowed)
- Added 5MB file size limit to prevent abuse
- Uses `upload_stream` instead of base64 encoding (works within Vercel's serverless body limits)
- Returns the Cloudinary URL and public ID after successful upload

### Step 11: Build drag-and-drop upload component
- Created reusable `FileUpload` component with:
  - Drag-and-drop zone with visual feedback
  - Click-to-browse file picker
  - Image preview after selection
  - Upload spinner during Cloudinary upload
  - Clear button on hover to remove selected image
  - Hidden file input with `accept="image/*"` for client-side filtering
---

## 5. AI Integration (Core Feature)

### Step 12: Set up OpenAI client
- Configured OpenAI SDK to point at Memcode gateway (`https://api.memcode.in/v1`) instead of OpenAI directly
- Used model `gpt-5.6-luna` (cheapest available) to stay within $10 budget
- API key stored in environment variable, never exposed to frontend

### Step 13: Design the AI prompt
This was the most critical part. The system prompt instructs the AI to return a specific JSON structure:

```
System: "You are a repair expert. Return only valid JSON with:
  - problem (description of the issue)
  - severity (Low/Medium/High/Critical)
  - repairScore (1-100, how feasible is repair)
  - worthRepairing (boolean)
  - estimatedRepairCost (number in INR)
  - estimatedReplaceCost (number in INR)
  - impact (co2Saved, waterSaved, wastePrevented)
  - diyGuide (difficulty, estimatedTime, tools[], steps[], safetyNotes)
  - spareParts[] (name, estimatedCost, availableAt, link)
  - repairOptions[] (option, estimatedCost, timeEstimate, pros, cons)"
```

The user message is: `"Category: {category} | Issue: {description}"`

### Step 14: Handle AI response parsing
- AI sometimes returns markdown code fences around JSON - strip them with regex
- AI sometimes returns costs as strings like "300-2000 INR" instead of numbers
- Created `parseCost()` helper that extracts the first number from any format
- Created `normalizeCosts()` that walks the entire response object and converts cost fields to numbers
- Increased `max_tokens` from 1200 to 2500 to prevent response truncation (was cutting off spareParts and repairOptions)

### Step 15: Save diagnosis to MongoDB
- Created `POST /api/requests` endpoint that:
  1. Validates authentication (requires logged-in user)
  2. Accepts imageUrl, description, category
  3. Sends request to AI
  4. Parses and normalizes the response
  5. Saves complete RepairRequest document to MongoDB
  6. Returns the saved document with status 201

---

## 6. Repair Request Management

### Step 16: Build CRUD API routes
- **GET /api/requests** - Lists all requests for the logged-in user, sorted by newest first
- **POST /api/requests** - Creates new request with AI diagnosis (described above)
- **GET /api/requests/[id]** - Gets full details of a single request (with auth check)
- **PATCH /api/requests/[id]** - Updates status only (whitelist: only `status` field allowed, prevents mass assignment)
- **DELETE /api/requests/[id]** - Permanently deletes a request (used by "Repaired" button on dashboard)

### Step 17: Build request detail page
Created a tabbed interface with 5 tabs:
1. **Diagnosis** - Repair score visualization (SVG circle), severity badge, cost comparison (repair vs replace)
2. **Spare Parts** - List of parts with name, cost, where to buy, and "Search online" link to Amazon/Flipkart
3. **Impact** - Environmental savings (CO2, water, waste) with visual icons
4. **Fix It** - Step-by-step DIY guide with numbered steps, tools needed, estimated time, difficulty level, safety notes
5. **Status** - Current status display + clickable buttons to update: Diagnosed -> In Repair -> Repaired -> Abandoned

### Step 18: Build new request page
- 3-step progress indicator (Upload -> Describe -> Analyze)
- FileUpload component for drag-and-drop image selection
- Text area for problem description with helpful placeholder
- Category selector with clickable pills (electronics, furniture, bicycle, appliance, other)
- "Analyze" button that uploads image then creates request
- Loading animation during AI processing
- Redirects to request detail page on success

---

## 7. Services & Location System

### Step 19: Design the services data
- Created 20 repair shops across 6 Indian cities (Bangalore, Delhi, Mumbai, Chennai, Kolkata, Noida)
- Each shop has: name, category, address, city, state, lat/lng coordinates, phone, rating, specialties, price range
- Data is duplicated in both the auto-seed (services API) and the seed endpoint for redundancy

### Step 20: Build location-based discovery
- Created `GET /api/services` endpoint that accepts optional `lat` and `lng` query params
- Implemented Haversine formula to calculate distance between user location and each shop
- Sorts results by: same city first (< 50km), then by distance
- Auto-seeds the database if collection is empty (for fresh Vercel deployments)

### Step 21: Build services page
- Auto-requests browser geolocation on page load
- Shows "Detecting your location..." while waiting for permission
- Falls back to showing all shops if location is denied
- Category filter pills (All, Electronics, Furniture, Bicycle, Appliance, Other)
- User's repair items shown as clickable pills to filter shops by that item's category
- Shop cards show: name, rating (stars), address, distance, specialties, price range, phone number
- "Call" button for each shop

### Step 22: Build shop comparison feature
- "Compare" button enters comparison mode
- Checkboxes appear on each shop card
- Select 2+ shops to see a side-by-side comparison table
- Table shows: shop name, rating, price range, specialties, distance, phone
- Sort by rating or price using dropdown

---

## 8. Dashboard & Stats

### Step 23: Build the dashboard
- Stats grid showing: total repairs, CO2 saved, water saved, money saved
- Earned badges section (First Fix, DIY Master, Eco Warrior, Carbon Cutter, Money Saver)
- List of all repair requests with: image thumbnail, description, category, repair score, CO2 saved, status badge
- "Repaired" button on each card that deletes the request from the database
- Empty state with illustration when no requests exist

### Step 24: Build impact stats API
- Created `GET /api/impact/stats` that aggregates all user's requests
- Calculates: total items, total CO2, total water, total waste, total money saved
- Computes earned badges based on thresholds (e.g., 5+ items = DIY Master)
---

## 9. Landing Page & UI Design

### Step 25: Design the landing page
- Hero section with strong headline: "Your stuff is broken. Don't trash it - fix it."
- "AI-Powered Repair Intelligence" badge with social proof strip
- "How it works" section with 3-step visual flow (Upload -> Analyze -> Fix)
- Features grid: AI Diagnosis, Repair vs Replace, DIY Guide, Environmental Impact
- Impact stats section: CO2 saved, waste prevented, items repaired
- Call-to-action section with signup prompt
- Minimal footer with tech stack mention

### Step 26: Build the design system
Created consistent design tokens in `globals.css`:
- Brand color: dark forest green (#123f35) representing repair/sustainability
- Warm off-white background (#f7f7f3) for premium feel
- Subtle greenish radial gradient on landing page
- Custom `.forest-button` class for consistent button styling
- Custom `.paper-card` class for frosted glass card effect
- Inter font from Google Fonts for clean typography
- Consistent border radius, shadows, and spacing

### Step 27: Make it responsive
- All pages tested on desktop, laptop, tablet, and mobile viewports
- Navigation collapses on mobile
- Grid layouts adapt from 4 columns to 2 to 1
- Touch-friendly buttons and inputs on mobile
- File upload works on mobile (camera/gallery access)

---

## 10. Security Hardening

### Step 28: Audit and fix vulnerabilities
Before deployment, performed a full security audit:

**Fixed: Mass assignment on PATCH route**
- Problem: The PATCH endpoint accepted the full request body and passed it directly to MongoDB's `findByIdAndUpdate`
- Risk: Any authenticated user could overwrite `user`, `diagnosis`, `impact` fields by sending them in the request
- Fix: Whitelist only the `status` field - all other fields are ignored

**Fixed: GET fallback loading all documents**
- Problem: If `findById` failed (invalid ID), the fallback ran `RepairRequest.find({})` loading every document in the database into memory
- Risk: On large datasets this could crash the serverless function (OOM)
- Fix: Removed the fallback entirely - invalid IDs simply return 404

**Fixed: No upload validation**
- Problem: The upload endpoint had no file type or size validation on the server
- Risk: Users could upload malicious files or huge files to crash the server
- Fix: Added server-side MIME type check (image/video only) and 5MB size limit

**Verified: No secrets in source code**
- Searched all source files for API keys, passwords, tokens - none found
- `.env.local` confirmed not tracked by git
- All secrets only exist in environment variables

**Verified: Auth on all protected routes**
- All API routes requiring user data have `auth()` check
- Unauthenticated requests return 401 Unauthorized

---

## 11. Deployment to Vercel

### Step 29: Set up Vercel project
- Connected GitHub repository `repair-connect-app` to Vercel
- Vercel auto-detected Next.js and configured build settings
- Production URL: repair-connect.vercel.app

### Step 30: Configure environment variables
Added 8 environment variables in Vercel dashboard:
- MONGODB_URI (MongoDB Atlas connection string)
- NEXTAUTH_SECRET (JWT encryption key)
- NEXTAUTH_URL (production domain)
- OPENAI_API_KEY (Memcode gateway key)
- OPENAI_BASE_URL (https://api.memcode.in/v1)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

### Step 31: Set up MongoDB Atlas
- Created free shared cluster on MongoDB Atlas (Mumbai region)
- Created database user with read/write permissions
- Whitelisted all IPs (0.0.0.0/0) for Vercel serverless access
- Got connection string and added to Vercel environment variables

### Step 32: Deploy and verify
- Pushed to GitHub -> Vercel auto-deploys
- Verified all routes work: landing page, auth, dashboard, new request, request detail, services
- Verified AI diagnosis works end-to-end
- Verified file upload to Cloudinary works
- Verified location-based services work
- Re-seeded repair shops database after fresh deployment

---

## 12. Challenges Faced & Solutions

### Challenge 1: Vercel upload stuck forever
**Problem:** Image upload worked locally but hung forever on Vercel.
**Cause:** Initial implementation used base64 encoding which exceeded Vercel's serverless body size limit.
**Solution:** Switched to `upload_stream` which streams the file directly to Cloudinary without buffering the entire file in memory.

### Challenge 2: AI response truncated
**Problem:** Spare parts and repair options were always empty.
**Cause:** `max_tokens: 1200` was too low - the AI ran out of tokens before finishing the JSON response.
**Solution:** Increased to `max_tokens: 2500` so the AI has room for the complete response.

### Challenge 3: AI returning inconsistent cost formats
**Problem:** Mongoose validation error when saving costs like "300-2000 INR".
**Cause:** The AI sometimes returns costs as strings instead of numbers.
**Solution:** Created a `parseCost()` helper that extracts the first number from any format before saving to MongoDB.

### Challenge 4: Vercel not deploying after repo rename
**Problem:** After renaming the GitHub repo, Vercel stopped auto-deploying on push.
**Cause:** The webhook URL was still pointing to the old repo name internally.
**Solution:** Disconnected and reconnected the Git repository in Vercel settings, plus manual redeploy.

### Challenge 5: Logout showing default NextAuth page
**Problem:** After logout, users saw a generic "YourApp - An app to CRUD" page instead of the login page.
**Cause:** `NEXTAUTH_URL` was not set in Vercel environment variables.
**Solution:** Added `NEXTAUTH_URL` pointing to the production domain, and configured custom `signOut` page in NextAuth config.

### Challenge 6: Dashboard showing NaN
**Problem:** Stats card showed "NaN" for total repairs.
**Cause:** API returned `totalItems` but dashboard was reading `totalRequests` (field name mismatch).
**Solution:** Updated dashboard to read `totalItems` to match the API response.

---

## 13. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19, TypeScript | UI framework |
| Styling | Tailwind CSS 4 | Design system |
| Database | MongoDB Atlas + Mongoose | Data storage |
| Auth | NextAuth.js v5 + bcryptjs | User authentication |
| AI | OpenAI API via Memcode | Repair diagnosis |
| Images | Cloudinary | File hosting |
| Icons | Lucide React + React Icons | UI icons |
| Deployment | Vercel | Production hosting |
| Version Control | Git + GitHub | Code management |

---

*Build documentation last updated: August 2026*
*Repository: https://github.com/ChiruDevv/repair-connect-app*
