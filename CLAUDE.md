@AGENTS.md

# Pashu Rakshak (Jeev Rakshak) — Project Progress & Work Log

**Project Overview:** SIH Problem Statement **SIH26128** (Government of Maharashtra). AI-powered real-time animal health surveillance, epidemiological outbreak detection, and veterinary triage platform for farmers, veterinarians, and disease control officers.

---

## 🔑 Demo Credentials & Local Setup
- **Local Dev Server:** `http://localhost:3000` (Next.js 16 + Turbopack)
- **Database:** SQLite (`prisma/dev.db`)
- **Password for all seeded accounts:** `password123`
- **Seeded Maharashtra Personas (`prisma/seed.ts`):**
  - **State Officer (All Maharashtra):** `state.officer@jeevraksha.in` (Dr. Anil Deshmukh)
  - **District Officer (Pune):** `pune.officer@jeevraksha.in` (Dr. Sunita Patil)
  - **Taluka Officer (Haveli, Pune):** `haveli.officer@jeevraksha.in` (Dr. Vijay Kadam)
  - **Veterinarian (Haveli, Pune):** `vet@jeevraksha.in` (Dr. Priya Sharma)
  - **System Admin:** `admin@jeevraksha.in` (System Administrator)
  - **Farmer:** `farmer@jeevraksha.in` (Tukaram Shinde, Wagholi)

---

## 🛠️ Work Done Till Now

### 1. SIH26128 Admin Portal — Step 1: Auth, Roles & Server-Side Jurisdiction
- **Prisma Schema (`prisma/schema.prisma`):**
  - Added user approval statuses: `status` (`APPROVED`, `PENDING`, `SUSPENDED`, `REJECTED`).
  - Added official veterinary credential fields: `registrationNo`.
  - Added geographic jurisdictional boundaries: `jurisdictionLevel` (`STATE`, `DISTRICT`, `TALUKA`, `VILLAGE`), `jurisdictionState`, `jurisdictionDistrict`, `jurisdictionTaluka`, `jurisdictionVillage`.
- **Server-Side Jurisdiction Engine (`src/lib/jurisdiction.ts`):**
  - `buildHealthReportJurisdictionFilter()` and `buildCaseJurisdictionFilter()` enforce hard query filters on the server:
    - `DISTRICT_OFFICER` cannot query or view data outside their assigned district (e.g. locked to Pune).
    - `TALUKA_OFFICER` cannot query or view data outside their assigned taluka (e.g. locked to Haveli, Pune).
    - `STATE_OFFICER` / `ADMIN` has state-wide visibility across all Maharashtra districts.
  - `canOfficerActOnLocation()` checks whether an officer has jurisdiction to confirm outbreaks or issue alerts for a given village.
- **Server-Enforced Overview API (`src/app/api/overview/route.ts`):**
  - Enforces server-side jurisdiction filters on metrics, high-risk hotspots, and live report feeds based on logged-in session or requested geographic query parameters.
- **Role-Aware Auth & 1-Click Login (`src/app/login/page.tsx` & `src/app/api/auth/login/route.ts`):**
  - Added 1-click persona fill buttons for State Officer, District Officer, Taluka Officer, Veterinarian, Admin, and Farmer.
  - Rejects suspended or rejected accounts on the server.

---

### 2. Role-Based Navigation & UI Boundary Scoping
- **Doctor Portal Isolation (`src/app/dashboard/layout.tsx`):**
  - When logged in as a `VETERINARIAN`, the sidebar and views strictly display only **Operations & Triage** (`/dashboard/cases`, `/dashboard/alerts`, `/dashboard/lab`).
  - Command Centre and Farmer tools are hidden for veterinarians.
- **Admin Dashboard Cleanup (`src/app/dashboard/page.tsx`):**
  - Removed "Manage Cases" and "Alerts" buttons from the admin dashboard header to keep operational triage exclusive to veterinary roles, focusing the admin view on surveillance telemetry and outbreak heatmaps.
- **Strict Route Guards for Farmer Tools:**
  - `/farmer/ivr` and `/farmer/photo-detect` now strictly require authentication before opening, automatically redirecting unauthenticated visitors to `/login?redirect=...`.
  - Landing page buttons route unauthenticated farmers directly through the login flow.

---

