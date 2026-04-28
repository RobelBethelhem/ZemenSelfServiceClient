# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Zemen Bank Self Service Portal (`@zemenbank/ssp-frontend`). React 18 SPA originally forked from the CoreUI Free React Admin Template (the upstream `README.md` has not been replaced and is *not* a description of this project — ignore most of it). Bundler is Vite. The deployed app is hosted under `/zbss/` on `aps2.zemenbank.com`, which is why `vite.config.mjs` sets `base: './'` and the QR codes in the codebase point at that subpath.

## Core domain flow (read this first)

The whole product is a letter-issuance loop. **A user submits a letter request → an admin approves it → either party prints the rendered letter (with a reference number + QR code) → an external party scans the QR to verify authenticity on a public page.** Everything else (auth, roles, navigation, push notifications, the bingo/voting modules) is supporting machinery around that loop.

**Five letter types**, each with its own request form, approval endpoint, render-and-print view, and backend resource segment: `experiance`, `embassy`, `guaranty`, `supportive` (with English + Amharic variants), `medical`. The request_type string for guaranty is canonically misspelled **`guranty`** (no 'a') across endpoints, switch cases, and navigation — do not "fix" without backend coordination.

### 1. User submits a request — `/user/{type}` routes
Forms in `src/views/admin/{Experiance_Letter, Letter_Of_Embassy, Guaranty_Letter, Supportive_Letter, Medical}/*.js`. They `POST …/api/{type}/register_request_{type}` with `x-access-token`. Request lands as **Pending**.

### 2. User tracks requests — `/admin/candidate` ("My Request")
`src/views/admin/Candidate/candidate.js` — `material-react-table` fed by `GET …/api/rms/admin/landing/get_candidate`. `handlePrintClick` reads `row.original.request_type` (and `language` for supportive) and `navigate(...)` to the matching letter-render route, passing the row via `location.state.rowData`:
- `experience` → `/admin/experiance`
- `supportive` (english) → `/admin/supportive`; (else) → `/admin/supportive-am`
- `guranty` → `/admin/guaranty`
- `embassy` → `/admin/embassy`
- `medical` → `/admin/medical`

### 3. Admin approves/rejects — `/admin/approval`
`src/views/admin/Approval/approval.js` — **note: this file is ~7200 lines, but only the section starting around line 5621 is live; everything before that is commented-out earlier versions.** Mutations live in `src/views/admin/Approval/ApprovalEndpoint.js`:
- Approve: `PATCH …/api/{type}/view_request_{type}` (the body sends blank fields — the endpoint just marks the row as viewed/issued; the form fields are vestigial).
- Reject: `PATCH …/api/{type}/reject_request_{type}` with `{ id, rejection_reason }`.

Both are `useMutation` hooks that switch on `request_type` to pick the endpoint. The status transitions Pending → **Viewed** (genuine/issued) or → **Rejected**; backend can also flip a Viewed letter to **Revoked** later.

### 4. Render & print — `src/views/admin/Letters/{Experiance,Guarenty,Embassy,Supportive,Supportive_Amharic_v1,Medical}.js`
These pages take `location.state.rowData`, render the letter (bank letterhead, paragraph text, reference number, QR code from `QRCodeWithLogo` pointing at `${__VERIFY_URL_BASE__}/${reference_number}`), and expose a Print button. `handlePrint`:
1. Re-validates the access token via `/verify-token` (so an expired session bounces to login mid-print).
2. `html2canvas` snapshots the letter `div`.
3. Opens a new window with an A4-sized `<img>` and triggers `window.print()`.

There's a "without letterhead" toggle for printing on pre-printed paper, plus a `jsPDF` path for PDF download. **These letter files are also large with heavily commented-out earlier versions** — search for the actual `import` block at the top of the live section, not line 1.

### 5. Public verification — `/verify/:ref` (unauthenticated)
`src/views/pages/verify/VerifyLetter.js` calls `GET …/api/public/verify?ref=…` and renders a status banner: **Genuine** (Viewed), **Awaiting Approval** (Pending), **Rejected**, or **Revoked**, with the reference number and relevant date. This route bypasses `PrivateRoute` and is the only thing the QR code resolves to.

## Backend pairing

The backend is a separate repository at `D:\self_service_backend` (Node.js + Express, ES modules, deployed under IIS via `iisnode` — entry: `run.cjs` → `server.js`, port 8081). All routes are mounted under `/zbss/api/...`, which is exactly what this frontend hardcodes.

