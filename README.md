# HyperDiaScan — Project Overview & File-by-File Guide

Last updated: 2025-11-23

This README gives a complete, beginner-friendly guide to the HyperDiaScan project: what it does, how it’s structured, how the major flows work, and a file-by-file explanation of the important files (excluding UI `client/src/components/ui/*`, package files and build/config files).

---

## Table of contents
- High-level system overview
- Architecture & component interactions
- System flows (Login, Scan, Analytics, Admin, Audit logs)
- File-by-file explanation (grouped)
- Developer quick-start
- Recommended next steps & diagrams request

---

## High-level system overview

- Purpose: HyperDiaScan is a full-stack web app to help users scan or input foods and receive a condition-aware nutrition analysis (e.g., diabetes, hypertension). It stores user profiles, scan history, and audit logs in Firestore and offers an admin dashboard for monitoring and analytics.
- Main features:
  - User authentication and profile management
  - Food scanning via camera or image and manual nutrition entry
  - Nutrition analysis using an LLM (Gradio) with deterministic fallbacks
  - Saving scan history and generating per-user tips
  - Admin dashboard with users, audit logs and analytics

---

## Architecture & component interactions

- Frontend: React + TypeScript, built with Vite. The SPA code is in `client/src` and includes pages, components, contexts, and client-side libraries.
- Backend: small Node/Express server entry under `server/` used for server-only endpoints or dev tasks.
- Auth & DB: Firebase (Auth + Firestore) — used by client code to authenticate users and persist data.
- LLM Integration: Gradio client is used when available to call an LLM; `client/src/lib/analyzeFood.ts` orchestrates LLM calls and falls back to `fallbackAnalysis.ts` when necessary.
- Tests: Vitest tests live in `test/`. We add a `test-setup/vitest.setup.ts` that mocks Firebase modules for CI and local tests.

Interactions summary:
- UI components call helper functions in `client/src/lib/*` which access Firebase (`client/src/lib/firebase.ts`) or the LLM. Firestore writes trigger stored data that admin components later query for analytics.

---

## System flows (referenced files included)

Below are the common user flows and the files involved. Function names are given where relevant.

### User login

1. User submits login form in `client/src/components/auth/AuthForm.tsx`.
2. `AuthForm` calls `signInWithEmail(email, password)` in `client/src/lib/auth.ts`.
3. `signInWithEmail` uses Firebase Auth (`signInWithEmailAndPassword`) and then fetches the user profile from Firestore (`getDoc`). If the profile is inactive, it signs out and throws an error. On success it:
   - Calls `createAuthAuditLog` (in `client/src/admin/lib/auditLog.ts`) to record the login.
   - Updates `lastActive` on the user document.
4. `AuthContext` (`client/src/contexts/AuthContext.tsx`) listens for auth state changes and provides user data to the app.

Key files: `client/src/components/auth/AuthForm.tsx`, `client/src/lib/auth.ts`, `client/src/admin/lib/auditLog.ts`, `client/src/contexts/AuthContext.tsx`.

### Food scan (image/manual)

Image flow:
1. User opens scanner page (`client/src/pages/Scanner.tsx`) and captures image via `CameraScanner.tsx`.
2. `analyzeImageFile` (in `client/src/lib/analyzeImage.ts`) extracts nutrition fields (OCR or label parsing).
3. The normalized nutrition object is passed to `analyzeFood` (`client/src/lib/analyzeFood.ts`).

Manual entry flow:
1. User fills nutrition values in a form on `Scanner.tsx` or dedicated manual entry component.
2. The app calls `analyzeFood` with `options.unit` set to either `reni` or `grams`.

`analyzeFood` process:
- Calls the Gradio/LLM endpoint using a prompt from `promptBuilder.ts`.
- If the LLM returns a valid response, `parseLlm.ts` (or `parseImageLlm.ts`) translates the result into normalized fields.
- If the LLM fails, `analyzeFood` calls `fallbackAnalysis` (`client/src/lib/fallbackAnalysis.ts`) which implements deterministic logic for both RENI and grams inputs.

Saving a scan:
- `saveScanRecord` in `client/src/lib/firestore.ts` writes the scan to `scanRecords` collection and updates the user's `lastActive` timestamp. This function returns the document ID.
- `createScanAuditLog` records the scan event in audit logs.

Key files: `client/src/pages/Scanner.tsx`, `client/src/components/scanner/*`, `client/src/lib/analyzeImage.ts`, `client/src/lib/analyzeFood.ts`, `client/src/lib/fallbackAnalysis.ts`, `client/src/lib/firestore.ts`, `client/src/lib/promptBuilder.ts`, `client/src/lib/parseLlm.ts`.

### Analytics generation

