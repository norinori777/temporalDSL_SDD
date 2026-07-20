const availableActions = [
  {
    code: 'microservice1.reserveSlot',
    version: '1.0.0',
    request: 'reservationId, userId, priority, note',
  },
  {
    code: 'microservice2.verifyApproval',
    version: '1.0.0',
    request: 'workflowId, approverId, comment',
  },
  {
    code: 'microservice3.notifyCompletion',
    version: '1.0.0',
    request: 'workflowId, recipient, channel',
  },
];

const workflowNodes = [
  {
    id: 'start-1',
    title: '開始',
    kind: 'start',
    detail: '開始ノードは 1 つだけ',
    tone: 'accent',
  },
  {
    id: 'action-1',
    title: '予約確保',
    kind: 'action',
    detail: 'microservice1.reserveSlot@1.0.0',
    tone: 'neutral',
  },
  {
    id: 'parallel-1',
    title: '並列分岐',
    kind: 'parallel',
    detail: '期待分岐数: 2',
    tone: 'warning',
  },
  {
    id: 'condition-1',
    title: '条件分岐',
    kind: 'condition',
    detail: '期待分岐数: 2',
    tone: 'warning',
  },
  {
    id: 'end-1',
    title: '終了',
    kind: 'end',
    detail: '終了ノードは 1 つだけ',
    tone: 'accent',
  },
];

const validationRules = [
  '開始ノードは 1 つだけ',
  '終了ノードは 1 つだけ',
  'DFS で循環を検出',
  '未接続ノードを検出',
  '並列ノードの分岐数を検証',
  '条件分岐ノードの分岐数を検証',
];

const sampleRequestYaml = `workflowId: wf-001
reservationId: res-001
userId: user-001
priority: high`;

export default function App() {
  return (
    <main className="workflow-page">
      <header className="hero-bar">
        <div>
          <p className="eyebrow">Temporal DSL / workflow studio</p>
          <h1>最小ワークフロー画面</h1>
          <p className="summary">
            アクションを選んで、ノードを組み立て、制約を確認するための最小画面です。
            実装より先に Temporal DSL の構造が見えることを優先しています。
          </p>
        </div>

        <div className="hero-meta">
          <span>対象: SaaS ワークフロー編集</span>
          <span>表示: 静的な最小編集画面</span>
          <span>検証: 画面上で制約を可視化</span>
        </div>
      </header>

      <section className="workspace-grid">
        <aside className="sidebar panel-surface">
          <section>
            <div className="section-header">
              <h2>アクション候補</h2>
              <span>DB 登録済み</span>
            </div>
            <div className="action-list">
              {availableActions.map((action) => (
                <article className="action-card" key={`${action.code}@${action.version}`}>
                  <strong>{action.code}</strong>
                  <span>version {action.version}</span>
                  <small>request: {action.request}</small>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="section-header">
              <h2>検証ルール</h2>
              <span>保存前チェック</span>
            </div>
            <ul className="rule-list">
              {validationRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="canvas panel-surface">
          <div className="section-header">
            <h2>ワークフロー</h2>
            <span>開始 → アクション → 分岐 → 終了</span>
          </div>

          <div className="flow-column">
            {workflowNodes.map((node, index) => (
              <div className="flow-step" key={node.id}>
                <div className={`node node-${node.tone}`}>
                  <p className="node-kind">{node.kind}</p>
                  <h3>{node.title}</h3>
                  <p>{node.detail}</p>
                  <code>{node.id}</code>
                </div>

                {index < workflowNodes.length - 1 ? (
                  <div className="connector" aria-hidden="true">
                    <span />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <aside className="inspector panel-surface">
          <section>
            <div className="section-header">
              <h2>選択中ノード</h2>
              <span>action-1</span>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>actionCode</dt>
                <dd>microservice1.reserveSlot</dd>
              </div>
              <div>
                <dt>version</dt>
                <dd>1.0.0</dd>
              </div>
              <div>
                <dt>requestYaml</dt>
                <dd>
                  <pre>{sampleRequestYaml}</pre>
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <div className="section-header">
              <h2>保存状態</h2>
              <span>valid</span>
            </div>
            <div className="status-card">
              <strong>制約チェック済み</strong>
              <p>開始ノード 1、終了ノード 1、循環なし、未接続なし。</p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}