import { ActionDefinitionRecord } from '../types/actionDefinition';
import { WorkflowNodeInput } from '../types/workflowDefinition';

interface WorkflowNodeInspectorProps {
  selectedNode: WorkflowNodeInput | null;
  actionOptions: ActionDefinitionRecord[];
  onChange: (nodeKey: string, nextValue: Partial<WorkflowNodeInput>) => void;
}

export function WorkflowNodeInspector({ selectedNode, actionOptions, onChange }: WorkflowNodeInspectorProps) {
  if (!selectedNode) {
    return (
      <aside className="panel-card workflow-inspector-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-small">Inspector</p>
            <h2>選択中ノード</h2>
          </div>
        </div>
        <p className="empty-state">ノードを選択すると詳細を編集できます。</p>
      </aside>
    );
  }

  const isActionNode = selectedNode.nodeType === 'action';

  return (
    <aside className="panel-card workflow-inspector-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow eyebrow-small">Inspector</p>
          <h2>{selectedNode.nodeKey}</h2>
        </div>
      </div>

      <div className="workflow-inspector-grid">
        <label>
          <span>表示ラベル</span>
          <input
            value={selectedNode.label}
            onChange={(event) => onChange(selectedNode.nodeKey, { label: event.target.value })}
          />
        </label>

        {isActionNode ? (
          <label>
            <span>Action</span>
            <select
              value={selectedNode.actionDefinitionId ?? ''}
              onChange={(event) =>
                onChange(selectedNode.nodeKey, {
                  actionDefinitionId: event.target.value ? Number(event.target.value) : null,
                })
              }
            >
              <option value="">選択してください</option>
              {actionOptions.map((action) => (
                <option key={action.id} value={action.id} disabled={!action.selectable}>
                  {action.actionCode} / {action.version} {action.selectable ? '' : '(選択不可)'}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          <span>X</span>
          <input
            type="number"
            value={selectedNode.positionX}
            onChange={(event) => onChange(selectedNode.nodeKey, { positionX: Number(event.target.value) })}
          />
        </label>

        <label>
          <span>Y</span>
          <input
            type="number"
            value={selectedNode.positionY}
            onChange={(event) => onChange(selectedNode.nodeKey, { positionY: Number(event.target.value) })}
          />
        </label>
      </div>
    </aside>
  );
}