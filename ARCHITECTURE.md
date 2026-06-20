# FindMyDoctor — Architecture Guide

## Overview

This project follows **Domain-Driven Design (DDD)** principles with a modular architecture that separates concerns by domain rather than technical layer.

## Directory Structure

```
findmydoctor/
├── app/                          # Next.js App Router (thin routing layer)
│   ├── (public)/                 # Public routes group
│   ├── api/v1/                   # REST API routes
│   └── layout.tsx                # Root layout
│
├── modules/                      # 🎯 Domain Modules (DDD)
│   ├── auth/                     # Authentication & authorization
│   │   ├── types.ts              # AuthUser, LoginForm, etc.
│   │   └── index.ts
│   │
│   ├── doctors/                  # Doctor management
│   │   ├── types.ts              # Doctor, Specialty, filters
│   │   ├── hooks/                # useDoctors, useDoctor
│   │   │   ├── useDoctors.ts
│   │   │   └── index.ts
│   │   ├── components/           # DoctorCard, DoctorList, etc.
│   │   │   ├── DoctorCard.tsx
│   │   │   ├── DoctorList.tsx
│   │   │   ├── DoctorFilters.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── pharmacy/                 # Medicine catalog & orders
│   │   ├── types.ts
│   │   ├── hooks/
│   │   │   ├── useMedicines.ts
│   │   │   ├── useMedicineOrder.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── MedicineCard.tsx
│   │   │   ├── MedicineOrderModal.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── ambulance/                # Ambulance dispatch
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── consultation/             # Video consultations
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── home-visit/               # Home doctor visits
│       ├── types.ts
│       └── index.ts
│
├── shared/                       # 🔧 Shared Utilities
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   └── layout/
│   │       ├── PageHeader.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useFilters.ts
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts              # cn(), formatCurrency(), etc.
│   ├── types/
│   │   └── index.ts              # BaseEntity, PaginatedResponse, etc.
│   ├── constants/
│   │   └── index.ts              # APP_CONFIG, ROUTES, STATUS_COLORS
│   └── index.ts
│
├── server/                       # 🖥️ Backend
│   ├── modules/                  # Domain services
│   │   └── medicine/
│   │       ├── medicine.service.ts
│   │       └── index.ts
│   ├── db/
│   │   ├── entities/             # TypeORM entities
│   │   ├── migrations/
│   │   ├── data-source.ts
│   │   └── seed.ts
│   └── lib/
│       ├── response.ts           # ok(), err() helpers
│       ├── handle-error.ts
│       └── app-error.ts
│
├── store/                        # 📦 Redux Store
│   ├── fmdApi.ts                 # RTK Query API slice
│   ├── authSlice.ts
│   ├── bookingSlice.ts
│   ├── hooks.ts
│   └── index.ts
│
└── types/
    └── domain.ts                 # Legacy types (migrate to modules)
```

## Module Structure

Each domain module follows this pattern:

```typescript
// modules/[domain]/types.ts
export interface Entity { ... }
export interface EntityFilters { ... }
export const DEFAULT_FILTERS = { ... }

// modules/[domain]/hooks/useEntities.ts
export function useEntities() {
  // Uses shared hooks: useFilters, usePagination, useDebounce
  // Returns: data, filters, pagination, loading states
}

// modules/[domain]/components/EntityCard.tsx
export function EntityCard({ entity }: Props) { ... }
export function EntityCardSkeleton() { ... }

// modules/[domain]/index.ts
export * from "./types";
export * from "./hooks";
export * from "./components";
```

## Key Principles

### 1. Single Responsibility
Each module owns its domain logic, types, hooks, and components.

### 2. Dependency Direction
```
app/ → modules/ → shared/
         ↓
      server/
```
- `app/` imports from `modules/` and `shared/`
- `modules/` import from `shared/` only
- `shared/` has no domain dependencies

### 3. Colocation
Related code lives together:
- Doctor types, hooks, and components are all in `modules/doctors/`
- Makes refactoring and feature changes easier

### 4. Reusable UI
Base components in `shared/components/ui/` are domain-agnostic:
- `<Button>`, `<Input>`, `<Modal>`, `<Card>`, `<Badge>`, etc.
- Styled with Tailwind, using CSS variables for theming

### 5. Shared Hooks
Generic hooks in `shared/hooks/`:
- `useDebounce()` — Debounce values for search
- `usePagination()` — Page state management
- `useFilters()` — Filter state with reset capability

## Usage Examples

### Using a Module

```tsx
// app/doctors/page.tsx
import { 
  useDoctors,
  DoctorList,
  DoctorFilters,
} from "@/modules/doctors";

export default function DoctorsPage() {
  const { doctors, filters, setFilter, isLoading } = useDoctors();
  
  return (
    <>
      <DoctorFilters filters={filters} onFilterChange={setFilter} />
      <DoctorList doctors={doctors} isLoading={isLoading} />
    </>
  );
}
```

### Using Shared Components

```tsx
import { Button, Input, Modal, Card } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout";
import { formatCurrency } from "@/shared/lib/utils";
import { ROUTES, APP_CONFIG } from "@/shared/constants";
```

## Adding a New Feature

1. Create the module: `modules/[feature]/`
2. Define types: `types.ts`
3. Create hooks: `hooks/use[Feature].ts`
4. Build components: `components/[Feature]Card.tsx`
5. Export from: `index.ts`
6. Create API route: `app/api/v1/[feature]/route.ts`
7. Create page: `app/[feature]/page.tsx`

## Benefits

✅ **Scalability** — Add features without touching existing code  
✅ **Testability** — Each module can be tested in isolation  
✅ **Maintainability** — Clear boundaries between domains  
✅ **Onboarding** — New devs understand structure quickly  
✅ **Refactoring** — Move/rename modules without side effects  
