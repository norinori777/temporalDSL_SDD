# Action Schema Seed

## 目的

バックエンド検証ロジックが参照する初期のアクションスキーマを DB に入れる。
Temporal DSL を理解しやすくするため、3 つのマイクロサービスに対応したアクションを登録する。

## 登録内容

- `microservice1.reserveSlot`
  - version: `0.9.0`
  - selectable: `false`
  - version 移行前の例として保存する
- `microservice1.reserveSlot`
  - version: `1.0.0`
  - selectable: `true`
- `microservice2.verifyApproval`
  - version: `1.0.0`
  - selectable: `true`
- `microservice3.notifyCompletion`
  - version: `1.0.0`
  - selectable: `true`

## YAML 宣言の考え方

各レコードには `requestDeclarationYaml` を保存し、以下を表現する。

- `requiredKeys`: 必須キー
- `optionalKeys`: 任意キー
- `allowedKeys`: 許可キー

この宣言は、画面上の選択可能なアクション判定と、実行時の requestYaml 検証の両方に使う。