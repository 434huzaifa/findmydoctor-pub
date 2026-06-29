# FindMyDoctor (FMD)

A full-stack doctor appointment platform for Bangladesh. Patients can browse doctors, book appointments, request home visits, order medicine, track bookings via phone + OTP, and doctors/admins can manage appointments through role-specific dashboards.

---

## Tech Stack

| Layer                 | Technology                               |
| --------------------- | ---------------------------------------- |
| Framework             | Next.js 16.2.4 (App Router, Turbopack)   |
| Language              | TypeScript 5                             |
| UI Library            | React 19.2.4                             |
| Database ORM          | TypeORM 0.3.28                           |
| Database              | PostgreSQL                               |
| State / Data Fetching | Redux Toolkit + RTK Query                |
| Styling               | Tailwind CSS v4 + `@tailwindcss/postcss` |
| Auth                  | JWT — access + refresh tokens            |
| Password Hashing      | bcryptjs                                 |
| UI Components         | Headless UI (Dialog)                     |

---

## Project Structure

```
app/                        # Pages + API routes (App Router)
  api/                       # Health + versioned REST API
    health/                  # Health check route
    v1/                      # Versioned API handlers
      admin/                 # Admin management endpoints
      ambulances/            # Ambulance listing / dispatch
      appointments/          # Appointment lookup + OTP flow
      auth/                  # Login
      consultation/          # Video consultation queue/actions
      cron/                  # Cron-protected scheduled jobs
      doctors/               # Doctor details and lists
      home-visit/            # Home visit requests
      lookup/                # Lookup helpers
      medicine/              # Pharmacy endpoints
  about/                     # About page
  admin/                     # Admin dashboard
  ambulances/                # Ambulance service listing
  booking/[id]/              # Book doctor appointment
  checkout/                  # Checkout and payment simulation
    simulation/[id]/
  consultation/              # Consultation pages
    wait/[id]/               # Consultation wait room
  doctor-dashboard/          # Doctor dashboard
  doctor-home-service/       # Home visit booking
  doctors/                   # Doctor directory
    [id]/                    # Doctor detail page
  login/                     # Doctor / admin login
  medicine/                  # Pharmacy storefront
  my-appointments/           # Appointment lookup by phone + OTP
  payment/                   # Booking/payment summary
  pharmacy/                  # Pharmacy ordering experience
  success/                   # Booking confirmation

components/                 # Shared UI components
  admin/                    # Admin modals/forms/stats
  common/                   # AppModal, StatCard, etc.
  layout/                   # NavBar, Footer

features/                   # Feature-specific UI components
  doctors/                  # DoctorCard component

lib/                        # Client-safe helper utilities
modules/                    # Domain modules and hooks
shared/                     # App-level reusable constants and utilities
store/                      # Redux + RTK Query store slices
types/                      # Shared TypeScript domain types

server/                     # Server-only code (never imported on client)
  config/env.ts             # Zod environment validation
  db/                       # TypeORM DataSource, entities, migrations, seed
  lib/                      # response helpers, error handling, auth guard, JWT, OTP
```

---

## Environment Variables

Create a `.env` file at the project root.

| Variable                   | Required | Description                                                               |
| -------------------------- | -------- | ------------------------------------------------------------------------- |
| `PG_URL`                   | Yes      | PostgreSQL connection string                                              |
| `JWT_ACCESS_SECRET`        | Yes      | Secret for signing short-lived access tokens                              |
| `JWT_REFRESH_SECRET`       | Yes      | Secret for signing refresh tokens                                         |
| `JWT_ACCESS_EXPIRES_IN`    | No       | Access token expiration, default `15m`                                    |
| `JWT_REFRESH_EXPIRES_IN`   | No       | Refresh token expiration, default `7d`                                    |
| `NEXT_PUBLIC_BASE_URL`     | No       | Base URL for SSR/API requests, default `http://localhost:3000`            |
| `CRON_SECRET`              | No       | Optional bearer token for protected cron endpoint                         |

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
pnpm install
```

> `pnpm` is recommended because this repository uses a workspace lockfile (`pnpm-lock.yaml`).

### 2. Configure environment

Create `.env` in the project root and fill in your values (see above).

### 3. Run database migrations

```bash
npm run migration:run
```

### 4. Seed the database

```bash
npm run seed
```

Seeds specialties, doctors, admin + doctor users, medicines, ambulances, sample appointments, virtual consultations, and a sample home visit request.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Migration Guide

Migrations are managed with TypeORM CLI via `npm run typeorm`.

| Command                    | Effect                                    |
| -------------------------- | ------------------------------------------ |
| `npm run typeorm`          | Run TypeORM CLI                            |
| `npm run migration:create` | Create a new migration file                |
| `npm run migration:generate` | Generate a migration from schema diff    |
| `npm run migration:run`    | Apply pending TypeORM migrations          |
| `npm run migration:revert` | Revert the last TypeORM migration         |

---

## Available NPM Scripts

| Script                     | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Start dev server                                      |
| `npm run build`            | Production build                                      |
| `npm run start`            | Start production server                               |
| `npm run lint`             | Run ESLint                                            |
| `npm run typeorm`          | Run TypeORM CLI                                       |
| `npm run migration:create` | Create a new migration file                           |
| `npm run migration:generate` | Generate a migration from schema changes            |
| `npm run migration:run`    | Apply pending TypeORM migrations                      |
| `npm run migration:revert` | Revert the last TypeORM migration                     |
| `npm run seed`             | Seed database with initial data                       |

---

## Seeded Dev Accounts

The seed script automatically creates admin and doctor users when they do not already exist.

| Role    | Email               | Password    |
| ------- | ------------------- | ----------- |
| Admin   | `admin@fmd.local`   | `admin1234` |
| Doctor  | `doctor1@fmd.local` | `admin1234` |
| Doctor  | `doctor2@fmd.local` | `admin1234` |
| Doctor  | `doctor3@fmd.local` | `admin1234` |
| Doctor  | `doctor4@fmd.local` | `admin1234` |

Only `doctor` and `admin` roles can sign in through the UI. Patients do not need accounts — they look up appointments using phone number + OTP.

---

## Key Architecture Notes

- **App Router only** — this repository uses `app/` exclusively, with nested routes and API handlers.
- **TypeORM singleton** — `server/db/data-source.ts` stores the DataSource on `global.__typeormDataSource` during development to survive hot reloads.
- **Environment validation** — `server/config/env.ts` parses and validates required environment variables.
- **RTK Query envelope** — API responses use `{ success: true, data: T }`, and the client API layer unwraps `data`.
- **Demo OTP** — OTP is mocked in `server/lib/otp-store.ts`; the demo code is always `1234` and the request endpoint returns `otpHint` and TTL.
- **Cron endpoint** — `app/api/v1/cron/update-next-appointments/route.ts` can be protected with `CRON_SECRET`.

---

## Test Credentials

**Admin**
- email: `admin@fmd.local`
- password: `admin1234`

**Doctor**
- email: `doctor1@fmd.local`
- password: `admin1234`