1. Admin pages call admin utilities in `client/src/admin/lib/analytics.ts` to fetch and aggregate scan records and user data.
2. Charts (e.g., `client/src/admin/components/ScanAnalyticsChart.tsx`) render the aggregated datasets.

Key files: `client/src/admin/lib/analytics.ts`, `client/src/admin/components/ScanAnalyticsChart.tsx`, `client/src/admin/pages/Dashboard.tsx`.

### Admin dashboard behavior

1. `AdminContext` checks the signed-in user's role using the user profile from Firestore.
2. If `isAdmin` is true, the user sees the admin layout (`client/src/admin/components/AdminLayout.tsx`) and admin routes (`client/src/admin/pages/*`).
3. Admin pages query Firestore (`db`) via helper libs to show users, logs and analytics.

Key files: `client/src/admin/context/AdminContext.tsx`, `client/src/admin/components/AdminLayout.tsx`, `client/src/admin/pages/*`.

### Audit logs

1. Audit entry helpers live in `client/src/admin/lib/auditLog.ts` (`createAuthAuditLog`, `createScanAuditLog`, `createProfileAuditLog`).
2. These functions `addDoc` to an `auditLogs` collection with details: userId, category, action, status, severity, metadata, timestamp.
3. Admin UI reads the `auditLogs` collection and displays entries.

Key files: `client/src/admin/lib/auditLog.ts`, `client/src/admin/components/AuditLogList.tsx`, `client/src/admin/pages/AuditLogs.tsx`.

---

## File-by-file explanation (grouped)

The list below covers the main files and folders from this repository (files under `client/src/components/ui/*`, package files, and config/build files are intentionally excluded). For each file: purpose, key functions, where used.

### Root files
- `components.json` — metadata for UI components (tooling). Not used at runtime.
- `drizzle.config.ts` — Drizzle ORM config (server DB migration/tooling support).
- `netlify.toml` — Netlify deployment settings.
- `test.md` — notes for testing.

### `client/` (frontend)

client root
- `_redirects` — Netlify redirect rules for SPA routing.
- `index.html` — Vite app entry.

client/src

- `main.tsx`
  - Purpose: App entry. Mounts React App, registers providers (Router, QueryClient).
  - Key: renders `<App />`.

- `App.tsx`
  - Purpose: Central routing and layout. Registers routes for the app and admin area.
  - Key: top-level routes for `Home`, `Scanner`, `History`, `Profile`, `Admin`.

- `setupTests.ts`
  - Purpose: Test setup helper (testing library); included from `vitest.config.ts`.

#### Contexts

- `contexts/AuthContext.tsx`
  - Purpose: Provide `user`, `isLoading`, `signIn`, `signOut`, and other auth helpers across the app.
  - Key functions: `AuthProvider`, `useAuth`.
  - Uses: `client/src/lib/auth.ts` to perform low-level operations.

- `admin/context/AdminContext.tsx`
  - Purpose: Expose `isAdmin` and `isAdminLoading` state to protect admin routes and render admin-specific UI.

#### Hooks

- `hooks/use-mobile.tsx` — detect mobile layout.
- `hooks/use-toast.ts` — toast notification helper.

#### lib (client-side services)

- `lib/firebase.ts`
  - Purpose: Initialize Firebase app, export `app`, `auth`, `db`.
  - Key exports: `firebaseConfig`, `app`, `auth`, `db`.
  - Used by: `auth.ts`, `firestore.ts`, admin libs, most components.
  - Note: In tests this module is mocked by `test-setup/vitest.setup.ts` to avoid real initialization.

- `lib/auth.ts`
  - Purpose: Higher-level user auth/profile functions.
  - Key functions:
    - `signInWithEmail(email, password)` — authenticate, validate profile active flag, update lastActive, log audit.
    - `signUpWithEmail(email, password, name, profileData?)` — create user, call `createUserProfile`.
    - `createUserProfile(user, profileData?)` — writes default UserProfile to Firestore when absent.
    - `updateUserProfile(userId, profile)` — validates via `shared/schema.ts` and updates.
    - `getUserProfile(userId)` — returns profile data or null.
    - `signOut()` — sign out + audit log.
  - Used by: `AuthContext`, tests, profile pages.

- `lib/firestore.ts`
  - Purpose: Persistence helpers for scan records, tips, and subscriptions.
  - Key functions:
    - `saveScanRecord(userId, scanData, imageFile?)` — saves record and updates user's `lastActive`.
    - `getUserScanHistory(userId)` — returns array of `ScanRecord`.
    - `getAllScanHistory()` — admin view of all records.
    - `deleteScanRecord(recordId)` — deletes a record.
    - `getScanRecordsByCondition(userId, condition)` — filtered view.
    - `subscribeToUserScanHistory(userId, onUpdate)` — real-time updates via `onSnapshot`.
    - `updateUserHealthTips(userId, healthTips)` — patch tips array in users doc.
  - Used by: History pages, Admin pages, tips generator.

