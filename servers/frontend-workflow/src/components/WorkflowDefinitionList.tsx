import { WorkflowDefinitionSummaryRecord, WorkflowVersionRecord } from '../types/workflowDefinition';

interface WorkflowDefinitionListProps {
  items: WorkflowDefinitionSummaryRecord[];
  versionsByDefinitionId: Record<number, WorkflowVersionRecord[]>;
  selectedWorkflowDefinitionId: number | null;
  selectedWorkflowVersion: number | null;
  loading: boolean;
  onSelectDefinition: (workflowDefinitionId: number) => void;
  onSelectVersion: (workflowDefinitionId: number, version: number) => void;
  onCreateNew: () => void;
}

export function WorkflowDefinitionList({
  items,
  versionsByDefinitionId,
  selectedWorkflowDefinitionId,
  selectedWorkflowVersion,
  loading,
  onSelectDefinition,
  onSelectVersion,
  onCreateNew,
}: WorkflowDefinitionListProps) {
  if (loading) {
    return <p className="empty-state">ワークフロー一覧を読み込んでいます。</p>;
  }

  if (items.length === 0) {
    return (
      <div className="empty-state workflow-empty">
        <p>保存済みワークフローはまだありません。</p>
        <button className="text-button" type="button" onClick={onCreateNew}>
          新規作成
        </button>
      </div>
    );
  }

  return (
    <div className="definition-list workflow-definition-list">
      {items.map((item) => {
        const versions = versionsByDefinitionId[item.workflowDefinitionId] ?? [];
        const isSelected = selectedWorkflowDefinitionId === item.workflowDefinitionId;

        return (
          <section
            className={`definition-group workflow-definition-group${isSelected ? ' is-selected' : ''}`}
            key={item.workflowDefinitionId}
          >
            <header className="group-header workflow-group-header">
              <button
                className="row-select workflow-definition-button"
                type="button"
                onClick={() => onSelectDefinition(item.workflowDefinitionId)}
              >
                <strong>{item.name}</strong>
                <span>current v{item.currentVersion}</span>
              </button>
              <span>{new Date(item.updatedAt).toLocaleDateString('ja-JP')}</span>
            </header>

            <p className="workflow-description">{item.description || '説明はありません。'}</p>

            <div className="workflow-version-pills">
              {versions.map((version) => (
                <button
                  key={version.workflowVersionId}
                  type="button"
                  className={`version-pill${selectedWorkflowVersion === version.version ? ' is-selected' : ''}`}
                  onClick={() => onSelectVersion(item.workflowDefinitionId, version.version)}
                >
                  v{version.version}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}