### Stores
- **MongoDB** (Mongoose, URI in `process.env.DB`) — primary store for users, letter requests, refresh tokens, push subscriptions.
- **MS SQL Server** (`mssql`, see `utils/rms/test.js`) — read-only HRIS lookups: names, salary, job grade, position history, employment date, place of assignment, photo, active guaranty count. **HRIS is the source of truth for employee data**; the Mongo letter doc is a snapshot that gets re-pulled and overwritten on approval.
- **LDAP** (`ldapjs`, `utils/rms/ldapConnect.js`) — login validates the password against Active Directory at `ldap://mbdcp06.zemenbank.local:389` (binds as `Zemenbank\<username>`). The Mongo `User` doc supplies role/profile metadata only.

### Auth model end-to-end
- `POST /login` → looks up user in Mongo by email/name → calls LDAP `bind` with `Zemenbank\username` + password → on success, `generateTokens.js` issues an **access token (15 min)** and **refresh token (30 days)** signed with `ACCESS_TOKEN_PRIVATE_KEY`/`REFRESH_TOKEN_PRIVATE_KEY`. Refresh token is also persisted in `UserToken` Mongo collection.
- `middleware/rms/auth.js` reads `x-access-token`, rejects if blacklisted in `UsedToken`, verifies signature, attaches `{ _id, roles }` to `req.user`.
- `middleware/rms/roleCheck(["admin"])` checks `req.user.roles` overlap.
- The frontend's `PrivateRoute` calls `verify-token` on every mount but **never refreshes**; the backend has `POST /refreshToken` but no frontend code uses it. So sessions effectively last 15 minutes — when the access token expires the user is bounced to login.
- Logout: `DELETE /refreshToken/` with `x-refresh-token` deletes the row from `UserToken`.

### Letter endpoints (per type)

Each letter type has the same triplet of endpoints, plus Guaranty's revoke. Body validation lives in `utils/rms/serveService.js` (Joi schemas).

| Frontend call | Backend handler | What it does |
|---|---|---|
| `POST /{type}/register_request_{type}` | `routes/rms/{Type}.js` | `auth` + `roleCheck(["user","admin"])`. Validates body. Pulls fresh HRIS via `test()` and **rejects on name mismatch** ("please contact HR Team"). Saves Mongo doc with `status: "Pending"`. Push-notifies all admins. |
| `PATCH /{type}/view_request_{type}` | same file | `roleCheck(["admin"])`. **Rejects self-approval.** Re-pulls HRIS and overwrites snapshot fields with fresh data (proper-cased names). Generates a `reference_number` from the type's per-year counter (`{Type}Counter.getNextReference()` → `ZB/HC/{EXP\|EMB\|GUY\|...}/00001/25`). Sets `status: "Viewed"`. Push-notifies the requester. |
| `PATCH /{type}/reject_request_{type}` | same file | `roleCheck(["admin"])`. **Only `Pending` requests can be rejected.** Sets `status: "Rejected"`. The body's `rejection_reason` is read but the save line is commented out — **rejection reason is currently dropped**. |
| `PATCH /guaranty/revoke_guaranties` | `Guaranty.js` | Bulk: `{ ids: [...] }`. Sets `status: "Revoked"`, `revoked_date`, `revoked_date_amharic` (Ethiopic calendar via `ethiopic-date`). Sets `employee_count: 0` but **intentionally does not decrement `GuarantyTrack.guaranty_count`**. Guaranty-only. |

### Per-type quirks the backend enforces (frontend won't catch these)
- **Experience**: 90-day cooldown — refuses if the user has any Pending or Viewed Experience request within the last 90 days.
- **Embassy**: refuses while a Pending Embassy already exists. Computes `annual_salary = monthlySalary * 12`, pulls `employee_position` and `date_of_employment` from HRIS.
- **Guaranty**: HRIS `guaranteCount` check — refuses approval if user already has ≥2 active guaranties. On approval, syncs `GuarantyTrack` Mongo collection with HRIS count, computes Amharic Ethiopic dates, and pushes Amharic names back to HRIS via `updateAmharicNames` if missing.
- **Supportive**: has `language: "english" | "amharic"` field; uses `getPlaceOfAssignment` and `getUserPhoto` from HRIS.
- **Medical**: `is_Spouse` boolean switches between spouse/child fields. Has its own `MedicalProvider` collection (hospital list) at `/zbss/api/medical-provider`. **Medical letters are not searched by the public verify endpoint** — scanning a medical letter QR returns `not_found`.

