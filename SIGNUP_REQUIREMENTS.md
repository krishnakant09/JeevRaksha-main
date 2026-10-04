# Pashu Rakshak – Create Account / Signup Requirements

> Put this file in the project root and tell your coding agent to read it before building the signup and login flow.

**Design reference (clickable prototype):** https://claude.ai/artifact/HdE166Hbxosji2K2FsHuJn
Match the flow, screen order and rules below. The prototype is only a visual and behaviour reference. Build the real version properly with a backend.

## 1. Goal

A short, step-by-step signup where **each user type sees different questions**. Farmers need almost no typing. Vets need verification. Officers and admins never self-register.

## 2. User types

| Role | How the account is created | Active when |
|---|---|---|
| Farmer / पशुपालक | Self-signup with phone OTP | Immediately after OTP and consent |
| Vet / Para-vet | Self-signup + document upload | After an admin approves the registration |
| Officer (taluka, district, state) | **Invite only**, created by an admin | After the invited person accepts the invite and verifies OTP |
| System admin | Created manually or seeded | Immediately |

The role screen shows a "Government login" tile that explains officer accounts are created by invite. It must not offer officer self-signup.

## 3. Flow

```
Language → Role → Phone → OTP → Role-specific steps → Consent → Done
```

**Farmer (6 steps):** Phone → OTP → Name → Location → Animals → Consent
**Vet / para-vet (4 steps):** Phone → OTP → Vet details form → Consent → "Under review" screen
**Officer:** Invite code screen → Phone → OTP → set profile → Done (invite codes are validated on the server)

## 4. Screen requirements

### 4.1 Language screen
- Show **मराठी, हिन्दी, English** in their own script, as large buttons.
- Store the choice and apply it to all later screens. Default to the browser or device language if it matches, and let the user change it later.

### 4.2 Role screen
- Three large tiles with icon, title and a one-line description: Farmer, Vet / Para-vet, Government login.

### 4.3 Phone and OTP
- Mobile number field, `+91` prefilled, 10 digits, numeric keypad (`inputmode="numeric"`).
- Send a 6-digit OTP by SMS. Support OTP autofill (`autocomplete="one-time-code"`).
- Resend timer (30 seconds) and a **"Get OTP by voice call"** option.
- No passwords. Later logins use OTP again (optionally a 4-digit PIN as a convenience, if time allows).
- The Next button stays disabled until the input is valid.

### 4.4 Farmer steps (one question per screen)
1. **Name** – text input with a microphone button for voice input.
2. **Location** – a "Use my location" button, or choose district → taluka → optional village. Taluka is required.
3. **Animals** – tiles for cow, buffalo, goat, sheep, poultry. Selecting a tile reveals a +/– count.
4. Optional later: first animal's tag ID or photo (skippable with "Do this later").

### 4.5 Vet / para-vet form (one page)
- Full name, role (Vet or Para-vet), registration number, issuing council.
- Upload the registration certificate (image or PDF).
- Service area (district, taluka, villages), languages spoken, optional availability.
- Required: name, registration number, certificate, taluka.
- Result: **"Under review. We will notify you by SMS within 24 to 48 hours."** with a three-step status (Submitted → Registration checked → Account active).

### 4.6 Consent
- Plain-language consent in the chosen language.
- Checkbox 1 (**required**): use of data to help the user's animals.
- Checkbox 2 (optional): sharing photos and location for help.
- **Neither box is pre-ticked.** Store what the user agreed to, with a timestamp and the text version.

### 4.7 Done screen
- Farmer: welcome with a short summary and an **"Add your first animal"** button, plus "Do this later".
- Vet: the under-review status. Show the approved state once an admin approves.

## 5. UX rules (farmer-friendly)

