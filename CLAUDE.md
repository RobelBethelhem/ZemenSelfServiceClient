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
`routes/rms/PublicVerify.js`. Single handler bound to **two route patterns** — `["/verify", "/verify/*"]` — and reads `ref` as `(req.query.ref) || req.params[0]`, so both `GET /verify?ref=X` (frontend's actual call shape) and `GET /verify/X` (path-segment style) work.

Searches Experience, Embassy, Guaranty, Supportive collections in parallel for a matching `reference_number`. **Plus** a 5th lookup that fires only when `ref` matches `/^[0-9a-fA-F]{24}$/` (i.e. an ObjectId): `SalaryIncrementLetter.findById(ref).populate("import_batch_id")`. That lookup powers the salary-increment QR codes (which encode the letter's `_id` rather than the shared batch reference — see the Salary Increment section below).

For the four classic letters: returns `{ valid, status, letter_type, reference_number, employee_name, issued_date, rejected_date, revoked_date }` with `valid: status === "Viewed"`. For salary letters: same payload shape plus `fiscal_year` and `category`, with `valid: status === "Committed"`.

### Push notifications
`web-push` with VAPID keys (`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` in env). `utils/rms/pushNotificationService.js` exposes `sendToRole('admin', payload)`, `sendToUser(userId, payload)`, plus `createNewRequestPayload` / `createStatusUpdatePayload` factories. Subscriptions live in the `PushSubscription` Mongo collection, populated by frontend via `POST /zbss/api/push/subscribe`. The live class implementation starts around line 242 of the file — earlier versions of the same class sit above it as commented-out history (a pattern across this codebase). Every call site wraps push calls in try/catch so push errors never block the request handler.

### Legend: Mongo `request_type` strings
The exact strings used in `request_type` fields and route segments. Stay consistent — these flow into the frontend switches:
| Letter | `request_type` | Route segment | Counter prefix |
|---|---|---|---|
| Experience | `"Experience"` | `/experiance` | `ZB/HC/EXP/00001/25` |
| Embassy | `"Embassy"` | `/embassy` | `ZB/HC/EMB/00001/25` |
| Guaranty | `"Guranty"` *(typo is canonical)* | `/guaranty` | `ZB/HC/GUY/00001/25` *(GUY, not GUA)* |
| Supportive | `"Supportive"` | `/supportive` | `ZB/HC/SUP/00001/25` |
| Medical | `"Medical"` | `/medical` | `ZB/HC/MED/{SP\|CH}/00001/25` *(extra segment for spouse vs child)* |
| Salary Increment & Bonus | `"SalaryIncrement"` | `/salary-increment` | **No counter** — reference number is admin-typed at import time and shared across the entire batch. See the Salary Increment section. |

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
- **If the new letter is admin-imported instead of user-requested** (i.e. it follows the Salary Increment pattern, not the request → approve → print flow), don't use this checklist. The shape is fundamentally different — see the Salary Increment & Bonus section below for the precedent.

## Salary Increment & Bonus letter (admin-imported, separate flow)

Annual salary letter generated from a workbook the admin imports once a fiscal year. **Structurally different** from the five letters above — there's no user-initiated request and no admin approval gate. The Board of Directors approval happens off-system; the admin import *is* the issuance event. Each user must then accept a 6-month commitment before they can print.

**Independence is intentional.** The whole feature lives in its own subdirectory on each side and does not import from the other five letters. Removing every file under `src/views/admin/SalaryIncrement/` and the `routes/rms/SalaryIncrement.js` mount + the `routes/rms/PublicVerify.js` ObjectId branch would restore the codebase to its pre-feature state.

### Five categories

Each category renders a slightly different letter body. The **Excel sheet name = the category**, matched case-insensitively:

| Category | Distinguishing field(s) | Body paragraph |
|---|---|---|
| `Full` | `bonus_months` | "you will be awarded your N month's salary as a one-time performance based bonus." |
| `Proportionate` | `bonus_months` | "you will be awarded **proportionate amount of** your N month's salary…" |
| `Discipline` | `bonus_months` + `discipline_pct` (decimal 0–1) | "you will be awarded **75%** of your N month's salary…" |
| `Salary Only` | — | *no bonus paragraph; subject line drops "and Bonus"* |
| `Promotion` | `salary_after_promotion_adjustment` + new job position/grade/step + `bonus_months` (decimals OK) | Two paragraphs — the salary increase, then "Furthermore, due to your promotion…" |

### Lifecycle

```
[Admin imports xlsx]                     [User signs in,            [User clicks Print]
   ↓                                      accepts 6-month                ↓
SalaryIncrementImport (per FY)            commitment]              html2canvas → A4 print window
SalaryIncrementLetter (per user, per FY)         ↓                         ↓
   status: "Imported"                     status: "Committed"      POST /mark-printed (owner only)
                                          (only the named                  ↓
                                          employee can do this)     printed_count + first_printed_at
                                                                    + last_printed_at updated
[Admin can revoke at any time]
   PATCH /revoke
   status: "Revoked"  ──→  user can no longer print; QR resolves to "Letter Revoked"
```

`/commit` is **owner-only**; admins cannot accept on someone's behalf. `/mark-printed` is **owner-only** too — admin reference-copy prints from the list page deliberately bypass it (see "Admin reference printing" below).

### Backend models — no counter

`models/rms/SalaryIncrementImport.js`:
- One row per `fiscal_year` (unique index).
- Holds `reference_number` (**admin types this in at import time**, e.g. `ZB/HC/2198/2025` — the Board's actual decision-document number), plus `effective_date`, `board_meeting_date`, `letter_date`. All four fields render verbatim on every letter in the batch.
- No counter file. The reference is shared across the batch, not auto-generated per letter.

`models/rms/SalaryIncrementLetter.js`:
- One row per `(domain_user, fiscal_year)` (compound unique index). Status enum: `["Imported", "Committed", "Revoked"]`.
- References the batch via `import_batch_id` (populated when the frontend reads it).
- Carries category-specific fields: `bonus_months`, `discipline_pct`, all the Promotion fields (`old_/new_job_position`, `_grade`, `_step`, `salary_after_promotion_adjustment`, `promotion_commitment_text`).
- Audit fields: `commitment_date`, `commitment_user_agent`, `commitment_ip`, `printed_count`, `first_printed_at`, `last_printed_at`, `revoked_by`, `revoked_date`, `revoke_reason`.

### Backend endpoints — mounted at `/zbss/api/salary-increment`

`routes/rms/SalaryIncrement.js`:

| Method | Path | Role | Purpose |
|---|---|---|---|
| `POST` | `/import` | admin | Multipart upload. Form fields: `file`, `fiscal_year`, `reference_number`, `effective_date`, `board_meeting_date`, `letter_date`, optional `overwrite=true`. Parses workbook with `xlsx`, validates each row against the `User` collection (case-insensitive on `domain_user`), saves letters, push-notifies each affected user. |
| `GET` | `/my` | user, admin | Caller's own letters, populated with batch, sorted newest-first. |
| `POST` | `/commit` | **owner only** | Body `{id}`. Refuses unless status is `Imported` and caller's `domain_user` matches the letter (case-insensitive). Captures user-agent and best-effort IP (reads `x-forwarded-for` for the IIS proxy). |
| `POST` | `/mark-printed` | **owner only** | Body `{id}`. Refuses unless status is `Committed`. Increments `printed_count`. Admins are intentionally rejected here — see "Admin reference printing". |
| `GET` | `/list` | admin | `material-react-table`-shaped: `{data, meta:{totalRowCount}}`. Filters: `fiscal_year`, `category`, `status`, `domain_user`, plus a general `q` that does OR-search across `domain_user`, `employee_name`, `first_name`, **and the populated batch's `reference_number`** (extra subquery to find matching batch ids). Pagination capped at 200/page. |
| `PATCH` | `/revoke` | admin | Body `{id, reason}`. Sets `Revoked` from any state except already-Revoked. |

Mounted in `server.js` near the other `/zbss/api/...` routes — purely additive `app.use("/zbss/api/salary-increment", SalaryIncrement)`.

### Excel parser — `utils/rms/salaryIncrementParser.js`

Pure function `parseSalaryWorkbook(buffer) → {rows, sheet_warnings, row_errors}`. No DB access; the route does the User lookup and inserts on top.

- **Sheet name → category**: case-insensitive match. `"Salary Only (less than 6 months)"` matches the prefix `"salary only"`.
- **Header row auto-detected**: scans for a row containing `Domain Name` or `Employee Name`. Lets the Salary Only sheet's section-header row above the column headers exist without breaking the parser.
- **Accepted typos**: the workbook's `Proportinate Amount of Bonus` (missing 'o') is matched alongside the corrected spelling. We honor the existing-spreadsheet typo so the admin doesn't have to retype headers.
- **`%age` cell coercion**: accepts `0.75` (decimal form) or `75` (percent form ≤100); both normalize to a 0–1 decimal in `discipline_pct`. Rendered as `Math.round(pct * 100)%` in the letter.
- **Per-row errors collected, never abort**: missing fields, invalid numbers, duplicate domain_user within the workbook all surface as `row_errors[]` entries with `excel_row` line numbers; the import keeps going for valid rows.

### Overwrite semantics

Re-importing the same fiscal year requires `overwrite=true`. On overwrite the route does `deleteMany({fiscal_year})` on **both** `SalaryIncrementLetter` and `SalaryIncrementImport` collections, then creates a fresh batch. The collection-level `superseded`/`superseded_at` fields that earlier drafts had are gone — they were redundant and the unique index on `fiscal_year` made "marking superseded" infeasible.

### QR codes — encode `letter._id`, not `reference_number`

Because the reference number is shared across the entire batch (every employee in FY 2025 has the same `Ref. No.` line on their letter), it can't uniquely identify a letter for verification. So:

- The QR on each letter encodes `${__VERIFY_URL_BASE__}/${letter._id}` — i.e. the Mongo ObjectId.
- `routes/rms/PublicVerify.js` checks `/^[0-9a-fA-F]{24}$/` on the incoming `ref` and routes it to `SalaryIncrementLetter.findById(ref).populate("import_batch_id")` when it matches. Otherwise the four classic letter collections are searched as before.
- The verify page renders the displayed reference number from the populated batch (`hit.import_batch_id.reference_number`), not the encoded id.

### Admin reference printing (silent)

Admins can print any user's letter from `/admin/salary-increment/list` for HR archive filing. The Print button on each row opens a CoreUI modal with the rendered letter and a Print button.

**Crucial constraint**: admin prints don't touch `printed_count` or `first/last_printed_at`. The print component (`SalaryIncrementLetterPrint.js`) accepts a `trackPrint` boolean prop:

- **User flow** (`SalaryIncrementUserPage.js`): renders `<… trackPrint />` (defaults to true). After print, POSTs `/mark-printed` and refreshes.
- **Admin list modal** (`SalaryIncrementList.js`): renders `<… trackPrint={false} />`. Skips the audit POST entirely.

The `/mark-printed` endpoint is owner-only on the server side anyway, so even a misconfigured admin client can't bump the count. The modal also shows a blue notice: *"This is a reference copy for HR archives. It does not count toward the user's print history."*

Print button is disabled when status ≠ `Committed`. Admin cannot print uncommitted drafts (the user hasn't accepted) or revoked letters (no longer valid).

### Frontend file map

| File | Purpose |
|---|---|
| `src/views/admin/SalaryIncrement/SalaryIncrementImport.js` | Admin upload form. Drop-zone + 4 date inputs + reference number + overwrite checkbox + result summary. |
| `src/views/admin/SalaryIncrement/SalaryIncrementUserPage.js` | User commitment + print page. Three states (Imported / Committed / Revoked) + Previous Years history card. |
| `src/views/admin/SalaryIncrement/SalaryIncrementLetterPrint.js` | The render-and-print component. Five-branch switch for category-specific paragraphs. QR code via `QRCodeSVG` (no shared QR-with-logo wrapper imported from existing letters). `trackPrint` prop gates the audit POST. |
| `src/views/admin/SalaryIncrement/SalaryIncrementList.js` | Admin oversight: paginated `material-react-table` with filters + general `q` search + Print modal + Revoke modal. |

### Routes (`src/routes.js`)

Three lazy-loaded entries, all appended to the end of the routes array (clearly demarcated by comments) so removing them restores prior behaviour 1:1:

- `/admin/salary-increment/import` — admin only
- `/user/salary-increment` — admin and user (HR users with their own letter use this same route)
- `/admin/salary-increment/list` — admin only

### Sidebar (`src/_nav.js`)

Two purely-additive insertions:
- **User branch**: top-level `CNavItem` "Salary Increment & Bonus" → `/user/salary-increment`, placed above the existing "User" `CNavTitle`.
- **Admin branch**: a separate top-level `CNavGroup` (sibling to the existing "Admin" group) with three children: "My Letter" → `/user/salary-increment`, "Import Workbook" → `/admin/salary-increment/import`, "All Letters" → `/admin/salary-increment/list`.

`cilCalculator` (already imported, previously unused) used as the icon for both.

### Things that surprised me while building this and would surprise you too

1. **`fiscal_year` unique index conflict on overwrite**: marking the old batch `superseded:true` doesn't free up the unique slot — Mongo's unique index treats `(2025, true)` and `(2025, false)` as conflicting. Solution was to `deleteMany` instead of soft-delete. The `superseded` fields are gone from the schema as a result.
2. **Admin printing user's letter shouldn't increment count**: the user's `printed_count` is *their* record. Admin's HR-archive print is logically a download-for-reference, not a print event in the user's audit. The `trackPrint` prop encodes this distinction; the backend enforces it via owner-only `/mark-printed`.
3. **Promotion sample has decimal `bonus_months`** (`3.5`): so `bonus_months` is a `Number`, not an `Int`.
4. **`Salary Only` Excel sheet has a section-header row above the column headers**: the parser scans for a row containing "Domain Name" / "Employee Name" rather than assuming row 1.
5. **The `Discipline` category exists** in both Excel and the docx template but wasn't in the original verbal spec — easy to miss.
6. **Promotion in the Excel sample didn't have a Bonus Amount column** but the docx template does use one (the example said "3.5 month's salary"). This was added back as a required column in the parser; if a future workbook lacks it, the Promotion sheet skips with a warning.

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
- `src/views/admin/SalaryIncrement` — **independent module** for the Salary Increment & Bonus letter (admin-imported flow). Four files: `SalaryIncrementImport.js` (admin upload), `SalaryIncrementUserPage.js` (user commitment + print), `SalaryIncrementLetterPrint.js` (render + print component), `SalaryIncrementList.js` (admin list + revoke + reference-print modal). Does not import from any of the other letter views — see the Salary Increment section.
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