### 3. Voice Form Assistant in Disease Reporting Wizard
- **Files:** `src/app/farmer/report/page.tsx`, `src/app/api/draft-report/route.ts`
- **Key Capabilities:**
  - **Hands-Free Multilingual Intake:** Farmers can speak naturally in **हिन्दी (Hindi)**, **मराठी (Marathi)**, or **English**.
  - **Intelligent Indic Natural Language Engine (`/api/draft-report`):**
    - High-accuracy regex and keyword parser with Sarvam 105B AI integration and reliable offline fallback.
    - Extracts animal species (गाय/Cow, म्हैस/Buffalo, शेळी/Goat, etc.), symptoms (बुखार, लाळ/लार, जखम/छाले, लंगडत/लंगड़ाना), severity, affected counts, deaths, duration (days), temperature, and village names (Wagholi, Uruli Kanchan, Shirwal, etc.).
  - **Quick Demo Simulation Pills:** 1-tap test buttons for testing speech intake without a physical microphone.
  - **One-Tap Form Auto-Fill & Review:** Automatically populates all form steps and advances to Step 4 (Review) with spoken voice confirmation (*"फॉर्म भर दिया गया है! कृपया जांचें और पुष्टि करें।"*).
  - **Clean UI:** Removed old clunky draft banners; excluded floating `ChatFAB` from the report page to ensure the bottom-right corner remains completely unobstructed.

---

### 4. AI Photo Detection & Wound Triage
- **Route:** `/farmer/photo-detect` (`src/app/farmer/photo-detect/page.tsx`)
- **Key Capabilities:**
  - Camera capture and photo upload for livestock injuries/wounds.
  - Instant demo photo button for testing without local images.
  - 2-second AI laser scanning animation with clinical observations in Hindi and English.
  - Spoken Hindi audio guidance via speech synthesis.
  - Direct CTA to request a veterinarian with the attached photo.
- **Vet Portal Integration:** Cases with photos display a `📷 Photo Attached` badge and clinical summary card in `src/app/dashboard/cases/CasesList.tsx`.

---

### 5. Interactive IVR Telephony & In-App Simulator
- **Route:** `/farmer/ivr` (`src/app/farmer/ivr/page.tsx`)
- **Key Capabilities:**
  - Virtual 4G phone dialer simulating `1800-727-466` for farmers with basic 2G keypad phones.
  - Spoken Hindi voice guidance (*"नमस्ते! पशु रक्षक आपातकालीन हेल्पलाइन में आपका स्वागत है..."*).
  - DTMF keypad tones for multi-step disease triage (Animal selection → Symptom selection → Instant case creation).
  - Production TwiML XML webhook at `/api/ivr/webhook` compatible with Twilio and Exotel.

---

### 6. Species-Specific Endemic Outbreak Presets
- **File:** `src/app/farmer/report/page.tsx`
- Step 2 dynamically filters disease presets by selected animal:
  - **Cattle / Buffalo:** FMD (Foot-and-Mouth), LSD (Lumpy Skin), HS (Haemorrhagic Septicaemia), BQ (Black Quarter).
  - **Goat / Sheep:** PPR (Peste des Petits Ruminants), Enterotoxaemia, Goat Pox.
  - **Swine / Equine / Poultry:** ASF, Glanders, Avian Influenza, Ranikhet.

---

### 7. Pashu Rakshak Account Creation & Onboarding (SIGNUP_REQUIREMENTS.md)
- **Multi-Step Multilingual Signup (`src/app/register/page.tsx`):**
  - Interactive 6-step registration wizard supporting **मराठी (Marathi)**, **हिन्दी (Hindi)**, and **English**.
  - One question per screen with high-contrast accessibility tokens for low-literacy farmers.
  - Dedicated role selection: **Farmer (पशुपालक)** vs **Veterinary Doctor (पशु चिकित्सक)**.
  - Farmer flow captures: basic profile, village jurisdiction, livestock count summary (cattle, buffalo, goat, sheep, poultry), and DPDP 2023 digital consent.
  - Veterinarian flow captures: Veterinary Council registration number, state council name, clinic/dispensary address, and document certificate upload.
- **Backend Signup APIs:**
  - `POST /api/auth/otp/send`: Generates 6-digit cryptographic OTP with 30s cooldown and rate limiting.
  - `POST /api/auth/otp/verify`: Verifies phone OTP and returns login token or registration state.
  - `POST /api/auth/otp/voice`: Triggers voice telephony OTP fallback call.
  - `POST /api/signup/farmer`: Persists Farmer profile, animal summaries, and DPDP digital consent.
  - `POST /api/signup/vet`: Creates vet account with `PENDING_REVIEW` status awaiting government approval.
  - `POST /api/uploads/certificate`: Secure local/cloud certificate upload pipeline.
  - `GET & POST /api/invites/accept`: Invite-token onboarding engine for Government District & Taluka Officers.

---

