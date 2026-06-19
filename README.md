# FindMyDoctor (FMD)

A full-stack doctor appointment booking platform for Bangladesh, built with **Next.js 16 App Router**. Patients can browse doctors, book appointments, and track them via phone + OTP. Doctors and admins have role-specific dashboards.

---

## Tech Stack

| Layer                 | Technology                               |
| --------------------- | ---------------------------------------- |
| Framework             | Next.js 16.2.4 (App Router, Turbopack)   |
| Language              | TypeScript (strict)                      |
| Database ORM          | TypeORM 0.3.28                           |
| Database              | PostgreSQL (Supabase)                    |
| State / Data Fetching | Redux Toolkit + RTK Query                |
| Styling               | Tailwind CSS v4 + `@tailwindcss/postcss` |
| Auth                  | JWT — access + refresh tokens            |
| Password Hashing      | bcryptjs                                 |
| UI Components         | Headless UI (Dialog)                     |

---

## Project Structure

```
app/                        # Pages + API routes (App Router)
  api/v1/                   # REST API route handlers
  page.tsx                  # Home page
  doctors/                  # Browse doctors
  booking/[id]/             # Book appointment
  payment/                  # Payment summary
  success/                  # Booking confirmation
  my-appointments/          # Patient lookup (phone + OTP)
  login/                    # Doctor / admin login
  admin/                    # Admin dashboard
  doctor-dashboard/         # Doctor appointment dashboard

components/                 # Shared UI components
  common/                   # AppModal, StatCard
  layout/                   # NavBar, Footer

features/doctors/           # DoctorCard component
lib/                        # Client-safe utilities (doctor helpers, datetime)
store/                      # Redux store (RTK Query API slice, auth, booking)
types/domain.ts             # All shared TypeScript types

server/                     # Server-only code (never imported on client)
  config/env.ts             # Zod environment validation
  db/                       # TypeORM DataSource, entities, migrations, seed
  lib/                      # response helpers, error handling, auth guard, JWT, OTP
```

---

## Environment Variables

Create a `.env` file at the project root:

| Variable               | Required | Description                                                     |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `PG_URL`               | Yes      | PostgreSQL connection string (e.g. Supabase pooler URL)         |
| `JWT_ACCESS_SECRET`    | Yes      | Secret for signing short-lived access tokens                    |
| `JWT_REFRESH_SECRET`   | Yes      | Secret for signing refresh tokens                               |
| `NEXT_PUBLIC_BASE_URL` | No       | Base URL for SSR API calls. Defaults to `http://localhost:3000` |

Example `.env`:

```env
PG_URL=postgresql://user:password@host:6543/postgres
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` in the project root and fill in your values (see above).

### 3. Run database migrations

```bash
npm run migration:run
```

Creates all PostgreSQL tables: `specialties`, `doctors`, `users`, `appointments`.

### 4. Seed the database

```bash
npm run seed
```

Seeds specialties and doctors. Skips automatically if doctors already exist.
To create admin/doctor user accounts, see [Default Dev Accounts](#default-dev-accounts) below.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Migration Guide

Migrations are managed with TypeORM CLI via `npm run typeorm`.

| Command                    | Effect                            |
| -------------------------- | --------------------------------- |
| `npm run migration:run`    | Apply all pending migrations      |
| `npm run migration:revert` | Revert the last applied migration |

Three migrations are included in `server/db/migrations/`:

1. **InitialSchema** — Creates `specialties`, `doctors`, `users`, `appointments` tables.
2. **DoctorRolesAndPayments** — Adds `role` and `doctorId` to `users`; adds `advanceFee`, `usedSeats`, `totalSeats`, and payment fields to `appointments`.
3. **SpecialtiesAdvanceAndOtpReady** — Adds OTP fields and other refinements to `appointments`.

---

## Available NPM Scripts

| Script                     | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `npm run dev`              | Start dev server (Turbopack, port 3000) |
| `npm run build`            | Production build                        |
| `npm run start`            | Start production server                 |
| `npm run lint`             | Run ESLint                              |
| `npm run migration:run`    | Apply pending TypeORM migrations        |
| `npm run migration:revert` | Revert last TypeORM migration           |
| `npm run seed`             | Seed specialties and doctors            |

---

## Default Dev Accounts

> These accounts must be inserted into the `users` table with a bcrypt-hashed password after migrations run.

| Role   | Email              | Password    |
| ------ | ------------------ | ----------- |
| Admin  | `admin@fmd.local`  | `admin1234` |
| Doctor | `doctor@fmd.local` | `admin1234` |

Only `doctor` and `admin` roles can sign in through the UI. Patients do not need accounts — they look up appointments by phone number + OTP.

---

## Key Architecture Notes

- **App Router only** — no `pages/` directory. All pages use the `app/` directory.
- **TypeORM singleton** — `server/db/data-source.ts` uses a `global.__typeormDataSource` variable to survive Turbopack hot-reloads.
- **RTK Query envelope** — all API responses return `{ success: true, data: T }`. The `baseQuery` in `store/fmdApi.ts` unwraps `data` automatically.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` in `globals.css`. No `tailwind.config.ts` needed. **Do not** add bare (unlayered) CSS resets (`* { margin: 0 }`) — they override `@layer utilities` and break all spacing utilities.
- **Auth redirects** — always perform navigation in `useEffect`, never at render time, to avoid SSR errors.
- **Demo OTP** — the in-memory OTP store in `server/lib/otp-store.ts` always accepts code `1234` for demo purposes.


## Test Credential

**admin**
**email:**`admin@fmd.local`
**password:**`admin1234`

**doctor**
**email:**`doctor1@fmd.local`
**password:**`admin1234`