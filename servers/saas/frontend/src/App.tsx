const panels = [
  {
    title: 'Operational console',
    copy: 'SaaS 運用の入口となるシンプルな操作画面を表示します。',
  },
  {
    title: 'Flow visibility',
    copy: '処理のつながりを追いやすい構成にして、後から機能拡張しやすくします。',
  },
  {
    title: 'Composable UI',
    copy: '必要な画面をコンポーネント単位で積み上げられる土台にしています。',
  },
];

export default function App() {
  return (
    <main className="shell">
      <section className="masthead">
        <p className="label">SaaS Platform</p>
        <h1>運用と拡張の両方に耐えるフロントエンド。</h1>
        <p className="summary">
          ここでは最小の Vite + React 構成を提供し、Docker からそのまま配信できる状態にしています。
        </p>
      </section>

      <section className="panel-grid">
        {panels.map((panel) => (
          <article className="panel" key={panel.title}>
            <h2>{panel.title}</h2>
            <p>{panel.copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}