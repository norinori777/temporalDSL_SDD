import { WorkflowValidationResult } from '../types/workflowDefinition';

interface WorkflowValidationPanelProps {
  validationResult: WorkflowValidationResult | null;
  saving: boolean;
}

export function WorkflowValidationPanel({ validationResult, saving }: WorkflowValidationPanelProps) {
  const issues = validationResult?.issues ?? [];

  return (
    <aside className="panel-card workflow-validation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow eyebrow-small">Validation</p>
          <h2>保存前の検証</h2>
        </div>
      </div>

      <div className="status-card">
        <p>
          {saving
            ? '保存中です。'
            : validationResult?.valid
              ? '検証に成功しました。'
              : '保存前に検証を実行してください。'}
        </p>
      </div>

      {issues.length === 0 ? (
        <p className="empty-state workflow-validation-empty">検証結果はここに表示されます。</p>
      ) : (
        <ul className="workflow-validation-list">
          {issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`}>
              <strong>{issue.code}</strong>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}