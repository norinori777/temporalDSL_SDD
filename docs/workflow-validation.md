# Temporal DSL 検証設計

## 目的

この設計は、UI なしでワークフローの制約を先に完成させるためのもの。
Temporal DSL の理解を優先し、ワークフロー構造がどの条件で不正になるかを明確にする。

## 検証対象

- 開始ノードは 1 つだけであること
- 終了ノードは 1 つだけであること
- DFS による循環検出を行うこと
- 開始ノードから到達できないノードを未接続として扱うこと
- 並列ノードは期待分岐数と実際の分岐数が一致すること
- 条件分岐ノードは期待分岐数と実際の分岐数が一致すること
- アクションノードは登録済みのスキーマバージョンを参照すること

## データモデル

### WorkflowDefinition

- nodes: ワークフローを構成するノード配列
- edges: ノード間の接続配列

### WorkflowNode

- id: ノード識別子
- kind: start, end, action, parallel, condition のいずれか
- actionCode / actionVersion: action ノードが参照するスキーマ情報
- expectedBranches: parallel / condition の期待分岐数

### ActionSchemaVersion

- actionCode: アクション識別子
- version: バージョン文字列
- requestDeclarationYaml: リクエスト宣言の YAML

### WorkflowNode の action ノード

- requestYaml: 実際に検証するアクションリクエスト YAML

## 検証の流れ

1. ノード ID の重複を検出する。
2. 開始ノードと終了ノードの個数を確認する。
3. 接続先・接続元の存在を確認して隣接表を作る。
4. parallel / condition ノードの分岐数を検証する。
5. action ノードが有効なスキーマバージョンを参照しているか確認する。
6. requestYaml と requestDeclarationYaml を YAML として解析し、必須キーと許可キーを検証する。
7. DFS で循環を検出する。
8. 開始ノードから到達できないノードを未接続として扱う。

## API

- `POST /workflow/validate`
- リクエスト本文には `workflow` と任意の `availableActions` を渡す。
- 応答は `valid` と `issues` を返す。
- `POST /workflow/validate-db`
- DB からアクションスキーマを読み込み、保存済みの宣言と照合して検証する。
- `GET /action-schemas`
- DB に登録済みのアクションスキーマを一覧取得する。

## YAML 宣言の検証ルール

- `requestDeclarationYaml` はオブジェクト形式であること。
- `requiredKeys` は文字列配列であること。
- `optionalKeys` は文字列配列であること。
- `allowedKeys` は文字列配列であること。
- `requestYaml` はオブジェクト形式であること。
- `requestYaml` には `requiredKeys` の全てが含まれていること。
- `requestYaml` に含まれるキーは `allowedKeys` に含まれること。

## 今後の拡張候補

- DB からアクションスキーマを読み込む実装
- YAML 宣言の解析と検証
- 実行時 validation と保存時 validation の共通化
- 条件分岐や並列分岐の DSL 表現の厳密化