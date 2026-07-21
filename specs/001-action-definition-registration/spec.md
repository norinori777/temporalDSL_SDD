# Feature Specification: Action定義を画面から登録し、定義内容を検証できるようにする

**Feature Branch**: `001-action-definition-registration`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "Actionの定義を画面から登録できるようにする。定義内容のチェックする仕組み実装する。"

## Clarifications

### Session 2026-07-20

- Q: Action定義の変更はどう扱うか → A: 既存バージョンは不変にし、内容変更は新しい version として登録する
- Q: Action定義の画面配置はどこに置くか → A: SaaS は実行専用とし、Action定義の登録・変更・削除はワークフロー管理側に置く
- Q: 管理画面はどこに置くか → A: 既存の `servers/frontend-workflow` を Action 定義の管理画面として使う
- Q: Action定義の内容検証はいつ行うか → A: 保存時のみ検証する

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Action定義の登録 (Priority: P1)

利用者が画面から Action 定義を新規登録し、保存できる。

**Why this priority**: ワークフロー編集や実行前検証の前提となる基本機能であり、Temporal DSL の学習でも最初に必要になる。

**Independent Test**: 画面から Action 名、バージョン、リクエスト宣言、表示可否を入力し、保存後に一覧へ反映されることを確認できる。

**Acceptance Scenarios**:

1. **Given** Action 定義一覧が表示されている, **When** 利用者が新しい定義を入力して保存する, **Then** 定義が登録され一覧に表示される
2. **Given** 既存の Action 定義がある, **When** 利用者が別バージョンの定義を保存する, **Then** 同じ Action 名でもバージョン違いとして登録できる

---

### User Story 2 - 定義内容の検証 (Priority: P1)

利用者が登録前に Action 定義の内容を検証し、問題があれば修正できる。

**Why this priority**: 誤った定義を DB に保存すると、ワークフロー選択や実行時 validation に影響するため、登録と同じくらい重要である。

**Independent Test**: 不正な入力を与えたときに、保存されず、どの項目が不正か画面で確認できる。

**Acceptance Scenarios**:

1. **Given** 必須項目が未入力である, **When** 利用者が検証または保存を実行する, **Then** 不足項目が明示され保存されない
2. **Given** バージョン形式や YAML 宣言が不正である, **When** 利用者が検証を実行する, **Then** 不正な箇所が明示される
3. **Given** 同じ Action 名とバージョンの定義が既に存在する, **When** 利用者が重複登録しようとする, **Then** 重複であることが示され保存されない

---

### User Story 3 - 画面で選択可能な定義の管理 (Priority: P2)

登録した Action 定義のうち、ワークフロー画面で選択可能なものを管理できる。

**Why this priority**: ワークフロー組み立ての候補を制御できることで、学習対象の DSL が実運用に近づく。

**Independent Test**: selectable の切り替えによって、ワークフロー側の候補表示が変わることを確認できる。

**Acceptance Scenarios**:

1. **Given** selectable が true の定義がある, **When** ワークフロー画面が候補を取得する, **Then** その定義が選択可能として表示される
2. **Given** selectable が false の定義がある, **When** ワークフロー画面が候補を取得する, **Then** その定義は選択候補に表示されない

### User Story 4 - 定義管理と実行面の分離 (Priority: P2)

利用者はワークフロー管理側で Action 定義を登録・変更・削除し、SaaS 側はワークフロー実行に専念する。

**Why this priority**: 実行系と管理系を分けることで、Temporal DSL の構造を学びやすくし、責務を明確にできる。

**Independent Test**: ワークフロー管理側で定義を変更し、SaaS 側では実行系の画面と候補表示のみが維持されることを確認できる。

**Acceptance Scenarios**:

1. **Given** SaaS 実行画面が表示されている, **When** 利用者が定義管理を探す, **Then** 定義の登録・変更・削除は表示されない
2. **Given** ワークフロー管理画面が表示されている, **When** 利用者が Action 定義を登録する, **Then** その定義が選択候補として利用可能になる

### User Story 5 - 既存管理画面での定義一覧 (Priority: P3)

利用者は既存の管理画面で Action 定義一覧を確認し、編集対象を選べる。

**Why this priority**: 登録後の確認と運用のしやすさを確保するために必要だが、P1/P2 より後でよい。

**Independent Test**: 既存管理画面を開き、登録済み定義が一覧表示されることを確認できる。

**Acceptance Scenarios**:

1. **Given** Action 定義が登録されている, **When** 管理画面を開く, **Then** 定義一覧が表示される
2. **Given** 複数バージョンの定義がある, **When** 利用者が一覧を見る, **Then** 同一 Action 名でも version ごとに表示される

---

## Edge Cases

- Action 名は同じでも、バージョンが異なれば別定義として扱う
- バージョンは後方互換を意識して保存し、古い定義は残せるようにする
- YAML 宣言が空、または構文不正のときは登録を止める
- 必須キーと許可キーの関係が矛盾する場合は登録を止める
- selectable が未指定の場合は既定値を明示する
- 重複する Action 名 + バージョンの組み合わせは許可しない

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 利用者は画面から Action 定義を新規登録できなければならない
- **FR-002**: 利用者は Action 名、バージョン、リクエスト宣言、選択可否を入力できなければならない
- **FR-003**: システムは Action 名とバージョンの組み合わせを一意として扱わなければならない
- **FR-004**: システムは登録前に定義内容を検証し、問題がある場合は保存を拒否しなければならない
- **FR-005**: システムは YAML 宣言の構文と構造を検証しなければならない
- **FR-006**: システムは必須キー、任意キー、許可キーの関係を検証しなければならない
- **FR-007**: システムは検証失敗時に、どの項目が不正かを利用者に分かる形で表示しなければならない
- **FR-008**: システムは登録済み定義のうち、選択可能なものだけをワークフロー画面で候補として扱わなければならない
- **FR-009**: システムは定義の選択可否を後から更新できなければならない
- **FR-010**: システムは登録済み定義を一覧で確認できなければならない
- **FR-011**: システムは既存バージョンの Action 定義を上書きせず、変更は新しい version として登録しなければならない
- **FR-012**: システムは同一 Action 名の複数 version を履歴として保持しなければならない
- **FR-013**: システムは Action 定義の内容検証を保存時に実行しなければならない
- **FR-014**: システムは検証結果が正常なときのみ保存を確定しなければならない

### Key Entities *(include if feature involves data)*

- **ActionDefinition**: Action 名、バージョン、選択可否、表示名、リクエスト宣言 YAML を持つ定義
- **ActionDefinitionValidationResult**: 検証の成否とエラー一覧を持つ結果
- **ActionDefinitionListItem**: 一覧表示用の要約情報
- **ActionDefinitionVersion**: 同一 Action 名に属する個別の version レコード

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 利用者は 5 分以内に Action 定義を 1 件登録できる
- **SC-002**: 不正な定義は 100% 保存前に検出される
- **SC-003**: 画面での登録結果に対して、少なくとも 90% の利用者が 1 回の操作で不備箇所を特定できる
- **SC-004**: 選択可否の切り替えが 10 秒以内に候補一覧へ反映される

## Assumptions

- 対象は SaaSから実行されるのワークフロー編集を支える Action 定義管理である
- バックエンドの永続化は既存 DB を利用する
- YAML 宣言は人が読める設定として扱い、厳密なコード実行はしない
- モバイル対応は初期スコープ外である
- 画面は最小機能から開始し、詳細な UI/UX は後続で拡張する
