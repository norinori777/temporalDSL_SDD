# Data Model: Action定義 registration

## Entity: ActionDefinition

- Fields:
  - `id`: unique identifier
  - `actionCode`: Action 名
  - `version`: version string or number used to distinguish immutable revisions
  - `displayName`: human-readable label
  - `requestDeclarationYaml`: YAML declaration text
  - `selectable`: whether the version can be offered in workflow selection
  - `createdAt`: creation timestamp
  - `updatedAt`: update timestamp
- Validation rules:
  - `actionCode` and `version` must be unique as a pair
  - `requestDeclarationYaml` must parse as valid YAML
  - required and allowed keys must satisfy the registration rules
  - once saved, a version is immutable; changes create a new version record

## Entity: ActionDefinitionValidationResult

- Fields:
  - `valid`: boolean
  - `issues`: list of validation issues
- Validation rules:
  - returned on save-time validation
  - must contain field-level explanations for invalid input

## Entity: ActionDefinitionListItem

- Fields:
  - `actionCode`
  - `version`
  - `displayName`
  - `selectable`
  - summary status for validation or duplication failures when relevant
- Notes:
  - used by the management list view
  - derived from `ActionDefinition`, not a separate source of truth

## Entity: ActionDefinitionVersion

- Fields:
  - `actionCode`
  - `version`
  - `requestDeclarationYaml`
  - `selectable`
- Relationships:
  - multiple versions can belong to the same `actionCode`
- State transitions:
  - draft input -> validation -> saved immutable version
  - saved version -> selectable toggle update only