### Status state machine (canonical, server-side)
```
Pending  ──admin approve──▶  Viewed   ──guaranty revoke──▶  Revoked
   │
   └──admin reject──▶  Rejected
```
Mongoose enums: `["Pending", "Viewed", "Rejected", "Revoked"]` (Embassy lacks `Revoked`).

### List endpoint — `GET /rms/admin/landing/get_candidate`
`routes/rms/Admin/Landing/Candidate_Landing.js`. Branches on role: `user` sees only their own (`domain_user: user.user`), `admin` sees all. Concatenates Experience + Supportive + Guaranty + Embassy + Medical into one array. Special-cases Medical: copies spouse/child names into `employee_first/middle/last_name` so the frontend table displays them. Joins Guaranty rows with `GuarantyTrack` to add `guaranty_count`. Naive XSS scrub drops any doc whose string field contains `<`, `>`, `script`, `iframe`, or `alert`. **The query params (`filters`, `globalFilter`, `sorting`) the frontend sends are ignored** — sorting/filtering happens client-side in `material-react-table`.

### Public verify — `GET /public/verify`
`routes/rms/PublicVerify.js`. Searches Experience, Embassy, Guaranty, Supportive collections in parallel for a matching `reference_number`, returns `{ valid, status, letter_type, reference_number, employee_name, issued_date, rejected_date, revoked_date }`. **`valid` is true only when `status === "Viewed"`.**

> **⚠️ Known mismatch to verify before relying on the verify page.** The frontend was recently changed to send `?ref=…` as a **query parameter** (commit `2e81f1b`), but the live backend route is `router.get("/verify/*", ...)` and reads `req.params[0]` — i.e. it expects the ref as a **path segment**. With Express, `GET /verify?ref=ABC` does not match `/verify/*`. Either the production deployment has a newer handler that reads `req.query.ref`, or the verify page silently shows "service_unavailable" in production. If you're touching this flow, confirm the live behaviour first.

### Push notifications
`web-push` with VAPID keys (`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` in env). `utils/rms/pushNotificationService.js` exposes `sendToRole('admin', payload)` (used on new request) and `sendToUser(userId, payload)` (used on status change). Subscriptions live in `PushSubscription` Mongo collection, populated by frontend via `POST /zbss/api/push/subscribe`. **In the current checkout the entire `pushNotificationService.js` body is commented out** — push delivery silently no-ops. Every call site swallows push errors, so request handlers still succeed regardless. Confirm against the running deployment before relying on push.

### Legend: Mongo `request_type` strings
The exact strings used in `request_type` fields and route segments. Stay consistent — these flow into the frontend switches:
| Letter | `request_type` | Route segment | Counter prefix |
|---|---|---|---|
| Experience | `"Experience"` | `/experiance` | `ZB/HC/EXP/00001/25` |
| Embassy | `"Embassy"` | `/embassy` | `ZB/HC/EMB/00001/25` |
| Guaranty | `"Guranty"` *(typo is canonical)* | `/guaranty` | `ZB/HC/GUY/00001/25` *(GUY, not GUA)* |
| Supportive | `"Supportive"` | `/supportive` | `ZB/HC/SUP/00001/25` |
| Medical | `"Medical"` | `/medical` | `ZB/HC/MED/{SP\|CH}/00001/25` *(extra segment for spouse vs child)* |

### Backend models (per letter type)

Each letter type is its own Mongoose collection in `models/rms/`. The schemas share a common skeleton plus per-type fields. Knowing this layout is what you need to add a new letter type.

**Common fields every letter has** — copy these into a new schema verbatim:
```js
employee_first_name, employee_middle_name, employee_last_name  // String, required, trim
domain_user        // String, required — AD username of requester (links to User.user)
employee_description                                            // String, trim — user's free-text reason
request_type       // String, default: "<TypeName>" — must match the case used in switches
viewed_by          // String — admin who approved (set on status=Viewed)
viewed_date        // Date — also reused as the rejection date when status=Rejected
status             // String, enum (varies, see below), default "Pending"
TimeStamp          // Date, default Date.now — request creation time
reference_number   // String — populated on approval from <Type>Counter.getNextReference()
```

**Per-type unique fields:**

