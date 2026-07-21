import { ActionDefinitionRecord } from '../types/actionDefinition';

interface ActionDefinitionListProps {
  items: ActionDefinitionRecord[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClone: (item: ActionDefinitionRecord) => void;
  onToggleSelectable: (item: ActionDefinitionRecord, nextSelectable: boolean) => Promise<void>;
}

function groupItemsByActionCode(items: ActionDefinitionRecord[]) {
  return items.reduce<Record<string, ActionDefinitionRecord[]>>((groups, item) => {
    groups[item.actionCode] = [...(groups[item.actionCode] ?? []), item];
    return groups;
  }, {});
}

export function ActionDefinitionList({
  items,
  loading,
  selectedId,
  onSelect,
  onClone,
  onToggleSelectable,
}: ActionDefinitionListProps) {
  const groupedItems = groupItemsByActionCode(items);

  if (loading) {
    return <p className="empty-state">Action 定義を読み込んでいます。</p>;
  }

  if (items.length === 0) {
    return <p className="empty-state">Action 定義がまだありません。最初の version を保存してください。</p>;
  }

  return (
    <div className="definition-list">
      {Object.entries(groupedItems).map(([actionCode, definitions]) => (
        <section className="definition-group" key={actionCode}>
          <header className="group-header">
            <h3>{actionCode}</h3>
            <span>{definitions.length} versions</span>
          </header>

          <div className="definition-versions">
            {definitions.map((definition) => (
              <article
                className={`definition-row${selectedId === definition.id ? ' is-selected' : ''}`}
                key={definition.id}
              >
                <button
                  className="row-select"
                  type="button"
                  onClick={() => onSelect(definition.id)}
                >
                  <strong>{definition.version}</strong>
                  <span>{definition.displayName}</span>
                </button>

                <div className="row-meta">
                  <div>
                    <span className="meta-label">selectable</span>
                    <strong>{definition.selectable ? 'true' : 'false'}</strong>
                  </div>
                  <div>
                    <span className="meta-label">更新</span>
                    <strong>{new Date(definition.updatedAt).toLocaleDateString('ja-JP')}</strong>
                  </div>
                </div>

                <div className="row-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => onClone(definition)}
                  >
                    複製
                  </button>

                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => onToggleSelectable(definition, !definition.selectable)}
                  >
                    {definition.selectable ? '候補から外す' : '候補に追加'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}