# Tasks: Action定義を画面から登録し、定義内容を検証できるようにする

**Input**: Design documents from `/specs/001-action-definition-registration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are not requested explicitly, so this task list focuses on implementation and validation work.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel in different files with no dependency on incomplete work
- **[Story]**: Which user story the task belongs to, for example US1, US2, US3
- Include exact file paths in every task description

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared client and model scaffolding for the management UI

- [X] T001 [P] Create the action-definition API client in servers/frontend-workflow/src/services/actionDefinitionApi.ts
- [X] T002 [P] Create shared action-definition view models in servers/frontend-workflow/src/types/actionDefinition.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend storage and validation that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Extend the Prisma ActionSchema model for display name and update tracking in servers/backend-workflow/prisma/schema.prisma
- [X] T004 [P] Refresh initial selectable and non-selectable action definitions in servers/backend-workflow/prisma/seed.js
- [X] T005 [P] Create save-time validation helpers for action definitions in servers/backend-workflow/src/action-definition-validation.ts
- [X] T006 [P] Create action-definition persistence helpers in servers/backend-workflow/src/action-definition-store.ts
- [X] T007 Wire the action-definition route bootstrap into servers/backend-workflow/src/index.ts

**Checkpoint**: Backend schema, seed data, and validation helpers are ready for story work

---

## Phase 3: User Story 1 - Action定義の登録 (Priority: P1) 🎯 MVP

**Goal**: 利用者が画面から Action 定義を新規登録し、保存結果を一覧で確認できる

**Independent Test**: 画面で Action 名、バージョン、表示名、YAML 宣言、選択可否を入力して保存し、一覧に新規行が追加される

### Implementation for User Story 1

- [X] T008 [P] [US1] Build the action-definition registration form in servers/frontend-workflow/src/components/ActionDefinitionForm.tsx
- [X] T009 [P] [US1] Build the versioned definition list in servers/frontend-workflow/src/components/ActionDefinitionList.tsx
- [X] T010 [US1] Wire the registration form, list, and API client into servers/frontend-workflow/src/App.tsx
- [X] T011 [US1] Add create and list endpoints for action definitions in servers/backend-workflow/src/index.ts

**Checkpoint**: User Story 1 should be fully functional and independently demoable

---

## Phase 4: User Story 2 - 定義内容の検証 (Priority: P1)

**Goal**: 保存時に不正な Action 定義を検出し、問題箇所を画面で確認できる

**Independent Test**: 不正な YAML や重複 version を入力したときに保存が拒否され、エラー内容が表示される

### Implementation for User Story 2

- [X] T012 [US2] Surface field-level validation messages in servers/frontend-workflow/src/components/ActionDefinitionForm.tsx
- [X] T013 [US2] Add save-time validation and duplicate rejection handling in servers/backend-workflow/src/index.ts

**Checkpoint**: User Story 2 should block invalid saves and explain the failure clearly

---

## Phase 5: User Story 3 - 画面で選択可能な定義の管理 (Priority: P2)

**Goal**: selectable フラグを画面から切り替えられ、ワークフロー候補に使う定義を制御できる

**Independent Test**: selectable を切り替えて保存すると、候補として使う定義だけが残る

### Implementation for User Story 3

- [X] T014 [P] [US3] Add selectable toggle controls to the list rows in servers/frontend-workflow/src/components/ActionDefinitionList.tsx
- [X] T015 [US3] Add selectable update handling in servers/backend-workflow/src/index.ts

**Checkpoint**: User Story 3 should let operators control which versions are selectable

---

## Phase 6: User Story 4 - 定義管理と実行面の分離 (Priority: P2)

**Goal**: SaaS 側は実行専用のまま保ち、Action 定義管理は workflow management 側に限定する

**Independent Test**: SaaS 画面に管理導線がなく、workflow management 側だけで Action 定義を扱える

### Implementation for User Story 4

- [X] T016 [P] [US4] Reframe the SaaS landing copy as execution-only in servers/saas/frontend/src/App.tsx
- [X] T017 [P] [US4] Remove management-oriented visual cues from servers/saas/frontend/src/styles.css

**Checkpoint**: User Story 4 should keep execution and management responsibilities visually separated

---

## Phase 7: User Story 5 - 既存管理画面での定義一覧 (Priority: P3)

**Goal**: 既存の管理画面で version 単位の一覧を確認し、編集対象を選べる

**Independent Test**: 管理画面を開くと、同一 Action 名の複数 version が一覧で区別される

### Implementation for User Story 5

- [X] T018 [P] [US5] Add edit-target selection and version grouping to servers/frontend-workflow/src/components/ActionDefinitionList.tsx
- [X] T019 [US5] Ensure ordered version listing is returned from servers/backend-workflow/src/index.ts

**Checkpoint**: User Story 5 should make version history easy to inspect and target

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, documentation sync, and smoke validation

- [X] T020 [P] Sync quickstart steps with the final action-definition endpoints in specs/001-action-definition-registration/quickstart.md
- [X] T021 [P] Run build and compose smoke validation using servers/backend-workflow/package.json, servers/frontend-workflow/package.json, and servers/docker-compose.yml

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
- **Polish (Final Phase)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on later stories
- **User Story 2 (P1)**: Can start after Foundational; uses the same validation model as User Story 1
- **User Story 3 (P2)**: Can start after Foundational; reuses the same versioned record model
- **User Story 4 (P2)**: Can start after Foundational; independent of the management data flow
- **User Story 5 (P3)**: Can start after Foundational; depends on the versioned list representation

### Within Each User Story

- Build the shared UI component or backend route first
- Wire the component or route into the app after the underlying helper exists
- Keep story-specific validation and display behavior inside the story phase
- Finish one story before moving to the next priority when sharing a file

### Parallel Opportunities

- Setup tasks T001 and T002 can run in parallel
- Foundational tasks T003 through T006 can run in parallel because they touch different files
- User Story 1 tasks T008 and T009 can run in parallel
- User Story 3 task T014 can run in parallel with T015 once the foundational backend helpers are ready
- User Story 4 tasks T016 and T017 can run in parallel
- User Story 5 task T018 can run in parallel with T019 once the shared list model is stable

## Parallel Example: User Story 1

```bash
Task: "Build the action-definition registration form in servers/frontend-workflow/src/components/ActionDefinitionForm.tsx"
Task: "Build the versioned definition list in servers/frontend-workflow/src/components/ActionDefinitionList.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add selectable toggle controls to the list rows in servers/frontend-workflow/src/components/ActionDefinitionList.tsx"
Task: "Add selectable update handling in servers/backend-workflow/src/index.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver User Story 1 as the MVP
3. Validate that registration and list display work independently
4. Stop and demo before expanding to later stories

### Incremental Delivery

1. Foundation ready
2. Add User Story 1 and validate the registration flow
3. Add User Story 2 and validate save-time rejection of bad input
4. Add User Story 3 and validate selectable management
5. Add User Story 4 and confirm management/execution separation
6. Add User Story 5 and confirm version history is easy to inspect
