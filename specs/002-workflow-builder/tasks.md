# Tasks: ワークフローを登録し、ノード接続を検証できるようにする

**Input**: Design documents from `/specs/002-workflow-builder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested, so this task list focuses on implementation and validation work.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel in different files with no dependency on incomplete work
- **[Story]**: Which user story this task belongs to, for example US1, US2, US3
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared workflow builder scaffolding for backend, frontend, and documentation

- [X] T001 [P] Create workflow builder API client scaffold in servers/frontend-workflow/src/services/workflowDefinitionApi.ts
- [X] T002 [P] Create shared workflow builder view models in servers/frontend-workflow/src/types/workflowDefinition.ts
- [X] T003 [P] Add workflow builder UI shell components in servers/frontend-workflow/src/components/WorkflowEditorShell.tsx and servers/frontend-workflow/src/components/WorkflowDefinitionList.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core workflow persistence and graph validation that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Extend the Prisma schema for workflow definitions, versions, nodes, and edges in servers/backend-workflow/prisma/schema.prisma
- [X] T005 [P] Add the initial workflow schema migration and baseline SQL in servers/backend-workflow/prisma/migrations/
- [X] T006 [P] Create normalized workflow validation helpers for graph rules in servers/backend-workflow/src/workflow-definition-validation.ts
- [X] T007 [P] Create normalized workflow persistence helpers in servers/backend-workflow/src/workflow-definition-store.ts
- [X] T008 Wire the workflow builder routes into servers/backend-workflow/src/index.ts
- [X] T009 Add workflow builder design notes to docs/workflow-builder.md

**Checkpoint**: Workflow schema, versioning model, and validation helpers are ready for story work

---

## Phase 3: User Story 1 - ワークフローを作成する (Priority: P1) 🎯 MVP

**Goal**: 利用者がワークフロー名を付け、登録済み Action を選んでノードを配置し、開始から終了までの流れを画面で組み立てられる

**Independent Test**: ノードを追加し、Action を選び、接続して、編集内容が 1 つのワークフローとして保存対象になる

### Implementation for User Story 1

- [X] T010 [P] [US1] Build the workflow editor canvas and node placement UI in servers/frontend-workflow/src/components/WorkflowEditorCanvas.tsx
- [X] T011 [P] [US1] Build the workflow node inspector and action selection UI in servers/frontend-workflow/src/components/WorkflowNodeInspector.tsx
- [X] T012 [US1] Wire the editor shell, canvas, and inspector into servers/frontend-workflow/src/App.tsx
- [X] T013 [US1] Add workflow list and create endpoints in servers/backend-workflow/src/index.ts
- [X] T014 [US1] Implement workflow creation and version registration in servers/backend-workflow/src/workflow-definition-store.ts

**Checkpoint**: User Story 1 should be fully functional and independently demoable

---

## Phase 4: User Story 2 - ワークフロー定義を検証する (Priority: P1)

**Goal**: 利用者が保存前にワークフロー定義を検証し、不正な接続や不足を検出できる

**Independent Test**: 不正な接続や不足がある定義を入力したときに、保存されず、どこが不正か確認できる

### Implementation for User Story 2

- [X] T015 [P] [US2] Surface validation issue rendering in servers/frontend-workflow/src/components/WorkflowValidationPanel.tsx
- [X] T016 [US2] Add save-time workflow validation and rejection handling in servers/backend-workflow/src/index.ts
- [X] T017 [US2] Implement cycle, unreachable node, missing start/end, and invalid Action checks in servers/backend-workflow/src/workflow-definition-validation.ts

**Checkpoint**: User Story 2 should block invalid saves and explain the failure clearly

---

## Phase 5: User Story 3 - 保存済みワークフローを見直す (Priority: P2)

**Goal**: 利用者が保存済みワークフローを読み込み、後から内容を確認して再編集できる

**Independent Test**: 保存済みのワークフローを再表示し、ノードと接続を確認できる

### Implementation for User Story 3

- [X] T018 [P] [US3] Add workflow version list and selection controls in servers/frontend-workflow/src/components/WorkflowDefinitionList.tsx
- [X] T019 [P] [US3] Add workflow version reload and edit mode handling in servers/frontend-workflow/src/App.tsx
- [X] T020 [US3] Add workflow version read endpoints in servers/backend-workflow/src/index.ts
- [X] T021 [US3] Implement workflow version retrieval in servers/backend-workflow/src/workflow-definition-store.ts

**Checkpoint**: User Story 3 should let operators inspect and re-edit saved workflow versions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, documentation sync, and smoke validation

- [X] T022 [P] Sync quickstart steps with the final workflow-definition endpoints in specs/002-workflow-builder/quickstart.md
- [X] T023 [P] Update shared workflow builder styling in servers/frontend-workflow/src/styles.css
- [X] T024 [P] Add workflow builder terminology and operator notes to docs/workflow-builder.md
- [X] T025 Run build and compose smoke validation using servers/backend-workflow/package.json, servers/frontend-workflow/package.json, and servers/docker-compose.yml

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Core UI or backend route before integration wiring
- Models/helpers before service/store usage
- Validation before save/reload behavior
- Story complete before moving to the next priority

### Parallel Opportunities

- Setup tasks T001, T002, and T003 can run in parallel
- Foundational tasks T004 through T007 can run in parallel because they touch different files
- User Story 1 tasks T010 and T011 can run in parallel
- User Story 2 tasks T015 and T017 can run in parallel once the foundational helpers exist
- User Story 3 tasks T018 and T019 can run in parallel

## Parallel Example: User Story 1

```bash
Task: "Build the workflow editor canvas and node placement UI in servers/frontend-workflow/src/components/WorkflowEditorCanvas.tsx"
Task: "Build the workflow node inspector and action selection UI in servers/frontend-workflow/src/components/WorkflowNodeInspector.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Surface validation issue rendering in servers/frontend-workflow/src/components/WorkflowValidationPanel.tsx"
Task: "Implement cycle, unreachable node, missing start/end, and invalid Action checks in servers/backend-workflow/src/workflow-definition-validation.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver User Story 1 as the MVP
3. Validate that workflow creation and saving work independently
4. Stop and demo before expanding to later stories

### Incremental Delivery

1. Foundation ready
2. Add User Story 1 and validate the creation flow
3. Add User Story 2 and validate save-time rejection of bad graphs
4. Add User Story 3 and validate reload/re-edit/versioning
5. Finish with documentation and smoke validation
