import { useEffect, useMemo, useState } from 'react';
import { listActionDefinitions, ActionDefinitionRecord } from './services/actionDefinitionApi';
import {
  createWorkflowDefinition,
  getWorkflowVersion,
  listWorkflowDefinitions,
  listWorkflowVersions,
  validateWorkflowDefinition,
} from './services/workflowDefinitionApi';
import { WorkflowEditorShell } from './components/WorkflowEditorShell';
import { WorkflowDefinitionList } from './components/WorkflowDefinitionList';
import { WorkflowEditorCanvas } from './components/WorkflowEditorCanvas';
import { WorkflowNodeInspector } from './components/WorkflowNodeInspector';
import { WorkflowValidationPanel } from './components/WorkflowValidationPanel';
import {
  WorkflowDefinitionInput,
  WorkflowDefinitionSummaryRecord,
  WorkflowNodeInput,
  WorkflowValidationResult,
  WorkflowVersionRecord,
} from './types/workflowDefinition';

function createDefaultDraft(): WorkflowDefinitionInput {
  return {
    name: '',
    description: '',
    nodes: [
      { nodeKey: 'start', nodeType: 'start', label: '開始', positionX: 0, positionY: 0 },
      { nodeKey: 'end', nodeType: 'end', label: '終了', positionX: 0, positionY: 0 },
    ],
    edges: [],
  };
}

function createActionNodeKey(nodes: WorkflowNodeInput[]): string {
  const actionNodeCount = nodes.filter((node) => node.nodeType === 'action').length + 1;
  return `action-${actionNodeCount}`;
}

function toWorkflowDraft(version: WorkflowVersionRecord): WorkflowDefinitionInput {
  return {
    workflowDefinitionId: version.workflowDefinitionId,
    name: version.name,
    description: version.description,
    nodes: version.nodes.map((node) => ({
      nodeKey: node.nodeKey,
      nodeType: node.nodeType,
      label: node.label,
      actionDefinitionId: node.actionDefinitionId ?? null,
      positionX: node.positionX,
      positionY: node.positionY,
    })),
    edges: version.edges.map((edge) => ({
      fromNodeKey: edge.fromNodeKey,
      toNodeKey: edge.toNodeKey,
      label: edge.label,
    })),
  };
}

