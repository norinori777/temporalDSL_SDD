# Quickstart: validate Action定義 registration

## Prerequisites

- Docker Desktop or equivalent container runtime
- Node.js 20+ and Yarn installed locally
- Repository checked out at `c:\work\temporalDSL_SDD`

## Start the services

```powershell
Set-Location 'C:\work\temporalDSL_SDD\servers'
docker compose -f .\docker-compose.yml up -d --build
```

Expected outcome:

- `backend-workflow` starts with Prisma ready
- `frontend-workflow` serves the management UI
- `saas/frontend` remains available for execution-focused UI

## Validate the happy path

1. Open the workflow management UI at `http://localhost:3000`.
2. Enter an Action 名, version, display name, and valid YAML declaration.
3. Save the definition, which calls `POST /action-definitions` through the backend at `http://localhost:3001`.
4. Confirm the new row appears in the definition list after `GET /action-definitions` refreshes the list.

Expected outcome:

- Validation passes at save time
- The record is stored as an immutable version
- The list reflects the newly saved definition

## Validate failure handling

1. Enter an invalid YAML declaration or duplicate `actionCode + version` pair.
2. Save the definition.
3. Confirm the UI shows the validation issue returned by `POST /action-definitions/validate` and refuses to persist the record.

Expected outcome:

- Save is rejected
- The field causing the failure is visible to the user

## Validate workflow candidate reuse

1. Save a definition with `selectable = true`.
2. Open the workflow selection surface.
3. Confirm the saved version appears as a selectable candidate through `GET /action-schemas`.

Expected outcome:

- Only selectable versions are exposed to workflow editing
- The management and execution surfaces stay separated
