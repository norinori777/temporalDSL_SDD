export type WorkflowNodeType = 'start' | 'action' | 'end';

export interface WorkflowNodeInput {
  nodeKey: string;
  nodeType: WorkflowNodeType;
  label: string;
  actionDefinitionId?: number | null;
  positionX?: number;
  positionY?: number;
}

export interface WorkflowEdgeInput {
  fromNodeKey: string;
  toNodeKey: string;
  label?: string;
}

export interface WorkflowDefinitionInput {
  workflowDefinitionId?: number;
  name: string;
  description?: string;
  nodes: WorkflowNodeInput[];
  edges: WorkflowEdgeInput[];
}

export interface WorkflowDefinitionValidationIssue {
  code: string;
  message: string;
  targetType?: 'workflow' | 'node' | 'edge' | 'action';
  targetId?: string;
}

export interface WorkflowDefinitionValidationResult {
  valid: boolean;
  issues: WorkflowDefinitionValidationIssue[];
}

export interface WorkflowActionDefinition {
  id: number;
  actionCode: string;
  version: string;
  displayName: string;
  selectable: boolean;
}

const WORKFLOW_NAME_REQUIRED = 'WORKFLOW_NAME_REQUIRED';
const WORKFLOW_NAME_DUPLICATE = 'WORKFLOW_NAME_DUPLICATE';
const NODE_KEY_REQUIRED = 'NODE_KEY_REQUIRED';
const NODE_KEY_DUPLICATE = 'NODE_KEY_DUPLICATE';
const NODE_LABEL_REQUIRED = 'NODE_LABEL_REQUIRED';
const NODE_TYPE_INVALID = 'NODE_TYPE_INVALID';
const START_NODE_COUNT = 'START_NODE_COUNT';
const END_NODE_COUNT = 'END_NODE_COUNT';
const ACTION_REQUIRED = 'ACTION_REQUIRED';
const ACTION_NOT_FOUND = 'ACTION_NOT_FOUND';
const ACTION_NOT_SELECTABLE = 'ACTION_NOT_SELECTABLE';
const EDGE_NODE_UNKNOWN = 'EDGE_NODE_UNKNOWN';
const CYCLE_DETECTED = 'CYCLE_DETECTED';
const DISCONNECTED_NODE = 'DISCONNECTED_NODE';
const START_HAS_INCOMING = 'START_HAS_INCOMING';
const END_HAS_OUTGOING = 'END_HAS_OUTGOING';

