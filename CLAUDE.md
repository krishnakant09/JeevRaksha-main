@AGENTS.md

# Pashu Rakshak (JeevRaksha) — Project Progress & Work Log

**Project Overview:** AI-powered animal health surveillance and rapid veterinary response system for rural farmers, field veterinarians, and livestock disease control authorities.

---

## 🔑 Demo Credentials & Local Setup
- **Local Dev Server:** `http://localhost:3000` (Next.js 16 + Turbopack)
- **Database:** SQLite (`prisma/dev.db`)
- **Seeded Accounts** (Password for all: `password123`):
  - **Farmer:** `farmer@jeevraksha.in` (Ramesh Kumar, Rampur)
  - **Veterinarian:** `vet@jeevraksha.in` (Dr. Priya Sharma)
  - **Admin:** `admin@jeevraksha.in` (Admin User)

---

## 🛠️ Work Done Till Now

### 1. Species-Specific Endemic Outbreak Presets in Disease Reporting
- **File:** `src/app/farmer/report/page.tsx`
- **Feature:**
  - In Step 2 of the 4-step disease reporting wizard, "Quick Presets for Endemic Outbreaks" dynamically filters diseases according to the animal selected in Step 1.
  - **Cattle / Buffalo:** Foot-and-Mouth Disease (FMD / खुरपका-मुंहपका), Lumpy Skin Disease (LSD / लंपी चर्म रोग), Haemorrhagic Septicaemia (HS / गलघोंटू), Black Quarter (BQ / लंगड़ा बुखार).
  - **Goat / Sheep:** Peste des Petits Ruminants (PPR / बकरी प्लेग), Enterotoxaemia (फड़किया), Goat Pox.
  - **Swine (Pig):** African Swine Fever (ASF), Classical Swine Fever.
  - **Equine (Horse/Mule):** Glanders, Equine Influenza.
  - **Poultry:** Avian Influenza (Bird Flu), Newcastle Disease (Ranikhet).
  - Clicking any preset automatically pre-fills symptoms, sets risk severity, and displays instant bio-security isolation instructions.

---

### 2. Rural UI Aesthetics & Design System
- **Files:** `src/app/globals.css`, `src/components/farmer/FarmerNav.tsx`
- **Feature:**
  - Adopted warm agricultural/earthy green design inspired by `Pashu Rakshak .md` (`#2E7D46`, `#DCEFE1`, `#EEF2EA`, `#16261B`, `#FBEFCF`).
  - Added Google Fonts **Mukta** and **Noto Sans Devanagari** for clear Hindi/English typography.
  - Revamped `FarmerNav.tsx` with high-contrast icons, dual-language labels, and mobile bottom tab navigation.

---

### 3. High-Visibility Role Portals on Home Page (Accessibility First)
- **File:** `src/app/page.tsx`
- **Feature:**
  - Positioned right below the top navigation bar as the very first thing any user sees.
  - Designed specifically for low-literacy farmers and rural users with large familiar icons, numbered badges, high-contrast borders, and simple Hindi/English copy:
    1. **विकल्प 1: 🌾🐄 किसान पोर्टल (Farmer Portal)** → `/farmer/report`
       - *"पशु बीमार है? तुरंत डॉक्टर बुलाएं, लक्षण दर्ज करें या AI सहायता से तुरंत सलाह लें।"*
    2. **विकल्प 2: 🩺👨‍⚕️ डॉक्टर पोर्टल (Vet Portal)** → `/dashboard/cases`
       - *"मरीज़ केस देखें, इमरजेंसी स्वीकार करें, दवा व इलाज का पर्चा (Rx) बनाएं।"*
    3. **विकल्प 3: 🛡️📊 एडमिन पोर्टल (Admin Portal)** → `/dashboard`
       - *"रोग निगरानी नक्शा, जिले के आंकड़े, आउटब्रेक चेतावनी व समग्र नियंत्रण ग्रिड।"*

---

### 4. IVR (Interactive Voice Response) Telephony & In-App Simulator
Designed for rural farmers who have basic keypad feature phones (2G/no internet) to report disease emergencies via phone call (`1800-PASHOO-HELP` / `1800-727-466`).