| Model file | Required extras | Optional/computed |
|---|---|---|
| `Experiance_Letter.js` | `job_grade` *(filled from HRIS)* | `salary`, `employee_count`, `experiences: [ExperienceItemSchema]` (sub-doc array of `{period, position, isCurrent}`) |
| `Letter_of_Embassy.js` | `employee_embassy_name`, `annual_salary` *(monthly × 12)*, `employee_position`, `date_of_employment` | `embassy_location` *(default "Addis Ababa")* |
| `Guaranty_Letter.js` | `guaranty_first_name`, `guaranty_middle_name`, `guaranty_last_name`, `guaranty_organazation` *(typo)*, `guaranty_organazation_cities` *(typo)* | `employee_count`, `salary`, `employee_organization_location`, `request_day_amharic`, `approved_day_amharic`, `revoked_date`, `revoked_date_amharic` |
| `Supportive_Letter.js` | `employee_organazation` *(typo)* | `language` *(enum: `amharic`/`english`, default `amharic`)*, `salary`, `request_day_amharic`, `request_day_english`, `approved_day_amharic`, `approved_day_english`, `date_of_employment_amharic`, `date_of_employment_english`, `employee_count`, `employee_organization_location`. **Heads-up:** the schema's required `employee_organazation` does NOT match what the route actually saves (spouse/child/medical_place fields per `supportive_letter_BodyValidation`). The model is stale; the route saves a flexible body. If you touch this, treat the route's body shape as ground truth, not the model. |
| `Medical.js` | `is_Spouse` *(Boolean)*, `medical_place`, `employee_id_no`, `place_of_assignment` | `spouse_first/middle/last_name`, `child_first_name`, `chid_middle_name` *(typo)*, `child_last_name`, `name_of_supervisor` *(default `"Nuru Mustefa"`)*, `rejection_reason` *(only Medical persists this)*, `employee_count` |

**Status enum varies by letter type** — pay attention when adding a new type:
- **Experience, Guaranty, Supportive**: `["Pending", "Viewed", "Rejected", "Revoked"]`
- **Embassy, Medical**: `["Pending", "Viewed", "Rejected"]` (no `Revoked`)
- Only Guaranty actually exposes a revoke endpoint (`PATCH /guaranty/revoke_guaranties`); the `Revoked` value in Experience/Supportive enums is unused at present.

**Counter pattern** — every letter type has its own `<Type>Counter` model in `models/rms/`. They are nearly identical:
```js
schema: { year: Number (unique), count: Number (default 0) }
statics.getNextReference()  // upserts the year row, $inc count, returns "ZB/HC/<PFX>/00001/25"
```
Counter rows are per-year, so each new calendar year starts fresh at `00001`. Medical is the only one whose `getNextReference(is_Spouse)` takes an argument and inserts an `SP`/`CH` segment.

**Auxiliary collections that letters depend on:**
- `User` (`models/rms/user.js`) — Mongo profile. Fields: `first_name, last_name, employee_id, user, position, department, email (unique), password, roles: ["user"|"admin"], status`. The `user` field is the AD `sAMAccountName` and is what `domain_user` on each letter doc references.
- `GuarantyTrack` — `{domain_user (unique), guaranty_count, last_updated}`. Mirror of HRIS guaranty count to enforce the 2-active-guaranty rule.
- `MedicalProvider` — hospital list `{short_code (unique, uppercase), medical_institution, location, telephone_no}`. Populates the `medical_place` dropdown in Medical letter forms.
- `UsedToken`, `UserToken`, `PushSubscription` — auth/notification plumbing, not letter-specific.

### Checklist: adding a new letter type

When the user wants to introduce a new letter (e.g. "Recommendation Letter"), the work spans both repos. Don't claim it's wired up until every step below is done.

