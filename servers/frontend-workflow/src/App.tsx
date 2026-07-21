import { useEffect, useMemo, useState } from 'react';
import { ActionDefinitionForm } from './components/ActionDefinitionForm';
import { ActionDefinitionList } from './components/ActionDefinitionList';
import {
  ActionDefinitionInput,
  ActionDefinitionRecord,
  ActionDefinitionValidationIssue,
} from './types/actionDefinition';
import {
  createActionDefinition,
  listActionDefinitions,
  updateActionDefinitionSelectable,
  ActionDefinitionApiError,
} from './services/actionDefinitionApi';

const emptyDraft = (): ActionDefinitionInput => ({
  actionCode: '',
  version: '',
  displayName: '',
  requestDeclarationYaml: `requiredKeys:
  - workflowId
optionalKeys:
  - note
allowedKeys:
  - workflowId
  - note
`,
  selectable: true,
});

export default function App() {
  const [definitions, setDefinitions] = useState<ActionDefinitionRecord[]>([]);
  const [draft, setDraft] = useState<ActionDefinitionInput>(emptyDraft);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [validationIssues, setValidationIssues] = useState<ActionDefinitionValidationIssue[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDefinitions() {
      setLoading(true);
      try {
        const items = await listActionDefinitions();
        if (cancelled) {
          return;
        }

        setDefinitions(items);
        setSelectedId((current) => current ?? items[0]?.id ?? null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatusMessage(error instanceof Error ? error.message : 'Action 定義の読み込みに失敗しました。');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDefinitions();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDefinition = useMemo(
    () => definitions.find((definition) => definition.id === selectedId) ?? null,
    [definitions, selectedId],
  );

  async function handleSubmit() {
    setSaving(true);
    setValidationIssues([]);
    setStatusMessage('');

    try {
      const createdDefinition = await createActionDefinition(draft);
      const refreshedDefinitions = await listActionDefinitions();
      setDefinitions(refreshedDefinitions);
      setSelectedId(createdDefinition.id);
      setDraft(emptyDraft());
      setStatusMessage(`Action 定義 ${createdDefinition.actionCode} ${createdDefinition.version} を保存しました。`);
    } catch (error) {
      if (error instanceof ActionDefinitionApiError) {
        setValidationIssues(error.issues);
        setStatusMessage(error.message);
      } else {
        setStatusMessage(error instanceof Error ? error.message : '保存に失敗しました。');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSelectable(definition: ActionDefinitionRecord, nextSelectable: boolean) {
    try {
      const updatedDefinition = await updateActionDefinitionSelectable(definition.id, nextSelectable);
      setDefinitions((current) =>
        current.map((item) => (item.id === updatedDefinition.id ? updatedDefinition : item)),
      );
      setStatusMessage(
        `Action 定義 ${updatedDefinition.actionCode} ${updatedDefinition.version} の selectable を更新しました。`,
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'selectable の更新に失敗しました。');
    }
  }

  function handleCloneDefinition(definition: ActionDefinitionRecord) {
    setDraft({
      actionCode: definition.actionCode,
      version: '',
      displayName: definition.displayName,
      requestDeclarationYaml: definition.requestDeclarationYaml,
      selectable: definition.selectable,
    });
    setStatusMessage(`${definition.actionCode} ${definition.version} を複製して新しい version を作成できます。`);
  }

  function handleResetDraft() {
    setDraft(emptyDraft());
    setValidationIssues([]);
    setStatusMessage('入力欄を初期化しました。');
  }

  return (
    <main className="management-shell">
      <header className="hero-card hero-layout">
        <div>
          <p className="eyebrow">Action Definition Management</p>
          <h1>Action 定義を登録し、保存時に検証する。</h1>
          <p className="hero-copy">
            既存 version は不変のまま、新しい Action 定義を追加します。workflow 側で利用する候補は
            selectable で制御し、SaaS 側は実行専用に保ちます。
          </p>
        </div>

        <div className="hero-meta">
          <div>
            <strong>{definitions.length}</strong>
            <span>saved versions</span>
          </div>
          <div>
            <strong>{definitions.filter((definition) => definition.selectable).length}</strong>
            <span>selectable</span>
          </div>
          <div>
            <strong>{selectedDefinition ? '1' : '0'}</strong>
            <span>selected target</span>
          </div>
        </div>
      </header>

      <section className="content-grid">
        <article className="panel-card form-panel">
          <ActionDefinitionForm
            value={draft}
            validationIssues={validationIssues}
            saving={saving}
            onChange={setDraft}
            onSubmit={handleSubmit}
            onReset={handleResetDraft}
          />
        </article>

        <aside className="panel-card inspector-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-small">Status</p>
              <h2>保存結果と選択対象</h2>
            </div>
          </div>

          <div className="status-card" aria-live="polite">
            <p>{statusMessage || '保存すると結果がここに表示されます。'}</p>
          </div>

          <div className="selected-card">
            {selectedDefinition ? (
              <>
                <p className="selected-label">選択中</p>
                <h3>
                  {selectedDefinition.actionCode}
                  <span>{selectedDefinition.version}</span>
                </h3>
                <dl>
                  <div>
                    <dt>表示名</dt>
                    <dd>{selectedDefinition.displayName}</dd>
                  </div>
                  <div>
                    <dt>selectable</dt>
                    <dd>{selectedDefinition.selectable ? 'true' : 'false'}</dd>
                  </div>
                  <div>
                    <dt>更新日時</dt>
                    <dd>{new Date(selectedDefinition.updatedAt).toLocaleString('ja-JP')}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p>一覧から version を選択すると詳細を表示します。</p>
            )}
          </div>
        </aside>
      </section>

      <section className="panel-card list-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-small">Definitions</p>
            <h2>登録済み Action 定義</h2>
          </div>

          <button className="text-button" type="button" onClick={handleResetDraft}>
            新しい version を作る
          </button>
        </div>

        <ActionDefinitionList
          items={definitions}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClone={handleCloneDefinition}
          onToggleSelectable={handleToggleSelectable}
        />
      </section>
    </main>
  );
}