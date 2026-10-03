# Pashu Rakshak – Admin Portal Requirements (SIH26128)

> Put this file in the project root and tell your coding agent to read it before building anything.

## 1. Context

- **Hackathon:** Smart India Hackathon 2026
- **Problem statement:** SIH26128, "Efficient systems for early detection, prevention, and management of livestock diseases and animal health issues"
- **Organisation:** Government of Maharashtra
- **Category:** Software
- **Project name:** Pashu Rakshak (पशु रक्षक)

**Expected system (summary of the problem statement):** a scalable animal-health platform with real-time symptom reporting, AI-based outbreak detection, GIS risk mapping, health and vaccination records, multilingual alerts, lab referrals and official dashboards. It should work on mobile, web, IVR and offline, to give early warnings, faster response, lower mortality and better productivity.

> **Note:** The official statement text was not checked directly. This file is based on a summary of it plus common interpretations by other teams. Verify the final scope against the official problem statement on sih.gov.in before submission.

## 2. What the admin portal is

The "admin portal" is the **officials' command dashboard** plus a **system-admin console**. It is used by government officers who monitor disease, decide on outbreaks, send alerts and manage users. It is a **desktop-first web app that must also work on a tablet or phone**, because field officers use it too.

Farmers and vets use separate mobile-first interfaces. They are out of scope for this file except where they feed data into the admin portal.

## 3. Users and permissions (role-based access by jurisdiction)

| Role | Sees | Can do |
|---|---|---|
| State officer | All districts | View everything, broadcast statewide alerts, manage district officers |
| District officer | Own district only | Confirm or dismiss outbreaks, send area alerts, plan vaccination campaigns |
| Taluka officer | Own taluka only | Assign and escalate cases, view local reports |
| System admin | Users and settings | Approve vets and para-vets, manage roles, content and integrations |
| Lab staff (read-only view) | Own referrals | Update sample status and results |

**Rules**
- Every list, map, number and export must be filtered by the logged-in user's jurisdiction on the **server**, not just in the UI.
- Log every sensitive action (confirm outbreak, send alert, approve user, export) in an audit log.

## 4. Functional requirements

### FR-1 Surveillance overview dashboard
- Filter by state → district → taluka → village, plus disease, species and date range.
- Summary numbers: villages reporting, reports in last 7 days, high-risk villages, average vaccination coverage, open cases.
- Trend chart: reports per week.
- Map-linked detail panel for a selected village.

### FR-2 GIS risk map
- Interactive map (Leaflet or similar) with village or block markers.
- Marker size = number of reports; colour = risk level (low, medium, high).
- Heatmap and clustering of reports.
- Dashed ring or polygon for confirmed outbreak zones, with a configurable buffer radius.
- Optional layers: weather, vaccination coverage, cattle markets.

### FR-3 Outbreak detection and review
- Queue of AI-flagged clusters, each with: disease, village, number of reports, deaths, time window and a plain-language **"why flagged"** explanation.
- Officer actions: **Confirm**, **Dismiss**, **Send sample to lab**.
- The AI only recommends. A human officer must confirm before any alert is sent.
- Status flow: `pending → confirmed → alerted` (or `dismissed`).

### FR-4 Multilingual alert broadcasting
- Compose an alert for a chosen area (for example all farmers within 10 km of a village).
- Languages: Marathi, Hindi, English, with editable templates.
- Channels: SMS, push notification, IVR voice call. The user can toggle each one.
- Show estimated and actual reach, and keep alert history.
- Notify vets in the area at the same time.

### FR-5 Case and response tracking
- Table of all cases with animal, issue, village, urgency, assigned vet and stage.
- Stages: Reported → Triaged → Vet assigned → Lab → Treatment → Resolved.
- Actions: assign or reassign vet, escalate when unattended, refer to lab.
- Cases with a farmer photo show the photo and the AI summary (marked "needs vet review").
- Highlight cases that breach a response-time target.

### FR-6 Vaccination and health records
- Coverage by village against a target (default 80%), colour-coded.
- Plan a vaccination campaign for low-coverage areas.
- Animal records by tag ID or QR code: vaccination, treatment and breeding history.
- Mortality reporting with cause and an estimated economic loss.

### FR-7 Lab referral tracking
- Referral list with sample ID, village, disease suspected, status (sent, received, tested, result) and result.
- A confirmed lab result can confirm an outbreak and feed back into the AI as a labelled example.

### FR-8 User and role management
- Approval queue for vets and para-vets (name, role, registration number, document upload).
- Approve, reject or suspend accounts.
- Assign role and jurisdiction.
- View the audit log.

