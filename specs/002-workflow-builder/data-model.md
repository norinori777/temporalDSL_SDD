# Data Model: Workflow builder

## Entity: WorkflowDefinition

- Fields:
  - `id`: unique identifier for the logical workflow
  - `name`: workflow name shown to users
  - `description`: optional summary
  - `currentVersion`: latest saved version number or label
  - `createdAt`: creation timestamp
  - `updatedAt`: last logical update timestamp
- Validation rules:
  - `name` must be present and unique within the workflow registry
  - each logical workflow has one or more immutable versions

## Entity: WorkflowVersion

- Fields:
  - `id`: unique identifier for the saved version
  - `workflowDefinitionId`: parent workflow reference
  - `version`: version label or number
  - `status`: saved / draft / archived style lifecycle marker
  - `createdAt`: saved timestamp
  - `createdBy`: optional author reference
- Validation rules:
  - a saved version is immutable
  - a new edit creates a new version rather than overwriting an existing one

## Entity: WorkflowNode

- Fields:
  - `id`: unique node identifier within a workflow version
  - `workflowVersionId`: parent workflow version reference
  - `actionDefinitionId`: reference to the selected Action definition
  - `label`: display label shown in the editor
  - `nodeType`: start / action / end / gateway style role marker
  - `position`: editor layout metadata used to re-render the graph
- Validation rules:
  - each node must reference an existing, selectable Action definition when it is an Action node
  - start and end roles must satisfy the graph shape rules defined by the feature

## Entity: WorkflowEdge

- Fields:
  - `id`: unique edge identifier within a workflow version
  - `workflowVersionId`: parent workflow version reference
  - `fromNodeId`: source node reference
  - `toNodeId`: destination node reference
- Validation rules:
  - both endpoints must exist in the same workflow version
  - edges must not create cycles
  - every non-terminal node must participate in at least one connection

## Entity: WorkflowValidationResult

- Fields:
  - `valid`: boolean
  - `issues`: list of validation issues
  - `workflowVersionId`: optional reference when validation is run against an existing version
- Validation rules:
  - the result is shared between save-time validation and later runtime validation
  - issues must be understandable without implementation details

## Entity: WorkflowValidationIssue

- Fields:
  - `code`: stable issue code
  - `message`: user-facing explanation
  - `targetType`: workflow / node / edge / action reference
  - `targetId`: optional identifier of the affected item
- Validation rules:
  - every failed rule should produce at least one issue
  - a single workflow can return multiple issues at once