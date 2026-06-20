// ─── Domain Modules Index ───────────────────────────────────────────────────
//
// This file exports all domain modules for easy importing.
// Each module follows Domain-Driven Design principles:
//
// modules/
// ├── auth/           # Authentication & authorization
// ├── doctors/        # Doctor management & booking
// ├── pharmacy/       # Medicine catalog & orders
// ├── ambulance/      # Ambulance dispatch
// ├── consultation/   # Video consultations
// ├── home-visit/     # Home doctor visits
// └── appointments/   # Appointment management
//
// Each module contains:
// ├── types.ts        # Domain types & interfaces
// ├── hooks/          # React hooks for state management
// ├── components/     # Domain-specific UI components
// ├── services/       # API service layer (optional)
// └── index.ts        # Module exports
//

export * from "./auth";
export * from "./doctors";
export * from "./pharmacy";
export * from "./ambulance";
export * from "./consultation";
export * from "./home-visit";