- `lib/analyzeFood.ts`
  - Purpose: Orchestrate LLM calls to analyze food and fallback logic.
  - Key function: `analyzeFood(nutritionData, extra, options?)` — returns `{ prediction, reasoning, nutritionSummary }`.
  - Behavior: Calls Gradio/LLM; on error calls `fallbackAnalysis`.

- `lib/fallbackAnalysis.ts`
  - Purpose: Deterministic rules for analysis when LLM fails.
  - Key function: `fallbackAnalysis(nutritionData, unit)` — supports `reni` and `grams` logic.

- `lib/promptBuilder.ts`
  - Purpose: Build prompts for the LLM from nutrition data and user condition.

- `lib/parseLlm.ts` and `lib/parseImageLlm.ts`
  - Purpose: Parse raw LLM responses into normalized JSON / tip arrays.

- `lib/analyzeImage.ts`
  - Purpose: Extract nutrition data from image (OCR/label heuristics).

- `lib/utils.ts`, `lib/bmiUtils.ts` — utility functions used across UI.

#### Admin folder (`client/src/admin`)

- `admin/lib/auditLog.ts`
  - Purpose: Create audit log entries for auth, scans, and profile updates.
  - Key functions: `createAuthAuditLog`, `createScanAuditLog`, `createProfileAuditLog`.
  - Where used: `auth.ts`, `firestore.ts` (save record), profile update flows.

- `admin/lib/analytics.ts`
  - Purpose: Aggregation/analytics helpers for admin dashboards (e.g., counts, trends).

- `admin/hooks/useAdminUsers.ts`
  - Purpose: Custom hook to list/search users and manage pagination/sorting.

- `admin/components/*` and `admin/pages/*`
  - Admin UI: `AuditLogs.tsx`, `Dashboard.tsx`, `Users.tsx`, `UserDetailsModal.tsx`, `AuditLogList.tsx`.

### `client/src/components` (selected, excluding `ui/*`)

- `components/auth/*` — AuthForm, LandingPage.
- `components/common/*` — HomeHero, QuickActions, RecentScansCard, MedicalDisclaimer.
- `components/health/*` — AllScanHistoryTab, HealthAssessment, HistoryAnalytics, RecordDetailsDialog, ScanHistory.
- `components/layout/*` — AppHeader, Navigation.
- `components/profile/*` — UserProfile (main), BasicInfoSection, BMISection, DemographicSection, MedicalSection, TreatmentSection, ProfileActions.
- `components/scanner/*` — CameraScanner, HealthAssessmentImage, ScanHistory UI.

Where used: pages and contexts that need those UI pieces.

### `server/`
- `server/index.ts` — Node/Express server entry (dev server for APIs or server-side tasks).
- `server/vite.ts` — server-side helper to work with Vite dev server.

### `shared/`
- `shared/schema.ts`
  - Purpose: Zod validation schemas shared by client and server.
  - Key schemas: `userProfileSchema`, `analyzeFoodSchema`, `scanRecordSchema`.
  - Used by: `client/src/lib/auth.ts` (validate profiles before saving), tests.

### `test/` (tests)
- Each file under `test/` covers a specific slice of behavior: `auth.test.ts`, `integration.test.ts`, `profile.update.test.ts`, `history.save.test.ts`, `history.view.test.ts`, `auditlogs.test.ts`, `scanner.*.test.ts`, `tips.generate.test.ts`, `validation.test.ts`, `auth.createUserProfile.test.ts`.

### `test-setup/`
- `test-setup/vitest.setup.ts`
  - Purpose: Mocks `@/lib/firebase` and underlying `firebase/*` SDK modules early in test runs so real Firebase initialization does not occur in CI or local tests.
  - Note: This file is referenced from `vitest.config.ts` as a `setupFiles` entry.

---

## Developer Quick-start

1. Install dependencies
```bash
npm install
```

2. Development

- Start server (if you use it):
```powershell
npm run dev
```

3. Tests

- Run unit/integration tests:
```bash
npm test
```

Note: Tests use `test-setup/vitest.setup.ts` to mock Firebase modules. CI does not need real Firebase credentials for the unit tests.

---

## Recommended next steps & notes

- Keep `shared/schema.ts` authoritative to prevent desync between client/server data shapes.
- If you want real-integration tests with Firebase, add a separate test-suite that supplies real credentials through CI secrets and runs against an isolated Firebase project.
- If you want diagrams in README, I can add Mermaid diagrams for architecture and flows.

---

If you want I will commit this `README.md` to the repository and also produce Mermaid diagrams (architecture and data flow) inline in the README. Tell me which diagrams you'd like.
