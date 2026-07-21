# Research: Workflow builder and validation

## Decision 1: Use the existing workflow management UI as the builder surface

- Decision: Implement the workflow builder in `servers/frontend-workflow`.
- Rationale: The repository already separates workflow management from SaaS execution, and the feature needs a dedicated editing surface for nodes and connections.
- Alternatives considered: Add a new admin app; embed workflow authoring into SaaS. Both blur responsibility boundaries and add unnecessary surface area.

## Decision 2: Keep validation server-side and save-time only

- Decision: Validate workflow definitions on save through `servers/backend-workflow`.
- Rationale: The spec requires rejecting invalid graphs before persistence, and server-side validation can reuse the same logic for future runtime checks.
- Alternatives considered: Live client-only validation; runtime-only validation. Client-only logic would drift, and runtime-only validation would allow invalid data to persist.

## Decision 3: Persist workflow versions as immutable graph snapshots

- Decision: Store each workflow save as an immutable version record with normalized node and edge tables.
- Rationale: The clarified requirements demand version immutability, version tracking, and graph re-display.
- Alternatives considered: In-place updates; single JSON blob storage. In-place updates lose history, while a blob makes validation and diffing harder.

## Decision 4: Base validation on Action registry data

- Decision: Resolve node Action references against the pre-registered Action definitions exposed by the backend-workflow service.
- Rationale: The constitution says Action schemas are pre-registered and used both for selection and validation.
- Alternatives considered: Embed Action metadata into workflows; fetch Action data directly from the UI. Both increase drift risk and weaken validation consistency.

## Decision 5: Model the workflow as a DAG with branching and merging allowed

- Decision: Allow branching and merging, while forbidding cycles and disconnected nodes.
- Rationale: This captures realistic business workflows without over-constraining the user.
- Alternatives considered: Linear-only flows; banning merges. Those would be simpler, but they would underfit the workflow DSL and reduce expressiveness.