import { ActionDefinitionRecord } from '../types/actionDefinition';
import {
  WorkflowDefinitionInput,
  WorkflowEdgeInput,
  WorkflowNodeInput,
} from '../types/workflowDefinition';

interface WorkflowEditorCanvasProps {
  value: WorkflowDefinitionInput;
  selectedNodeKey: string | null;
  actionOptions: ActionDefinitionRecord[];
  fromNodeKey: string;
  toNodeKey: string;
  onSelectNode: (nodeKey: string) => void;
  onAddActionNode: () => void;
  onRemoveNode: (nodeKey: string) => void;
  onAddEdge: (edge: WorkflowEdgeInput) => void;
  onRemoveEdge: (fromNodeKey: string, toNodeKey: string) => void;
  onChangeNode: (nodeKey: string, nextValue: Partial<WorkflowNodeInput>) => void;
  onFromNodeKeyChange: (nodeKey: string) => void;
  onToNodeKeyChange: (nodeKey: string) => void;
}

export function WorkflowEditorCanvas({
  value,
  selectedNodeKey,
  actionOptions,
  fromNodeKey,
  toNodeKey,
  onSelectNode,
  onAddActionNode,
  onRemoveNode,
  onAddEdge,
  onRemoveEdge,
  onChangeNode,
  onFromNodeKeyChange,
  onToNodeKeyChange,
}: WorkflowEditorCanvasProps) {
  const actionLabels = new Map(actionOptions.map((action) => [action.id, `${action.actionCode} / ${action.version}`]));

  function handleAddEdge() {
    if (!fromNodeKey || !toNodeKey || fromNodeKey === toNodeKey) {
      return;
    }

    onAddEdge({ fromNodeKey, toNodeKey });
  }

  return (
    <section className="panel-card workflow-canvas-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow eyebrow-small">Editor</p>
          <h2>ノードと接続を編集</h2>
        </div>

        <button className="primary-button" type="button" onClick={onAddActionNode}>
          Action ノードを追加
        </button>
      </div>

      <div className="workflow-canvas-summary">
        <div>
          <span className="meta-label">nodes</span>
          <strong>{value.nodes.length}</strong>
        </div>
        <div>
          <span className="meta-label">edges</span>
          <strong>{value.edges.length}</strong>
        </div>
      </div>

      <div className="workflow-node-grid">
        {value.nodes.map((node) => (
          <article
            key={node.nodeKey}
            className={`workflow-node-card${selectedNodeKey === node.nodeKey ? ' is-selected' : ''}`}
          >
            <button className="workflow-node-button" type="button" onClick={() => onSelectNode(node.nodeKey)}>
              <span className="workflow-node-kind">{node.nodeType}</span>
              <strong>{node.label}</strong>
              <span>{node.nodeKey}</span>
              {node.nodeType === 'action' ? (
                <em>
                  {node.actionDefinitionId ? actionLabels.get(node.actionDefinitionId) ?? `Action #${node.actionDefinitionId}` : 'Action 未選択'}
                </em>
              ) : null}
            </button>

            <div className="row-actions">
              <button className="ghost-button" type="button" onClick={() => onSelectNode(node.nodeKey)}>
                編集
              </button>
              {node.nodeType === 'action' ? (
                <button className="ghost-button" type="button" onClick={() => onRemoveNode(node.nodeKey)}>
                  削除
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="workflow-connection-editor">
        <div>
          <span className="meta-label">from</span>
          <select value={fromNodeKey} onChange={(event) => onFromNodeKeyChange(event.target.value)}>
            <option value="">選択してください</option>
            {value.nodes.map((node) => (
              <option key={node.nodeKey} value={node.nodeKey}>
                {node.label} ({node.nodeType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="meta-label">to</span>
          <select value={toNodeKey} onChange={(event) => onToNodeKeyChange(event.target.value)}>
            <option value="">選択してください</option>
            {value.nodes.map((node) => (
              <option key={node.nodeKey} value={node.nodeKey}>
                {node.label} ({node.nodeType})
              </option>
            ))}
          </select>
        </div>

        <button className="primary-button" type="button" onClick={handleAddEdge}>
          接続を追加
        </button>
      </div>

      <div className="workflow-edge-list">
        {value.edges.length === 0 ? (
          <p className="empty-state">まだ接続がありません。</p>
        ) : (
          value.edges.map((edge) => (
            <article className="workflow-edge-row" key={`${edge.fromNodeKey}-${edge.toNodeKey}`}>
              <span>{edge.fromNodeKey}</span>
              <strong>→</strong>
              <span>{edge.toNodeKey}</span>
              <button className="ghost-button" type="button" onClick={() => onRemoveEdge(edge.fromNodeKey, edge.toNodeKey)}>
                削除
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}