#### A. Interactive In-Browser IVR Simulator
- **Route:** `/farmer/ivr` (`src/app/farmer/ivr/page.tsx`)
- **Key Capabilities:**
  - Virtual mobile phone chassis with network indicators ("Pashu-Cell 4G"), battery, and live call timer.
  - **Real Hindi Spoken Audio Prompts:** Uses browser SpeechSynthesis to play automated Hindi voice guidance over speakers (*"नमस्ते! पशु रक्षक आपातकालीन हेल्पलाइन में आपका स्वागत है..."*).
  - **DTMF Audio Keypad:** Realistic touch tones on button presses (1–9, *, 0, #).
  - **Multi-Step Triage:**
    - Step 1: Select Animal (1: Cow, 2: Buffalo, 3: Goat, 4: Other).
    - Step 2: Select Symptom (1: FMD, 2: LSD, 3: HS, 4: Speech-to-Text via microphone).
    - Step 3: Instant case creation with live receipt, assigned vet, suspected disease triage, and spoken emergency first-aid advice.
  - Direct button to inspect the newly generated case in the Vet Portal (`/dashboard/cases`).
  - "Developer / Telephony" tab with production Twilio/Exotel setup instructions and sample TwiML.

#### B. Backend IVR Intake API
- **Endpoint:** `POST /api/ivr/simulate` (`src/app/api/ivr/simulate/route.ts`)
- Maps caller phone, animal choice, and symptom choice to epidemiological outbreak conditions.
- Automatically persists `HealthReport`, `Symptom`, and `Case` (status: `NEW`) in Prisma database.
- Calculates outbreak risk and auto-creates high-priority `Alert` records for vets and authorities.

#### C. Production Telecom Webhook
- **Endpoint:** `POST / GET /api/ivr/webhook` (`src/app/api/ivr/webhook/route.ts`)
- Standard TwiML/XML webhook compatible with Twilio, Exotel, Plivo, or any SIP trunk.
- Supports `<Gather>` for DTMF digit collection and `<Say voice="Polly.Aditi">` prompts.

#### D. Navigation & CTA Links
- Added **"IVR हेल्पलाइन"** (`/farmer/ivr`) to `FarmerNav.tsx`.
- Added **"📞 1800 IVR हेल्पलाइन (बिना इंटरनेट फोन कॉल)"** in the main landing page hero emergency action box (`src/app/page.tsx`).

---

### 5. AI Photo Detection & Wound Triage (from `photo detect.md`)
Replaced the old AI Voice assistant button on the home page with a dedicated camera photo inspection feature for livestock injuries and wounds.

#### A. Interactive Photo Triage Page
- **Route:** `/farmer/photo-detect` (`src/app/farmer/photo-detect/page.tsx`)
- **Key Capabilities:**
  - Real device camera capture (`capture="environment"`) and image file upload.
  - "नमूना फोटो इस्तेमाल करें (Demo)" button for instant 1-click preview without needing an image file.
  - 2-second realistic AI vision scan animation with laser line scanning the injury.
  - **Clinical AI Result Display:**
    - Urgency badge (`⚠️ आज डॉक्टर को दिखाएं / See a vet today`).
    - Observation text in Hindi and English.
    - **🔊 आवाज में सुनें (Listen):** Spoken Hindi audio readout using `window.speechSynthesis` (`hi-IN`).
    - **✅ अभी यह करें (Do this now):** Gently wash with water, cover with clean cloth, keep dry.
    - **⛔ यह कतई न करें (Avoid):** Do not apply mud, ash, or home remedies.
    - **📞 तुरंत डॉक्टर बुलाएं अगर:** Warning triggers (maggots, heavy bleeding, fever).
  - Direct CTA button: **"🩺 फोटो के साथ डॉक्टर बुलाएं (Request Vet With Photo)"** to automatically save the case in the database.

#### B. Backend API Route
- **Endpoint:** `POST /api/photo-detect` (`src/app/api/photo-detect/route.ts`)
- Stores image in `HealthReport.imageUrl`, saves AI analysis in `additionalNotes`, creates symptoms and a new `Case` in Prisma DB.

#### C. Vet Portal Integration
- In `src/app/dashboard/cases/CasesList.tsx`, cases submitted with photos now show a `📷 Photo Attached` badge, the photo thumbnail, and the AI clinical note card for veterinarian review.

#### D. Home Page & Navigation Integration
- **Home Page Hero Box:** Replaced the "AI आवाज सहायक" button with **"📷 चोट की फोटो से जांच (AI घाव व रोग विश्लेषण)"** (`/farmer/photo-detect`).
- **Farmer Navigation:** Added **"फोटो से जांच"** to `FarmerNav.tsx`.

---

## 📁 Key File Map

| Path | Description |
| :--- | :--- |
| `src/app/page.tsx` | Main landing page with 3 portal cards, IVR helpline, and Photo Detect CTA |
| `src/app/farmer/photo-detect/page.tsx` | AI photo detection page for livestock wound triage |
| `src/app/api/photo-detect/route.ts` | Backend intake API for analyzing photos and creating cases |
| `src/app/dashboard/cases/CasesList.tsx` | Vet case list showing attached photos and AI triage summaries |
| `src/app/farmer/report/page.tsx` | 4-step disease reporting wizard with species-filtered outbreak presets |
| `src/app/farmer/ivr/page.tsx` | Interactive In-Browser IVR Phone Simulator with Hindi voice prompts |
| `src/app/api/ivr/simulate/route.ts` | Backend intake API for creating cases from IVR calls |
| `src/app/api/ivr/webhook/route.ts` | Production Twilio/Exotel TwiML XML webhook |
| `src/components/farmer/FarmerNav.tsx` | Farmer portal header and mobile bottom navigation |
| `src/app/globals.css` | Mukta/Noto Sans fonts and Pashu Rakshak color tokens |
| `prisma/schema.prisma` | Database schema (User, Animal, HealthReport, Symptom, Case, Alert) |

