# Implementation Plan: ワークフローを登録し、ノード接続を検証できるようにする

**Branch**: `002-workflow-builder` | **Date**: 2026-07-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-workflow-builder/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

登録済み Action を組み合わせてワークフローを画面から作成し、ノードと接続を正規化して保存する。保存時には、開始ノード 1 つ、終了ノード 1 つ、循環なし、未接続なし、利用不可 Action 参照なしを共通検証として判定し、既存版は不変のまま新しい版として登録する。UI は `servers/frontend-workflow`、永続化と検証は `servers/backend-workflow` に置く。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, React 18.3, Vite 5.x, Fastify 4.x, Prisma 5.x

**Primary Dependencies**: React, ReactDOM, Vite, Fastify, @prisma/client, Prisma, yaml

**Storage**: PostgreSQL via Prisma; workflow versions, nodes, and edges are persisted in normalized tables

**Testing**: `yarn build` for `servers/backend-workflow` and `servers/frontend-workflow`, plus Docker Compose smoke validation

**Target Platform**: Docker-based local development on Windows

**Project Type**: Multi-service web application

**Performance Goals**: Save-time validation should complete quickly enough for interactive editing; list/loading requests should remain single-round-trip and deterministic

**Constraints**: Workflow versions are immutable after save; validation runs at save time; graph storage is normalized; Action availability is sourced from pre-registered Action definitions

**Scale/Scope**: One workflow builder UI, one API service, one PostgreSQL-backed workflow model, and seeded Action definitions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Temporal DSL First: pass. The feature expresses workflows as connected Action graphs.
- 日本語中心の開発: pass. Spec and user-facing wording are Japanese-first.
- 設計書は docs 配下に残す: pass. This feature ships design artifacts under `specs/002-workflow-builder/` and will be mirrored to `/docs` during implementation if needed.
- 制約は保存時と実行時の両方で検証する: pass. Save-time validation is the primary gate, with the same rules reused for runtime validation later.
- スキーマはバージョン付きで互換性を守る: pass. Workflow versions are immutable and preserved as new revisions.

## Project Structure

### Documentation (this feature)

```text
specs/002-workflow-builder/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
servers/
├── backend-workflow/
│   ├── prisma/
│   └── src/
├── frontend-workflow/
│   └── src/
├── saas/
│   ├── backend/
│   └── frontend/
├── microservice1/
├── microservice2/
├── microservice3/
└── docker-compose.yml
```

**Structure Decision**: This is a multi-service web application. `servers/frontend-workflow` hosts the workflow builder UI, `servers/backend-workflow` owns persistence and validation, and `servers/saas/frontend` remains execution-focused.

## Complexity Tracking

No constitutional violations require justification.
