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

## 📁 Key File Map

| Path | Description |
| :--- | :--- |
| `ADMIN_PORTAL_REQUIREMENTS.md` | Full SIH26128 functional requirements, data model & build order |
| `src/lib/jurisdiction.ts` | Server-side jurisdiction filter engine for State, District & Taluka officers |
| `src/app/api/overview/route.ts` | Server-enforced surveillance overview endpoint with jurisdiction filtering |
| `src/app/api/draft-report/route.ts` | Multilingual NLP voice extraction API (Hindi/Marathi/English) |
| `src/app/farmer/report/page.tsx` | 4-step disease reporting wizard with Voice Form Assistant |
| `src/app/farmer/photo-detect/page.tsx` | AI camera wound detection and triage page (Login protected) |
| `src/app/farmer/ivr/page.tsx` | In-browser IVR helpline phone simulator (Login protected) |
| `src/app/dashboard/page.tsx` | Admin Surveillance Command Center (Heatmap, alerts, and telemetry) |
| `src/app/dashboard/cases/CasesList.tsx` | Vet case list showing attached photos and triage summaries |
| `src/app/dashboard/layout.tsx` | Role-based navigation boundary (Veterinarian vs Officer vs Admin) |
| `src/components/farmer/FarmerNav.tsx` | Farmer portal header and mobile navigation |
| `src/components/ChatFAB.tsx` | Floating AI Vet Assistant chat (Hidden on report page & unauthenticated) |
| `prisma/schema.prisma` | Database schema with jurisdiction, roles, status, and health models |
| `prisma/seed.ts` | Synthetic Maharashtra livestock seed dataset (Pune, Satara, Haveli) |