export function validateWorkflowDefinitionInput(
  input: WorkflowDefinitionInput,
  availableActions: WorkflowActionDefinition[] = [],
  existingNames: Array<{ id: number; name: string }> = [],
): WorkflowDefinitionValidationResult {
  const issues: WorkflowDefinitionValidationIssue[] = [];
  const normalizedName = input.name?.trim() ?? '';

  if (!normalizedName) {
    issues.push({
      code: WORKFLOW_NAME_REQUIRED,
      message: 'ワークフロー名を入力してください。',
      targetType: 'workflow',
    });
  }

  const nameConflict = existingNames.find(
    (candidate) => candidate.name === normalizedName && candidate.id !== input.workflowDefinitionId,
  );
  if (normalizedName && nameConflict) {
    issues.push({
      code: WORKFLOW_NAME_DUPLICATE,
      message: `ワークフロー名 '${normalizedName}' は既に存在します。`,
      targetType: 'workflow',
    });
  }

  const nodes = input.nodes ?? [];
  const edges = input.edges ?? [];
  const nodeMap = new Map<string, WorkflowNodeInput>();

  for (const node of nodes) {
    const normalizedNodeKey = node.nodeKey?.trim() ?? '';
    if (!normalizedNodeKey) {
      issues.push({
        code: NODE_KEY_REQUIRED,
        message: 'nodeKey を入力してください。',
        targetType: 'node',
      });
      continue;
    }

    if (nodeMap.has(normalizedNodeKey)) {
      issues.push({
        code: NODE_KEY_DUPLICATE,
        message: `nodeKey '${normalizedNodeKey}' が重複しています。`,
        targetType: 'node',
        targetId: normalizedNodeKey,
      });
      continue;
    }

    nodeMap.set(normalizedNodeKey, { ...node, nodeKey: normalizedNodeKey });

    if (!node.label?.trim()) {
      issues.push({
        code: NODE_LABEL_REQUIRED,
        message: `ノード '${normalizedNodeKey}' の表示ラベルを入力してください。`,
        targetType: 'node',
        targetId: normalizedNodeKey,
      });
    }

    if (node.nodeType !== 'start' && node.nodeType !== 'action' && node.nodeType !== 'end') {
      issues.push({
        code: NODE_TYPE_INVALID,
        message: `ノード '${normalizedNodeKey}' の種類が不正です。`,
        targetType: 'node',
        targetId: normalizedNodeKey,
      });
    }

    if (node.nodeType === 'action') {
      validateActionNode(node, availableActions, issues);
    } else if (node.actionDefinitionId !== undefined && node.actionDefinitionId !== null) {
      issues.push({
        code: ACTION_REQUIRED,
        message: `開始/終了ノード '${normalizedNodeKey}' に Action 参照は指定できません。`,
        targetType: 'node',
        targetId: normalizedNodeKey,
      });
    }
  }

  const startNodes = nodes.filter((node) => node.nodeType === 'start');
  const endNodes = nodes.filter((node) => node.nodeType === 'end');

  if (startNodes.length !== 1) {
    issues.push({
      code: START_NODE_COUNT,
      message: `開始ノードは 1 つ必要ですが、${startNodes.length} 個あります。`,
      targetType: 'workflow',
    });
  }

  if (endNodes.length !== 1) {
    issues.push({
      code: END_NODE_COUNT,
      message: `終了ノードは 1 つ必要ですが、${endNodes.length} 個あります。`,
      targetType: 'workflow',
    });
  }

  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();
  for (const nodeKey of nodeMap.keys()) {
    adjacency.set(nodeKey, []);
    reverseAdjacency.set(nodeKey, []);
  }

  edges.forEach((edge, index) => {
    const fromNodeKey = edge.fromNodeKey?.trim() ?? '';
    const toNodeKey = edge.toNodeKey?.trim() ?? '';

    if (!nodeMap.has(fromNodeKey) || !nodeMap.has(toNodeKey)) {
      issues.push({
        code: EDGE_NODE_UNKNOWN,
        message: `接続 '${fromNodeKey}' -> '${toNodeKey}' は存在しないノードを参照しています。`,
        targetType: 'edge',
        targetId: String(index),
      });
      return;
    }

    adjacency.get(fromNodeKey)?.push(toNodeKey);
    reverseAdjacency.get(toNodeKey)?.push(fromNodeKey);
  });

  if (startNodes[0]) {
    const startKey = startNodes[0].nodeKey?.trim() ?? '';
    const endKey = endNodes[0]?.nodeKey?.trim() ?? '';

    if (reverseAdjacency.get(startKey)?.length) {
      issues.push({
        code: START_HAS_INCOMING,
        message: '開始ノードには入力接続を作成できません。',
        targetType: 'node',
        targetId: startKey,
      });
    }

    if (adjacency.get(endKey)?.length) {
      issues.push({
        code: END_HAS_OUTGOING,
        message: '終了ノードからは出力接続を作成できません。',
        targetType: 'node',
        targetId: endKey,
      });
    }

    validateGraphReachability(nodeMap, adjacency, reverseAdjacency, startKey, endKey, issues);
    validateCycles(nodeMap, adjacency, issues);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function validateActionNode(
  node: WorkflowNodeInput,
  availableActions: WorkflowActionDefinition[],
  issues: WorkflowDefinitionValidationIssue[],
): void {
  const normalizedNodeKey = node.nodeKey?.trim() ?? '';

  if (typeof node.actionDefinitionId !== 'number') {
    issues.push({
      code: ACTION_REQUIRED,
      message: `アクションノード '${normalizedNodeKey}' に Action 参照が必要です。`,
      targetType: 'node',
      targetId: normalizedNodeKey,
    });
    return;
  }

  const matchedAction = availableActions.find((action) => action.id === node.actionDefinitionId);
  if (!matchedAction) {
    issues.push({
      code: ACTION_NOT_FOUND,
      message: `ノード '${normalizedNodeKey}' の Action 参照が見つかりません。`,
      targetType: 'action',
      targetId: String(node.actionDefinitionId),
    });
    return;
  }

  if (!matchedAction.selectable) {
    issues.push({
      code: ACTION_NOT_SELECTABLE,
      message: `ノード '${normalizedNodeKey}' が参照する Action は選択可能ではありません。`,
      targetType: 'action',
      targetId: String(matchedAction.id),
    });
  }
}

function validateGraphReachability(
  nodeMap: Map<string, WorkflowNodeInput>,
  adjacency: Map<string, string[]>,
  reverseAdjacency: Map<string, string[]>,
  startNodeKey: string,
  endNodeKey: string,
  issues: WorkflowDefinitionValidationIssue[],
): void {
  const reachableFromStart = new Set<string>();
  const stack = [startNodeKey];

  while (stack.length) {
    const current = stack.pop();
    if (!current || reachableFromStart.has(current)) {
      continue;
    }

    reachableFromStart.add(current);
    for (const next of adjacency.get(current) ?? []) {
      stack.push(next);
    }
  }

  const reachableToEnd = new Set<string>();
  const reverseStack = [endNodeKey];

  while (reverseStack.length) {
    const current = reverseStack.pop();
    if (!current || reachableToEnd.has(current)) {
      continue;
    }

    reachableToEnd.add(current);
    for (const previous of reverseAdjacency.get(current) ?? []) {
      reverseStack.push(previous);
    }
  }

  for (const node of nodeMap.values()) {
    if (!reachableFromStart.has(node.nodeKey)) {
      issues.push({
        code: DISCONNECTED_NODE,
        message: `ノード '${node.nodeKey}' は開始ノードから到達できません。`,
        targetType: 'node',
        targetId: node.nodeKey,
      });
    }

    if (!reachableToEnd.has(node.nodeKey)) {
      issues.push({
        code: DISCONNECTED_NODE,
        message: `ノード '${node.nodeKey}' から終了ノードへ到達できません。`,
        targetType: 'node',
        targetId: node.nodeKey,
      });
    }
  }
}

function validateCycles(
  nodeMap: Map<string, WorkflowNodeInput>,
  adjacency: Map<string, string[]>,
  issues: WorkflowDefinitionValidationIssue[],
): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeKey: string): boolean {
    if (visiting.has(nodeKey)) {
      issues.push({
        code: CYCLE_DETECTED,
        message: `ノード '${nodeKey}' を含む循環が検出されました。`,
        targetType: 'node',
        targetId: nodeKey,
      });
      return true;
    }

    if (visited.has(nodeKey)) {
      return false;
    }

    visiting.add(nodeKey);

    for (const next of adjacency.get(nodeKey) ?? []) {
      if (dfs(next)) {
        return true;
      }
    }

    visiting.delete(nodeKey);
    visited.add(nodeKey);
    return false;
  }

  for (const nodeKey of nodeMap.keys()) {
    if (visited.has(nodeKey)) {
      continue;
    }

    if (dfs(nodeKey)) {
      return;
    }
  }
}