**Backend (`D:\self_service_backend`)**:
1. **Model** `models/rms/Recommendation_Letter.js` — copy `Experiance_Letter.js`, swap `request_type` default to `"Recommendation"`, add type-specific required fields, set the appropriate status enum.
2. **Counter** `models/rms/RecommendationCounter.js` — copy any existing counter, change `ZB/HC/EXP` to a new 3-letter prefix (`ZB/HC/REC`).
3. **Joi validator** in `utils/rms/serveService.js` — add `recommendation_letter_BodyValidation` matching the new fields.
4. **Routes** `routes/rms/Recommendation.js` — provide three handlers:
   - `POST /register_request_recommendation` (`auth` + `roleCheck(["user","admin"])`) — pull HRIS via `test()`, validate body, save with `status: "Pending"`, push-notify admins.
   - `PATCH /view_request_recommendation` (`roleCheck(["admin"])`) — block self-approval, re-pull HRIS, generate reference number, set `status: "Viewed"`, notify requester.
   - `PATCH /reject_request_recommendation` (`roleCheck(["admin"])`) — only `Pending` rows can transition to `Rejected`. (If you persist `rejection_reason`, you'll be the first — every other handler reads it but the save line is commented out.)
5. **Mount** in `server.js` — `app.use("/zbss/api/recommendation", RecommendationRoutes)`.
6. **List endpoint** `routes/rms/Admin/Landing/Candidate_Landing.js` — import the new model, query it under both the `user` and `admin` branches, concatenate it into `mergedArray`. Without this step the new letter will not appear in "My Request".
7. **Public verify** `routes/rms/PublicVerify.js` — add the new model to the `Promise.all` lookup and the `hit` chain. (Skip if the new letter shouldn't be publicly verifiable — Medical is currently skipped this way.)

**Frontend (`D:\ZemenSelfServiceClient`)**:
1. **Request form** — new directory under `src/views/admin/` (e.g. `Recommendation_Letter/Recommendation_Letter.js`). Posts to `…/api/recommendation/register_request_recommendation` with `x-access-token`.
2. **Render-and-print view** — new file in `src/views/admin/Letters/Recommendation.js`. Reads `location.state.rowData`, renders the letter with reference number + `QRCodeWithLogo`, implements `handlePrint` (token re-verify → `html2canvas` → new window → `window.print()`).
3. **Routes** `src/routes.js` — register both views (`/user/recommendation` and `/admin/recommendation`) with appropriate `roles` arrays.
4. **Sidebar** `src/_nav.js` — add the new link under both `userRole === 'user'` and `'admin'` branches if both should see it.
5. **Candidate routing** `src/views/admin/Candidate/candidate.js` `handlePrintClick` — add a switch case for the new `request_type.toLowerCase()` that navigates to `/admin/recommendation`.
6. **Approval wiring** `src/views/admin/Approval/ApprovalEndpoint.js` — add `case 'recommendation':` in both `useApproveRequest` and `useRejectRequest` switches with the new endpoint URLs.
7. **Approval display** `src/views/admin/Approval/approval.js` — add the new `request_type` to whatever colour/icon helpers are in the live code (around line 5621+).

**Naming consistency to maintain (or break deliberately):**
- Casing in `request_type` — match the model default exactly (e.g. `"Recommendation"`, not `"recommendation"`). Frontend switches use `.toLowerCase()` so they don't care, but the backend list endpoint compares with `===`.
- Prefer correct spelling for new types. The existing `Guranty`/`organazation`/`chid_middle_name` typos are canonical only because changing them would require a backend data migration; don't perpetuate the pattern.
- Counter prefix is 3 letters (`EXP`, `EMB`, `GUY`, `SUP`, `MED`); pick a new 3-letter code that doesn't collide.

## Commands

```bash
npm install          # install deps (no lockfile is committed; see .gitignore)
npm start            # vite dev server on http://localhost:3800
npm run build        # production build → ./build
npm run serve        # vite preview of the production build
npm run lint         # eslint over src/**/*.js (prettier rules are enforced via eslint)
```

There is no test runner configured. There is no `lint --fix` script, but `eslint --fix "src/**/*.js"` works; formatting comes from `.prettierrc.js`.

## Architecture

### Entry & routing

- `src/index.js` mounts `<App/>` inside `<Provider>` + `<PersistGate>`.
- `src/App.js` uses **`HashRouter`** (URLs look like `/zbss/#/...`). Three top-level routes:
  - `/` → `Login`
  - `/verify/:ref` → `VerifyLetter` — **public, unauthenticated** letter-verification page reachable from QR codes printed on letters.
  - Everything else → `PrivateRoute` wrapping `DefaultLayout`, which renders the sidebar/header/footer chrome plus `AppContent`.
- `src/components/AppContent.js` consumes `src/routes.js` and wraps each entry in another `PrivateRoute` using `route.roles`. Most routes are gated to `['admin', 'user']` or `['admin']`; the JWT's `roles[0]` is the source of truth.
- `src/_nav.js` exports `_nav(userRole)` — sidebar items are conditionally included based on role. When adding a route, also wire it into `_nav.js` (and check both `admin` and `user` branches) or it won't appear in navigation.

### Auth

- `src/privateRoute.js` reads `state.user.accessToken` from Redux, then calls `POST https://aps2.zemenbank.com/zbss/api/verify-token` on every mount to validate before rendering. While the request is in flight it shows a full-screen logo + spinner. `jwt-decode` extracts `roles[0]` for role checks.
- Tokens live in Redux state (`user.accessToken`, `user.refreshToken`, `user.role`) and are persisted via `redux-persist` to **sessionStorage** (`src/store.js`). Logout dispatches `{ type: 'clearUser' }`.
- The Redux store is intentionally a legacy `createStore` + manual reducer (no Redux Toolkit slices despite `@reduxjs/toolkit` being installed). Action types are bare strings: `set`, `setUser`, `clearUser`, `light`, `dark`, `setAggrement`, `clearggrement` (note misspelling), `setSiteManagerID`, `clearSiteManagerID`, `Voted`.

### Backend API (frontend-side notes)

- Backend base URL `https://aps2.zemenbank.com/zbss/api` is **hardcoded in ~28 source files** rather than centralised. There is no API client wrapper. When changing endpoints, grep for `aps2.zemenbank.com/zbss/api` to find every callsite.
- `vite.config.mjs` defines a dev proxy at `/api → http://aps2.zemenbank.com/zmss` (note `zmss` vs `zbss`), but the rewrite line contains a malformed regex (`/^\https://...api/`) and the codebase mostly calls absolute URLs anyway, so the proxy is effectively unused.
- For backend handler details (auth, validation, HRIS lookups, status transitions, per-type quirks), see the **Backend pairing** section above. The backend repo is at `D:\self_service_backend`.

### Build-time globals

`vite.config.mjs` injects these via `define` — they're available as bare identifiers in source (used by `src/components/BuildBadge.js`):

- `__APP_BRANCH__`, `__APP_COMMIT__`, `__APP_BUILD_TIME__` — populated from `git rev-parse` at build time, fall back to `'unknown'`.
- `__VERIFY_URL_BASE__` — read from env `VITE_VERIFY_URL_BASE`, defaults to `https://aps2.zemenbank.com/zbss/#/verify`. Used to build QR codes that target the verify page.

A `BuildBadge` is rendered on any build whose branch is not `main`/`master`/`unknown`; it pins a "PREVIEW" pill bottom-right and prefixes the document title with `[branch]`. Don't be alarmed by it on dev/preview builds.

### Layout

- `src/views/admin/{Experiance_Letter, Letter_Of_Embassy, Guaranty_Letter, Supportive_Letter, Medical}` — the **request forms** (step 1 of the flow).
- `src/views/admin/Candidate` — **My Request** list (step 2).
- `src/views/admin/Approval` — **admin approval/rejection** (step 3).
- `src/views/admin/Letters` — **letter render-and-print** views (step 4).
- `src/views/pages/verify` — **public verification** page (step 5).
- `src/views/admin/{BingoGame, BingoTv, GoldDiggerGame, GoldDiggerMulGame, Vote, Vote_Stastics, Game, Candidate, Chat, dashbord}` — auxiliary modules unrelated to the letter flow.
- Many directories contain `*.clone.js`, `*clone2.js`, `aa.js`, `*Endpoint.js`, etc. — working copies / scratch files kept alongside the live module. Treat them as historical unless the task is specifically to clean them up.
- `src/views/pages/login` and `src/views/pages/verify` — the two unauthenticated pages.
- `src/utils/pushNotificationUtil.js` + `public/sw.js` + `src/components/PushNotificationManager.js` + `src/views/NotificationSettings.js` — Web Push notification subsystem; `DefaultLayout` registers the service worker once an access token is present.

### Styling

- SCSS via `src/scss/style.scss` (CoreUI base) + Tailwind (config not committed at root — uses defaults; PostCSS pipeline is `autoprefixer` only per `vite.config.mjs`).
- UI components mix `@coreui/react`, MUI (`@mui/material`, `material-react-table`), Heroicons, and Lucide. There is no single "house" component library; follow the dominant pattern in the file you're editing.

## Conventions

- Commit style follows `.github/COMMIT_CONVENTION.md` (Angular-style `<type>(<scope>): <subject>`).
- ESLint extends `plugin:react/recommended` + `plugin:prettier/recommended`. Formatting violations surface as ESLint errors.
- Many files contain large blocks of commented-out previous implementations (e.g. `src/store.js`, `src/components/LogOut.js`, `src/layout/DefaultLayout.js`). This is the project's normal state — don't reflexively delete these unless the task calls for it.
- The `path/src` directory at the repo root and `Client.zip` / `vite.config.mjs.timestamp-*.mjs` files are leftover artefacts; they're not part of the build.
