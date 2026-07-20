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
- requestYaml: リクエスト宣言の YAML

## 検証の流れ

1. ノード ID の重複を検出する。
2. 開始ノードと終了ノードの個数を確認する。
3. 接続先・接続元の存在を確認して隣接表を作る。
4. parallel / condition ノードの分岐数を検証する。
5. action ノードが有効なスキーマバージョンを参照しているか確認する。
6. DFS で循環を検出する。
7. 開始ノードから到達できないノードを未接続として扱う。

## API

- `POST /workflow/validate`
- リクエスト本文には `workflow` と任意の `availableActions` を渡す。
- 応答は `valid` と `issues` を返す。

## 今後の拡張候補

- DB からアクションスキーマを読み込む実装
- YAML 宣言の解析と検証
- 実行時 validation と保存時 validation の共通化
- 条件分岐や並列分岐の DSL 表現の厳密化