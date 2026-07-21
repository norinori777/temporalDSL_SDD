# Quickstart: Workflow builder validation

## Prerequisites

- Docker Desktop or an equivalent container runtime
- Repository checked out at `c:\work\temporalDSL_SDD`
- Existing Action definitions seeded in the workflow backend

## Start the services

```powershell
Set-Location 'C:\work\temporalDSL_SDD\servers'
docker compose -f .\docker-compose.yml up -d --build
```

Expected outcome:

- `backend-workflow` starts and serves workflow validation and persistence
- `frontend-workflow` serves the workflow builder UI
- Existing Action definitions are available for node selection

## Validate the happy path

1. Open the workflow builder UI.
2. Enter a workflow name.
3. Add a start node, at least one Action node, and an end node.
4. Connect the nodes into a branching or linear graph without cycles.
5. Save the workflow.

Expected outcome:

- Validation passes
- A new immutable workflow version is created
- The saved version can be reopened from the workflow list

## Validate failure handling

1. Create a workflow with no start node.
2. Save or validate the workflow.
3. Create a workflow with an unreachable node or a cycle.
4. Validate again.

Expected outcome:

- The server rejects the definition
- Validation issues identify the problem workflow, node, or edge

## Validate re-edit flow

1. Open an existing saved workflow version.
2. Make a change to a node or connection.
3. Save the workflow again.

Expected outcome:

- The previous version remains unchanged
- The new edit is stored as a new version