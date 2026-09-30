# 🛡️ JeevRaksha (जीव रक्षा)
### AI-Powered Real-Time Livestock Disease Early Warning & Surveillance Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Indic_Voice_%26_NLP-orange)](https://sarvam.ai)

---

## 📌 Overview

**JeevRaksha (जीव रक्षा)** is a unified, real-time epidemiological surveillance and early warning platform purpose-built for India's rural livestock ecosystem. In rural farming communities, delays in identifying contagious animal diseases (such as Foot-and-Mouth Disease, Black Quarter, and Haemorrhagic Septicaemia) often result in severe livestock mortality, catastrophic economic losses, and zoonotic outbreak risks.

JeevRaksha connects **farmers, field workers, veterinarians, diagnostic laboratories, and district authorities** into an integrated response grid:
- **Farmers** report symptoms quickly using their native language via voice, text, or photo uploads.
- **AI & Risk Engine** calculates localized outbreak probabilities, flags infection clusters, and issues immediate care guidelines.
- **Veterinarians & Field Officers** receive automated priority alerts, triage cases, schedule on-site inspections, log diagnoses, and dispatch sample tests.
- **Diagnostic Labs** process biological samples and update confirmatory results directly into the patient case stream.
- **Administrators** monitor geographic heatmaps, track vaccine coverage gaps, and deploy containment protocols before localized infections escalate into epidemics.

---

## ✨ Key Features

### 🎙️ 1. Multilingual AI Assistant (Indic Voice & Vision)
- **Native Hindi & Indic Dialect Support**: Integrated with Sarvam AI and the Web Speech API for voice dictation and audio responses.
- **Interactive Floating Voice Bot (`ChatFAB`)**: Accessible across all pages, allowing farmers to describe symptoms verbally without typing complex medical terms.
- **Multimodal Image Analysis**: Enables farmers to take photos of lesions, blisters, or infected areas for visual context.

### 🧠 2. Automated Epidemiological Risk Engine
- Proprietary multi-factor scoring algorithm (`src/lib/risk-engine.ts`) assessing:
  - **Symptom Severity**: Mild, moderate, or acute indicators (e.g., high fever, blisters, excessive salivation).
  - **Cluster Proximity**: Density of infected animals within the same village or block.
  - **Mortality Velocity**: Recent livestock deaths in the geographic cluster.
  - **Vaccination Gap**: Immunity deficit history against endemic diseases in the region.
  - **Historical & Environmental Context**: Seasonality and temporal trends.
- Automated triage into **LOW**, **MEDIUM**, or **HIGH** risk levels with instantaneous recommended actions.

### 🗺️ 3. Interactive GIS Outbreak Map
- Built with **Leaflet** and **React-Leaflet** for real-time geographic surveillance.
- Interactive color-coded case markers and outbreak heatmaps.
- Drill-down filters by district, block, village, disease type, and severity.

### 🩺 4. Full-Lifecycle Case Management
- End-to-end lifecycle tracking:
  $$\text{NEW} \longrightarrow \text{UNDER REVIEW} \longrightarrow \text{FIELD VISIT} \longrightarrow \text{TREATMENT} \longrightarrow \text{LAB TEST} \longrightarrow \text{RECOVERED / CLOSED}$$
- Digital field inspection logs, veterinary findings, prescribed medications, and follow-up reminders.

### 🔬 5. Diagnostic Laboratory Integration
- Sample tracking from biological collection (blood, swabs, tissue) to delivery at regional diagnostic centers (e.g., IVRI).
- Real-time diagnostic status updates and lab result attachment to medical records.

### 🚨 6. Early Warning & Outbreak Alerts
- Automated alert triggers for mortality spikes, disease clusters within a 7-day window, and overdue booster shots.
- District and block-level priority notifications to stop cross-village transmission.

### 🐮 7. Livestock & Vaccination Registry
- Complete digital animal passports: breed, age, gender, weight, identification, and owner details.
- Vaccination schedules and proactive reminders for critical immunizations (FMD, BQ, HS, Brucellosis).