### 8. Admin Verification Queue & Vet Approvals
- **Verification Portal (`src/app/dashboard/approvals/page.tsx`):**
  - Official queue for State and District Administrators to review newly registered veterinarians.
  - Displays Council registration number, council name, registration date, and uploaded certificate documents.
  - Provides 1-click **Approve License** and **Reject** dialogs with audit reasons.
- **Backend Admin Approval APIs:**
  - `GET /api/admin/users/pending`: Fetches unverified veterinarians filtered by officer jurisdiction.
  - `POST /api/admin/users/[id]/approve`: Sets status to `APPROVED`, sends SMS activation notice, and grants clinical access.
  - `POST /api/admin/users/[id]/reject`: Sets status to `REJECTED` with audit trail notes.

---

### 9. Strict Role-Based Portal Access Control (RBAC) & Boundary Isolation
- **Portal-Aware Login (`src/app/login/page.tsx`):**
  - Integrated 3-way portal switch: 🌾 **Farmer Portal**, 🩺 **Doctor Portal**, 🛡️ **Admin Command**.
  - **Cross-Role Login Rejection:**
    - Entering Admin credentials in Doctor Portal is blocked with an explicit error: *"Access Denied: This account has the role 'ADMIN'. Only licensed Veterinary Doctors can log into the Doctor Portal."*
    - Prevents Admins from seeing clinical Case Management.
    - Prevents non-officials from logging into Admin Command Center.
    - Prevents non-farmers from logging into Farmer Portal.
  - Dynamic role-tailored demo credentials quick-fill for each portal.
  - Safe destination resolver guaranteeing users can only be redirected to their role's authorized URLs.
- **Dashboard Layout Gatekeeper (`src/app/dashboard/layout.tsx`):**
  - **Doctor-Only Routes** (`/dashboard/cases`, `/dashboard/alerts`, `/dashboard/lab`):
    - Strictly blocks Administrators & Officers with an informative access roadblock and auto-redirects them to `/dashboard`.
    - Holds unverified veterinarians on a *"Registration Under Review"* holding card until approved.
  - **Admin-Only Routes** (`/dashboard`, `/dashboard/map`, `/dashboard/approvals`):
    - Strictly redirects veterinarians to `/dashboard/cases`.
  - **Farmer Lockout:**
    - Any farmer attempting to access `/dashboard/*` is blocked and redirected to `/farmer/report`.
- **Farmer Portal Root Layout (`src/app/farmer/layout.tsx`):**
  - Enforces authentication and farmer role on all `/farmer/*` sub-routes.
  - Displays informative role-mismatch cards with direct action buttons if accessed by logged-in Doctors or Admins.
- **Admin Dashboard Cleanup (`src/app/dashboard/page.tsx`):**
  - Replaced internal case links with administrative surveillance links (`/dashboard/map`, `/dashboard/approvals`).
- **Landing Page Navigation (`src/app/page.tsx`):**
  - Fixed portal card destinations and header buttons based on verified role (`isDoctor`, `isAdmin`, `isFarmer`).

---

### 10. Veterinary Appointments & 1962 Helpline Integration
- **Route:** `/appointments` (`src/app/appointments/page.tsx` & `/api/appointments/route.ts`)
- **Key Capabilities:**
  - 1-click booking for veterinary clinic visits and emergency farm calls.
  - Integrated 1962 Emergency Mobile Veterinary Unit (MVU) dispatch details.
  - Fast dispensary scheduling with appointment status tracking (`PENDING`, `CONFIRMED`, `COMPLETED`).

---

### 11. About Us Page Overhaul (`src/app/about/page.tsx`)
- **Uniform Team Member Cards:**
  - Redesigned all member cards with **identical box dimensions** (`h-full`, equalized description heights, uniform skills clusters).
  - Prominent **large portrait photos** (`h-72 sm:h-80`) with hover zoom, domain category badges, and initials fallbacks.
  - Unified all 6 multidisciplinary team members into a balanced 3×2 grid (Krishnakant Sharma, Raj Verma, Aman Sharma, Ojash Dwivedi, Ompal, Ritika).
  - Smart India Hackathon 2026 milestone banner and interactive domain filter tabs.

---

### 12. Local Network Access & HMR WebSocket Configuration
- **Network Host Binding (`package.json`):**
  - Configured `"dev": "next dev -H 0.0.0.0"` to listen on all interfaces for mobile testing over Wi-Fi.
- **HMR Dev Origins (`next.config.ts`):**
  - Added `allowedDevOrigins: ["192.168.29.160", "localhost", "127.0.0.1"]` to allow Next.js 16 Hot Module Replacement WebSockets without cross-origin handshake errors.

---