- One question per screen, with a progress indicator and a back button that keeps answers.
- Large type and large tap targets (at least 48px). Icon plus text labels.
- Plain, helpful error messages in the chosen language (no error codes).
- A **"Need help? Call us"** bar on every screen, and a 🔊 button that reads the screen heading aloud.
- Save progress, so a user who stops halfway can resume. Optionally send a reminder SMS.
- Keep it light for slow networks. No heavy images on signup screens.
- Colour is never the only signal (use text or icons too).
- Keyboard accessible, visible focus, and correct labels for screen readers.

## 6. Backend requirements

### 6.1 Endpoints (suggested)

```
POST /api/auth/otp/send        { phone }
POST /api/auth/otp/verify      { phone, otp } -> { token, user, isNew }
POST /api/auth/otp/voice       { phone }
POST /api/auth/refresh
POST /api/signup/farmer        { name, jurisdiction, animals[], consent }
POST /api/signup/vet           { name, role, regNo, council, serviceArea, languages, consent }
POST /api/uploads/certificate  (multipart, returns file id)
POST /api/invites/accept       { code, phone }
GET  /api/me
PATCH /api/me/language
GET  /api/admin/users/pending            (admin only)
POST /api/admin/users/:id/approve|reject (admin only)
POST /api/admin/invites                  (admin only; creates officer invites)
```

### 6.2 Data model (minimum)

- `users` (id, phone, name, role, status [`active`, `pending_review`, `rejected`, `suspended`], language, jurisdiction_id, created_at)
- `farmer_profiles` (user_id, village, taluka, district)
- `animals_summary` (user_id, species, count)
- `vet_profiles` (user_id, vet_type, registration_no, council, certificate_file_id, service_area, languages, reviewed_by, reviewed_at)
- `consents` (user_id, type, accepted, text_version, accepted_at)
- `invites` (code, role, jurisdiction_id, created_by, expires_at, used_at)
- `otp_attempts` (phone, hashed_code, expires_at, attempts, created_at)
- `audit_log` (id, user_id, action, target, created_at)

### 6.3 Security rules
- OTP: 6 digits, expires in 5 minutes, store only a hash, limit attempts, rate-limit sends per phone and per IP, and block repeated abuse.
- Use short-lived access tokens with refresh tokens. Never store tokens in a place scripts can read if avoidable (prefer secure httpOnly cookies on web).
- Validate and sanitise every input on the server. Never trust the client for role or status.
- Certificate uploads: limit size and type, scan or restrict file types, store privately, and give access only to admins.
- Vet accounts stay `pending_review` and cannot receive cases until approved.
- Officer and admin roles can only be created through invites or seeding, never through public endpoints.
- Log approvals, rejections, invites and failed logins in the audit log.
- Keep personal data minimal and follow the consent given.

## 7. Integration with the rest of the project

- Approved vets appear in the **Admin portal → Users** list and become available to receive cases.
- New farmers appear in the user list with their village and taluka so jurisdiction filters work.
- The saved language preference drives the language of the farmer, vet and alert screens.
- The first-animal step connects to the animal health card (separate feature).

## 8. Acceptance criteria

1. A farmer can finish signup in 6 screens, with every answer given by tap, selection or short text.
2. Language selection changes all text on the following screens (Marathi, Hindi, English).
3. Next is disabled until the current input is valid.
4. OTP works with resend timer and voice-call option, with server-side rate limiting.
5. A vet can upload a certificate and ends on the "Under review" screen. They cannot receive cases until an admin approves.
6. An admin can approve or reject a pending vet, and the vet sees the new status.
7. Officer accounts can only be created via an invite code.
8. Consent is stored with a timestamp, and the required box must be ticked.
9. The flow works on a 360px-wide phone screen and is keyboard accessible.
10. Signup can be resumed if interrupted.

## 9. Suggested build order

1. Database tables and OTP send/verify (use a mock SMS provider in development)
2. Language, role and phone/OTP screens
3. Farmer steps and farmer signup endpoint
4. Consent storage and Done screen
5. Vet form, certificate upload and "Under review" status
6. Admin approval screen and endpoints
7. Officer invite flow
8. Rate limiting, validation, accessibility and responsive pass