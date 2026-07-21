import { ReactNode } from 'react';

interface SummaryItem {
  label: string;
  value: string;
}

interface WorkflowEditorShellProps {
  summaryItems: SummaryItem[];
  children: ReactNode;
}

export function WorkflowEditorShell({ summaryItems, children }: WorkflowEditorShellProps) {
  return (
    <main className="management-shell workflow-shell">
      <header className="hero-card hero-layout workflow-hero">
        <div>
          <p className="eyebrow">Workflow Builder</p>
          <h1>Action をつないでワークフローを登録する。</h1>
          <p className="hero-copy">
            ノードを組み立て、接続し、保存前に検証します。保存後の版は不変で、再編集すると新しい版が作られます。
          </p>
        </div>

        <div className="hero-meta">
          {summaryItems.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </header>

      {children}
    </main>
  );
}