### FR-9 Content and knowledge base
- Manage disease information (symptoms, prevention, first aid) with vet review before publishing.
- Manage alert and advisory templates and their translations.
- Publish government scheme information.

### FR-10 Reports and exports
- Export CSV and a printable PDF **surveillance bulletin** (summary, map snapshot, top outbreaks, vaccination coverage).
- Scheduled weekly summary for district and state offices.

### FR-11 Integrations and system health
- Status of the SMS, push and IVR providers.
- Weather data feed.
- Adapter layer for existing systems (for example Bharat Pashudhan tag IDs). Keep it as an adapter so the real API can be plugged in later.
- Offline sync status and data-quality checks (duplicates, missing location).

## 5. Non-functional requirements

- **Scalable:** pagination and server-side filtering for large datasets.
- **Offline-aware:** the portal shows when field data is waiting to sync and when it was last synced.
- **Security and privacy:** authentication, role checks on the server, encrypted transport, minimal personal data, consent for photos.
- **Explainable AI:** every risk score or flag shows the factors behind it. AI supports vets and officers and never replaces them.
- **Accessibility:** readable fonts, strong contrast, keyboard navigable, colour never the only signal (add text or icon).
- **Responsive:** works on desktop, tablet and phone.
- **Multilingual UI:** at least English, Hindi and Marathi.
- **Auditability:** all alerts, confirmations and approvals are logged with user, time and area.

## 6. Suggested data model (minimum)

- `users` (id, name, role, jurisdiction_id, status, registration_no)
- `jurisdictions` (id, type [state, district, taluka, village], name, parent_id, lat, lng)
- `animals` (id, tag_id, species, breed, owner_id, village_id)
- `reports` (id, animal_id, symptoms, photo_url, lat, lng, created_at, source [app, sms, ivr])
- `cases` (id, report_id, urgency, stage, assigned_vet_id, created_at, resolved_at)
- `outbreaks` (id, disease, village_id, status, reason_json, confirmed_by, confirmed_at)
- `alerts` (id, outbreak_id, area, languages, channels, message, reach, sent_by, sent_at)
- `lab_referrals` (id, case_id, sample_id, status, result)
- `vaccinations` (id, animal_id, vaccine, date, vet_id)
- `audit_log` (id, user_id, action, target, created_at)

## 7. Suggested API endpoints

```
GET  /api/overview?jurisdiction=&from=&to=
GET  /api/map/villages
GET  /api/outbreaks            POST /api/outbreaks/:id/confirm | dismiss
POST /api/alerts               GET  /api/alerts
GET  /api/cases                PATCH /api/cases/:id (assign, escalate)
POST /api/lab-referrals        PATCH /api/lab-referrals/:id
GET  /api/vaccination/coverage POST /api/vaccination/campaigns
GET  /api/users/pending        POST /api/users/:id/approve | reject
GET  /api/export/bulletin?format=pdf|csv
GET  /api/audit-log
```

## 8. Suggested tech stack (change if you prefer)

- **Frontend:** React + Tailwind CSS, Leaflet (maps), Recharts (charts)
- **Backend:** FastAPI (Python) or Node/Express
- **Database:** PostgreSQL + PostGIS (spatial queries)
- **AI:** simple rule engine plus a clustering or risk-scoring model that returns reasons; swap for a trained model later
- **Messaging:** SMS gateway, FCM push, IVR provider (mock these in the demo)

## 9. Demo data and honesty rules

- Use **synthetic data** for the hackathon and label it clearly in the UI.
- Do not claim live access to government systems.
- State clearly that the AI gives surveillance priority and first-aid guidance, not a veterinary diagnosis.

## 10. Acceptance criteria (what judges should be able to see)

1. Switching jurisdiction changes the data on every screen.
2. An AI-flagged cluster shows a clear "why flagged" reason.
3. An officer confirms an outbreak, composes a Marathi/Hindi/English alert, sends it by chosen channels, and sees the reach.
4. The confirmed outbreak appears on the map as a highlighted zone.
5. A farmer-reported case (with photo) appears in the case table and can be assigned, escalated or sent to a lab.
6. Vaccination coverage by village is shown against the target, with a campaign planning action.
7. Vet and para-vet approvals work, and every sensitive action is in the audit log.
8. A PDF or CSV bulletin can be exported.

## 11. Suggested build order

1. Auth, roles and jurisdiction filtering (server-side)
2. Overview dashboard and map with seeded data
3. Outbreak review queue with explanations
4. Alert composer and broadcast (mock providers)
5. Case tracking and lab referrals
6. Vaccination coverage and campaigns
7. User approvals and audit log
8. Export, responsive polish, accessibility pass


```
