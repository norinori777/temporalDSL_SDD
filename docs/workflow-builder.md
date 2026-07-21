# Workflow Builder

## 目的

この設計は、登録済み Action を組み合わせてワークフローを画面から登録し、保存前にノード接続の整合性を確認するためのもの。

## 画面の役割

- 左側: 保存済みワークフローと版一覧
- 中央: ノード追加、接続、保存の編集領域
- 右側: 選択中ノードの詳細と検証結果

## データ方針

- ワークフローは `WorkflowDefinition` と `WorkflowVersion` に分けて保持する
- 版は保存後に不変とする
- `WorkflowNode` と `WorkflowEdge` は正規化して保存する
- Action 参照は保存済み Action 定義の ID を使う

## 検証ルール

- 開始ノードは 1 つだけ
- 終了ノードは 1 つだけ
- 分岐と合流は許可する
- 循環は不許可とする
- 開始ノードから到達できないノードは不正とする
- 終了ノードへ到達できないノードは不正とする
- Action 参照が存在しない、または selectable でないノードは不正とする

## API

- `GET /workflow-definitions`
- `GET /workflow-definitions/{workflowDefinitionId}/versions`
- `GET /workflow-definitions/{workflowDefinitionId}/versions/{version}`
- `POST /workflow-definitions/validate`
- `POST /workflow-definitions`

## 今後の拡張候補

- ノードのドラッグ&ドロップ配置
- 差分表示と版比較
- 実行時 validation との共通化
- 保存済みワークフローの複製作成