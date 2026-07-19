const workflows = [
  {
    title: 'Temporal orchestration',
    description: 'ワークフロー実行とリトライを一元管理し、外部処理の失敗を吸収します。',
  },
  {
    title: 'Microservice coordination',
    description: '複数のサービスをまたぐ処理を、明確な契約と可観測性でつなぎます。',
  },
  {
    title: 'SaaS delivery',
    description: 'SaaS 用の操作画面やバックエンドを同じ基盤上で分離して運用できます。',
  },
];

export default function App() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Temporal DSL SDD</p>
        <h1>分散処理を、見通しよく扱えるフロントエンド。</h1>
        <p className="hero-copy">
          Temporal、複数のマイクロサービス、SaaS をまとめて扱うためのエントリーポイントです。
          Docker でそのまま立ち上がる最小フロントエンドとして用意しています。
        </p>

        <div className="stats-row">
          <div>
            <strong>3</strong>
            <span>microservices</span>
          </div>
          <div>
            <strong>1</strong>
            <span>workflow layer</span>
          </div>
          <div>
            <strong>1</strong>
            <span>saas surface</span>
          </div>
        </div>
      </section>

      <section className="feature-grid" aria-label="主要機能">
        {workflows.map((workflow) => (
          <article className="feature-card" key={workflow.title}>
            <h2>{workflow.title}</h2>
            <p>{workflow.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}