export default function App() {
  const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinitionSummaryRecord[]>([]);
  const [workflowVersionsByDefinitionId, setWorkflowVersionsByDefinitionId] = useState<Record<number, WorkflowVersionRecord[]>>({});
  const [actionDefinitions, setActionDefinitions] = useState<ActionDefinitionRecord[]>([]);
  const [draft, setDraft] = useState<WorkflowDefinitionInput>(createDefaultDraft);
  const [selectedWorkflowDefinitionId, setSelectedWorkflowDefinitionId] = useState<number | null>(null);
  const [selectedWorkflowVersion, setSelectedWorkflowVersion] = useState<number | null>(null);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>('start');
  const [fromNodeKey, setFromNodeKey] = useState('start');
  const [toNodeKey, setToNodeKey] = useState('end');
  const [validationResult, setValidationResult] = useState<WorkflowValidationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      try {
        const [workflowList, actions] = await Promise.all([
          listWorkflowDefinitions(),
          listActionDefinitions(),
        ]);

        if (cancelled) {
          return;
        }

        setWorkflowDefinitions(workflowList);
        setActionDefinitions(actions);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatusMessage(error instanceof Error ? error.message : '初期データの読み込みに失敗しました。');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectableActionDefinitions = useMemo(
    () => actionDefinitions.filter((action) => action.selectable),
    [actionDefinitions],
  );

  const selectedNode = useMemo(
    () => draft.nodes.find((node) => node.nodeKey === selectedNodeKey) ?? null,
    [draft.nodes, selectedNodeKey],
  );

  async function loadVersions(workflowDefinitionId: number) {
    const versions = await listWorkflowVersions(workflowDefinitionId);
    setWorkflowVersionsByDefinitionId((current) => ({
      ...current,
      [workflowDefinitionId]: versions,
    }));
    return versions;
  }

  async function handleSelectWorkflowDefinition(workflowDefinitionId: number) {
    try {
      setSelectedWorkflowDefinitionId(workflowDefinitionId);
      const versions = workflowVersionsByDefinitionId[workflowDefinitionId] ?? (await loadVersions(workflowDefinitionId));
      const latestVersion = versions[versions.length - 1];

      if (latestVersion) {
        setSelectedWorkflowVersion(latestVersion.version);
        setDraft(toWorkflowDraft(latestVersion));
        setSelectedNodeKey(latestVersion.nodes[0]?.nodeKey ?? null);
        setStatusMessage(`ワークフロー ${latestVersion.name} の v${latestVersion.version} を読み込みました。`);
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'ワークフローの読み込みに失敗しました。');
    }
  }

  async function handleSelectWorkflowVersion(workflowDefinitionId: number, version: number) {
    try {
      const versionRecord = await getWorkflowVersion(workflowDefinitionId, version);
      setSelectedWorkflowDefinitionId(workflowDefinitionId);
      setSelectedWorkflowVersion(version);
      setDraft(toWorkflowDraft(versionRecord));
      setSelectedNodeKey(versionRecord.nodes[0]?.nodeKey ?? null);
      setStatusMessage(`ワークフロー ${versionRecord.name} の v${versionRecord.version} を読み込みました。`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'ワークフロー版の読み込みに失敗しました。');
    }
  }

  function handleCreateNew() {
    setSelectedWorkflowDefinitionId(null);
    setSelectedWorkflowVersion(null);
    setDraft(createDefaultDraft());
    setSelectedNodeKey('start');
    setFromNodeKey('start');
    setToNodeKey('end');
    setValidationResult(null);
    setStatusMessage('新しいワークフローを作成します。');
  }

  function handleAddActionNode() {
    const nodeKey = createActionNodeKey(draft.nodes);
    const nextNode: WorkflowNodeInput = {
      nodeKey,
      nodeType: 'action',
      label: `Action ${draft.nodes.filter((node) => node.nodeType === 'action').length + 1}`,
      actionDefinitionId: selectableActionDefinitions[0]?.id ?? null,
      positionX: 0,
      positionY: 0,
    };

    setDraft((current) => ({
      ...current,
      nodes: [...current.nodes, nextNode],
    }));
    setSelectedNodeKey(nodeKey);
  }

  function handleRemoveNode(nodeKey: string) {
    if (nodeKey === 'start' || nodeKey === 'end') {
      return;
    }

    setDraft((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.nodeKey !== nodeKey),
      edges: current.edges.filter((edge) => edge.fromNodeKey !== nodeKey && edge.toNodeKey !== nodeKey),
    }));

    if (selectedNodeKey === nodeKey) {
      setSelectedNodeKey(null);
    }
  }

  function handleAddEdge(edge: { fromNodeKey: string; toNodeKey: string; label?: string }) {
    setDraft((current) => ({
      ...current,
      edges: [...current.edges, edge],
    }));
  }

  function handleRemoveEdge(fromNodeKey: string, toNodeKey: string) {
    setDraft((current) => ({
      ...current,
      edges: current.edges.filter((edge) => edge.fromNodeKey !== fromNodeKey || edge.toNodeKey !== toNodeKey),
    }));
  }

  function handleChangeNode(nodeKey: string, nextValue: Partial<WorkflowNodeInput>) {
    setDraft((current) => ({
      ...current,
      nodes: current.nodes.map((node) => (node.nodeKey === nodeKey ? { ...node, ...nextValue } : node)),
    }));
  }

  async function handleValidate() {
    try {
      const result = await validateWorkflowDefinition(draft);
      setValidationResult(result);
      setStatusMessage(result.valid ? '検証に成功しました。' : '検証で問題が見つかりました。');
    } catch (error) {
      const typedError = error as Error & { issues?: WorkflowValidationResult['issues'] };
      setStatusMessage(error instanceof Error ? error.message : '検証に失敗しました。');
      if (typedError.issues) {
        setValidationResult({
          valid: false,
          issues: typedError.issues ?? [],
        });
      }
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await createWorkflowDefinition(draft);
      setValidationResult({ valid: true, issues: [] });
      setStatusMessage(`ワークフロー ${result.name} の v${result.version} を保存しました。`);
      setSelectedWorkflowDefinitionId(result.workflowDefinitionId);
      setSelectedWorkflowVersion(result.version);
      setDraft(toWorkflowDraft(result));
      setSelectedNodeKey(result.nodes[0]?.nodeKey ?? null);
      setFromNodeKey(result.nodes[0]?.nodeKey ?? '');
      setToNodeKey(result.nodes[1]?.nodeKey ?? '');

      const refreshedDefinitions = await listWorkflowDefinitions();
      setWorkflowDefinitions(refreshedDefinitions);
      await loadVersions(result.workflowDefinitionId);
    } catch (error) {
      const typedError = error as Error & { issues?: WorkflowValidationResult['issues'] };
      if (typedError.issues) {
        setValidationResult({ valid: false, issues: typedError.issues });
      }
      setStatusMessage(error instanceof Error ? error.message : '保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkflowEditorShell
      summaryItems={[
        { label: '保存済みワークフロー', value: String(workflowDefinitions.length) },
        { label: 'Action 候補', value: String(selectableActionDefinitions.length) },
        { label: '選択ノード', value: selectedNode ? selectedNode.nodeKey : 'なし' },
      ]}
    >
      <section className="content-grid workflow-layout">
        <div className="workflow-left-column">
          <section className="panel-card workflow-meta-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow eyebrow-small">Workflow</p>
                <h2>ワークフロー情報</h2>
              </div>

              <div className="row-actions">
                <button className="text-button" type="button" onClick={handleCreateNew}>
                  新規作成
                </button>
                <button className="primary-button" type="button" onClick={handleValidate} disabled={saving}>
                  検証
                </button>
                <button className="primary-button" type="button" onClick={handleSave} disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>

            <div className="workflow-meta-grid">
              <label>
                <span>ワークフロー名</span>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="shipping-process"
                />
              </label>

              <label>
                <span>説明</span>
                <input
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="注文処理のワークフロー"
                />
              </label>
            </div>
          </section>

          <WorkflowDefinitionList
            items={workflowDefinitions}
            versionsByDefinitionId={workflowVersionsByDefinitionId}
            selectedWorkflowDefinitionId={selectedWorkflowDefinitionId}
            selectedWorkflowVersion={selectedWorkflowVersion}
            loading={loading}
            onSelectDefinition={handleSelectWorkflowDefinition}
            onSelectVersion={handleSelectWorkflowVersion}
            onCreateNew={handleCreateNew}
          />
        </div>

        <WorkflowEditorCanvas
          value={draft}
          selectedNodeKey={selectedNodeKey}
          actionOptions={actionDefinitions}
          fromNodeKey={fromNodeKey}
          toNodeKey={toNodeKey}
          onSelectNode={setSelectedNodeKey}
          onAddActionNode={handleAddActionNode}
          onRemoveNode={handleRemoveNode}
          onAddEdge={handleAddEdge}
          onRemoveEdge={handleRemoveEdge}
          onChangeNode={handleChangeNode}
          onFromNodeKeyChange={setFromNodeKey}
          onToNodeKeyChange={setToNodeKey}
        />

        <div className="workflow-right-column">
          <WorkflowNodeInspector selectedNode={selectedNode} actionOptions={actionDefinitions} onChange={handleChangeNode} />
          <WorkflowValidationPanel validationResult={validationResult} saving={saving} />

          <section className="panel-card workflow-status-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow eyebrow-small">Status</p>
                <h2>処理メッセージ</h2>
              </div>
            </div>
            <div className="status-card" aria-live="polite">
              <p>{statusMessage || '保存や検証の結果がここに表示されます。'}</p>
            </div>
          </section>
        </div>
      </section>
    </WorkflowEditorShell>
  );
}