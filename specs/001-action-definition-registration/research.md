# Research: Action定義 registration and validation

## Decision 1: Use the existing workflow management UI as the registration surface

- Decision: Keep Action 定義 registration in `servers/frontend-workflow`.
- Rationale: The repository already contains a dedicated workflow management front-end, and the feature spec explicitly separates management from SaaS execution.
- Alternatives considered: Add a new admin app; embed management in SaaS. Rejected because both add unnecessary surface area and blur responsibility boundaries.

## Decision 2: Validate only at save time

- Decision: Run definition validation when the user saves a draft or edit.
- Rationale: The clarified requirement is deterministic validation with immediate feedback before persistence. It avoids constant background validation chatter and matches the current UX intent.
- Alternatives considered: Live validation on every field change; deferred validation only at workflow execution. Rejected because they either add noise or allow invalid data to persist too long.

## Decision 3: Persist Action 定義 in PostgreSQL via Prisma

- Decision: Store versioned Action 定義 in the existing Prisma-backed database model.
- Rationale: The backend-workflow service already uses Prisma, the repository has a seeded action schema model, and the feature needs versioned immutable records.
- Alternatives considered: File-based config, in-memory store, or JSON blobs in the UI. Rejected because they weaken auditability and shared workflow validation.

## Decision 4: Keep validation logic server-side and reusable

- Decision: Centralize save-time validation in the backend so workflow selection and registration use the same core constraints.
- Rationale: The constitution requires aligned validation rules for editing and execution, and the current backend already exposes workflow validation helpers.
- Alternatives considered: Client-only validation or duplicated validation logic per screen. Rejected because it would diverge over time.