---

## 👥 User Roles

| Role | Primary Functions |
|---|---|
| **Farmer (`FARMER`)** | Register animals, report illnesses via voice/text/photo, track case progress, access AI veterinary guidance. |
| **Veterinarian (`VETERINARIAN`)** | Review assigned cases, conduct field visits, prescribe medication, order lab tests, monitor local outbreaks. |
| **Field Worker (`FIELD_WORKER`)** | Conduct on-site inspections, verify herd health, collect diagnostic samples, assist illiterate farmers. |
| **Laboratory (`LABORATORY`)** | Receive sample dispatches, log diagnostic analysis, upload test reports and pathogen verifications. |
| **Administrator (`ADMIN`)** | District/state-level oversight, outbreak cluster mapping, alert dissemination, vaccine drive planning. |

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   Next.js 16 (React 19) • Tailwind CSS v4 • Lucide Icons     │
│   Leaflet GIS Maps • Recharts • Web Speech API • Puter.js   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Next.js API Handlers                     │
│  /api/health-reports • /api/cases • /api/chat • /api/tts    │
│  /api/map-symptoms   • /api/alerts • /api/animals • /api/lab │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐ ┌─────────────▼───────────────┐
│     Core Risk Engine        │ │      Sarvam AI Platform     │
│  Multi-Factor Triage Logic  │ │  Indic NLP • Speech-to-Text │
│  Cluster & Mortality Scoring│ │  Text-to-Speech (TTS)       │
└──────────────┬──────────────┘ └─────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                   Prisma ORM 6.0 (SQLite)                   │
│   Users • Animals • Reports • Symptoms • Cases • Samples    │
│   Treatments • FieldVisits • Alerts • Laboratories • Logs   │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org), [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev)
- **Data & Maps**: [Leaflet](https://leafletjs.com) & [React-Leaflet](https://react-leaflet.js.org), [Recharts](https://recharts.org)
- **Database & ORM**: [Prisma ORM 6.0](https://www.prisma.io) with [SQLite](https://www.sqlite.org) (`prisma/dev.db`)
- **AI & Indic NLP**: [Sarvam AI](https://sarvam.ai) (Indic Language models, Speech-to-Text & Text-to-Speech)
- **Authentication**: Bcrypt password hashing with role-based API access

---

## 📁 Repository Structure

```text
├── components/                 # Root shared components
│   └── maps/                  # Map utilities and dynamic loaders
├── prisma/
│   ├── dev.db                 # SQLite development database
│   ├── schema.prisma          # Database schema definitions
│   └── seed.ts                # Database seed script with demo data
├── public/                    # Static assets and icons
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── alerts/        # Alert management endpoints
│   │   │   ├── animals/       # Livestock registry endpoints
│   │   │   ├── auth/          # Authentication endpoints (login, register)
│   │   │   ├── cases/         # Case lifecycle and diagnosis APIs
│   │   │   ├── chat/          # Sarvam AI chat assistant endpoint
│   │   │   ├── draft-report/  # AI report drafting from voice/text
│   │   │   ├── health-reports/# Sickness filing and risk evaluation
│   │   │   ├── map-symptoms/  # Indic speech to clinical symptoms mapper
│   │   │   ├── tts/           # Sarvam AI Text-to-Speech proxy
│   │   │   └── upload/        # Image upload handler
│   │   ├── dashboard/         # Authority & Veterinarian portal
│   │   │   ├── alerts/        # Real-time outbreak alert notifications
│   │   │   ├── cases/         # Active triage and case workflows
│   │   │   ├── lab/           # Laboratory sample management
│   │   │   ├── map/           # Interactive GIS outbreak mapping
│   │   │   └── page.tsx       # Core surveillance analytics dashboard
│   │   ├── farmer/            # Farmer portal
│   │   │   ├── animals/       # My livestock registry
│   │   │   ├── chat/          # Dedicated conversational AI screen
│   │   │   ├── my-issues/     # Submitted reports & case statuses
│   │   │   └── report/        # Multi-step disease reporting wizard
│   │   ├── login/             # User sign-in page
│   │   ├── register/          # User sign-up page
│   │   ├── globals.css        # Global Tailwind CSS styles
│   │   ├── layout.tsx         # Root application layout
│   │   └── page.tsx           # Product landing page & platform showcase
│   ├── components/
│   │   ├── ChatFAB.tsx        # Floating AI Voice Assistant widget
│   │   └── maps/              # Dynamic Leaflet map components
│   └── lib/
│       ├── prisma.ts          # Singleton Prisma client instance
│       └── risk-engine.ts     # Epidemiological risk scoring algorithm
├── .env.example               # Template environment variables
├── package.json               # Node.js project manifest & dependencies
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/jeevraksha.git
cd jeevraksha

npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Set the following variables inside `.env`:

```env
# SQLite Database Path
DATABASE_URL="file:./dev.db"

# Sarvam AI API Key (Optional for basic UI, required for Voice/Indic AI & TTS)
# Obtain your key at https://sarvam.ai
SARVAM_API_KEY="your_sarvam_api_key_here"

# Environment
NODE_ENV="development"
```

> **Note**: The application falls back gracefully if `SARVAM_API_KEY` is not provided, allowing you to test UI features, reporting workflows, maps, and case dashboards.

### 3. Initialize & Seed the Database

Run Prisma migrations and populate the SQLite database with realistic initial data (farmers, veterinarians, animals, active outbreaks in Rampur village, alerts, and diagnostic samples):

```bash
# Push the schema to create/sync SQLite dev.db
npx prisma db push

# Seed demo users, animals, outbreak reports, and alerts
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

Use any of these pre-seeded accounts to explore the different perspectives of the platform:

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **Farmer** | `farmer@jeevraksha.in` | `password123` | Report sickness, check animal records, view treatment updates. |
| **Veterinarian** | `vet@jeevraksha.in` | `password123` | View assigned cases, log clinical findings, prescribe treatments. |
| **Administrator** | `admin@jeevraksha.in` | `password123` | District surveillance dashboard, live GIS map, alert notifications. |

---

## 🛠️ Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Next.js development server at [http://localhost:3000](http://localhost:3000). |
| `npm run build` | Builds the production-ready bundle. |
| `npm run start` | Starts the production server after building. |
| `npm run lint` | Runs ESLint to check for code quality and errors. |
| `npx prisma studio` | Opens an interactive web GUI to inspect and edit database records. |
| `npx prisma db push` | Synchronizes the Prisma schema with your local SQLite database. |
| `npx prisma db seed` | Executes `prisma/seed.ts` to populate initial demo data. |

---

## 🧪 Epidemiological Risk Model

The risk calculation algorithm (`src/lib/risk-engine.ts`) calculates an aggregate score $S \in [0, 100]$:

$$S = \text{Severity} (25) + \text{Cluster Proximity} (25) + \text{Mortality} (20) + \text{Vaccine Gap} (15) + \text{Trend} (10) + \text{Environment} (5)$$

- **$S \ge 61$ (HIGH RISK)**: Triggers immediate district alert, dispatches on-site veterinary inspection, flags potential quarantine zone.
- **$31 \le S \le 60$ (MEDIUM RISK)**: Recommends veterinary consult, flags animal for close daily observation.
- **$S \le 30$ (LOW RISK)**: Standard local monitoring and symptomatic home care.

---

## 🔮 Roadmap & Future Enhancements

- [ ] **Offline-First PWA & Sync**: Allow field workers in zero-connectivity rural zones to log reports locally with background synchronization.
- [ ] **WhatsApp & SMS Bot Integration**: Low-bandwidth reporting via automated Twilio/Meta WhatsApp Business channels.
- [ ] **Satellite & Climate Weather Correlation**: Correlate seasonal rainfall and humidity patterns with vector-borne disease spikes (e.g., Anthrax, Trypanosomiasis).
- [ ] **Automated RFID / Ear-Tag QR Scanner**: Instant animal profile retrieval using camera scanning.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
