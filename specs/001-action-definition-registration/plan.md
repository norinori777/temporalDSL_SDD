# Implementation Plan: Action定義を画面から登録し、定義内容を検証できるようにする

**Branch**: `001-action-definition-registration` | **Date**: 2026-07-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-action-definition-registration/spec.md`

## Summary

Action 定義を管理画面から登録・更新・一覧確認できるようにし、保存時のみ YAML 宣言と定義制約を検証したうえで PostgreSQL に永続化する。管理 UI は既存の workflow front-end を使い、実行面は SaaS 側に残したまま、保存済み定義を workflow 側の選択候補として再利用する。

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.3, Vite 5.x, Fastify 4.x, Prisma 5.x

**Primary Dependencies**: React, ReactDOM, Vite, Fastify, @prisma/client, Prisma, yaml

**Storage**: PostgreSQL via Prisma; Action 定義と selectable フラグ、version を永続化する

**Testing**: `yarn build` for affected services, Prisma seed/migrate checks, Docker Compose integration smoke test

**Target Platform**: Docker-based local development on Windows, serving web UI + API services

**Project Type**: Multi-service web application

**Performance Goals**: Save-time validation should complete quickly enough to support interactive editing; workflow candidate loading should remain single-request and deterministic

**Constraints**: Action 定義は version ごとに不変、検証は保存時のみ、SaaS 側は実行専用、workflow management 側は管理専用

**Scale/Scope**: One management UI, one workflow execution UI, one validation/persistence API, and seeded action schema records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Temporal DSL First: pass. The feature treats Action 定義 as a versioned DSL artifact.
- 日本語中心の開発: pass. Feature docs and user-facing copy are Japanese-first.
- 設計書は docs 配下に残す: pass. Supporting design docs are created under `specs/001-action-definition-registration/` and existing `/docs` guidance remains in place.
- 制約は保存時と実行時の両方で検証する: pass. This feature uses save-time validation for definition registration and keeps workflow validation rules aligned.
- スキーマはバージョン付きで互換性を守る: pass. Action 定義 are immutable per version and new content is added as a new version.

No constitutional violations require justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-action-definition-registration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── action-definition-api.md
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

**Structure Decision**: This is a multi-service web application. `servers/backend-workflow` owns Action 定義 persistence and validation, `servers/frontend-workflow` is the management UI for registration and editing, and `servers/saas/frontend` remains the execution-oriented SaaS surface.

## Complexity Tracking

No violations to justify.