### 13. Vercel Serverless Deployment & Mobile OTP Authentication Fix
- **Root Cause Analysis:**
  - Vercel serverless functions mount the application bundle as a **read-only filesystem** (`SQLITE_READONLY` / `EROFS`). Any direct write (`INSERT`/`UPDATE`) to `prisma/dev.db` failed with status 500 (*"Failed to send OTP"*).
  - In production (`NODE_ENV === "production"`), mock SMS suppressed `debugOtp`, blocking OTP login on deployed URLs when third-party SMS gateway credentials (e.g. Twilio) were absent.
- **Architecture & Resilience Solution:**
  - **Stateless HMAC Challenge Tokens (`src/lib/otp-token.ts`):**
    - Issues cryptographic HMAC-SHA256 signed challenge tokens containing `{ phone, hashedCode, expiresAt }`.
    - Sent via both HTTP-Only cookie (`jeevraksha_otp_challenge`) and response JSON payload (`otpChallengeToken`).
    - Solves cross-lambda serverless routing where separate AWS Lambda containers verify requests without shared state.
  - **Resilient Multi-Tier OTP Store (`src/lib/otp-db.ts`):**
    - In-memory store on `globalThis` handles immediate zero-latency verification.
    - Database operations are wrapped in non-fatal `try/catch` blocks so DB read-only states never crash the OTP service.
  - **Writable `/tmp/dev.db` Migration on Vercel (`src/lib/prisma.ts`):**
    - Automatically detects Vercel serverless environment (`process.env.VERCEL`).
    - Copies seeded `prisma/dev.db` (and `-wal`/`-shm`) to writable `/tmp/dev.db` on cold-start and points Prisma datasources dynamically.
  - **Deploy-Ready Demo OTP (`src/lib/sms.ts`):**
    - When `SMS_PROVIDER="mock"` (or without active SMS gateway API keys), returns `debugOtp` so testers and evaluators can view and 1-click `[Fill]` the demo OTP on live Vercel deployments.
  - **Serverless Asset Tracing (`next.config.ts`):**
    - Configured `outputFileTracingIncludes: { "/api/**/*": ["./prisma/dev.db"] }` to ensure Next.js NFT bundles the SQLite database into Vercel Lambda functions.

---

## 📁 Key File Map

| Path | Description |
| :--- | :--- |
| `ADMIN_PORTAL_REQUIREMENTS.md` | Full SIH26128 functional requirements, data model & build order |
| `SIGNUP_REQUIREMENTS.md` | Pashu Rakshak user roles, onboarding flow, and approval criteria |
| `src/lib/jurisdiction.ts` | Server-side jurisdiction filter engine for State, District & Taluka officers |
| `src/lib/sms.ts` | Mock & production SMS / Voice OTP provider abstraction |
| `src/lib/otp-token.ts` | Stateless HMAC-SHA256 challenge token generation & verification |
| `src/lib/otp-db.ts` | Cryptographic OTP generation, rate limiting, and verification engine |
| `src/lib/prisma.ts` | Multi-environment Prisma client supporting Vercel /tmp SQLite replication |
| `src/app/api/auth/otp/` | Phone OTP send, verify, and voice call endpoints |
| `src/app/api/signup/` | Farmer 6-step registration and Veterinarian document submission endpoints |
| `src/app/api/admin/users/` | Admin pending review queries and vet license approval/rejection endpoints |
| `src/app/register/page.tsx` | Multilingual 6-step onboarding wizard for Farmers and Veterinarians |
| `src/app/login/page.tsx` | 3-portal login with strict role validation and cross-portal barrier |
| `src/app/dashboard/approvals/` | Admin verification queue for reviewing and approving veterinary licenses |
| `src/app/dashboard/layout.tsx` | Strict RBAC barrier separating Doctor clinical triage from Admin command |
| `src/app/farmer/layout.tsx` | Root security layout protecting farmer portal routes from unauthorized roles |
| `src/app/appointments/` | Vet booking and 1962 mobile veterinary helpline interface |
| `src/app/about/page.tsx` | Team presentation page with uniform large-photo cards and SIH26128 banner |
| `src/app/farmer/report/page.tsx` | 4-step disease reporting wizard with Voice Form Assistant |
| `src/app/farmer/photo-detect/page.tsx` | AI camera wound detection and triage page (Login protected) |
| `src/app/farmer/ivr/page.tsx` | In-browser IVR helpline phone simulator (Login protected) |
| `src/app/dashboard/page.tsx` | Admin Surveillance Command Center (Heatmap, alerts, and telemetry) |
| `src/app/dashboard/cases/` | Vet case management and clinical triage |
| `prisma/schema.prisma` | Extended database schema with roles, statuses, profiles, and health records |
| `next.config.ts` | Next.js configuration with allowedDevOrigins and Vercel asset tracing |


