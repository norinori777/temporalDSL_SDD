export type NodeKind = 'start' | 'end' | 'action' | 'parallel' | 'condition';

export interface WorkflowNode {
  id: string;
  kind: NodeKind;
  actionCode?: string;
  actionVersion?: string;
  expectedBranches?: number;
  label?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ActionSchemaVersion {
  actionCode: string;
  version: string;
  requestYaml: string;
}

export interface ValidationIssue {
  code: string;
  message: string;
  nodeId?: string;
  edgeIndex?: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

interface ValidationContext {
  workflow: WorkflowDefinition;
  availableActions: ActionSchemaVersion[];
}

const START_NODE_COUNT_ERROR = 'START_NODE_COUNT';
const END_NODE_COUNT_ERROR = 'END_NODE_COUNT';
const DUPLICATE_NODE_ID_ERROR = 'DUPLICATE_NODE_ID';
const UNKNOWN_NODE_ERROR = 'UNKNOWN_NODE';
const CYCLE_ERROR = 'CYCLE_DETECTED';
const DISCONNECTED_NODE_ERROR = 'DISCONNECTED_NODE';
const BRANCH_COUNT_ERROR = 'BRANCH_COUNT_MISMATCH';
const ACTION_SCHEMA_ERROR = 'ACTION_SCHEMA_NOT_FOUND';
const INVALID_EXPECTED_BRANCH_COUNT_ERROR = 'INVALID_EXPECTED_BRANCH_COUNT';

export function validateWorkflowDefinition(
  workflow: WorkflowDefinition,
  availableActions: ActionSchemaVersion[] = [],
): ValidationResult {
  const context: ValidationContext = { workflow, availableActions };
  const issues: ValidationIssue[] = [];

  const nodeMap = new Map<string, WorkflowNode>();
  for (const node of context.workflow.nodes) {
    if (nodeMap.has(node.id)) {
      issues.push({
        code: DUPLICATE_NODE_ID_ERROR,
        message: `ノード ID '${node.id}' が重複しています。`,
        nodeId: node.id,
      });
      continue;
    }
    nodeMap.set(node.id, node);
  }

  const startNodes = context.workflow.nodes.filter((node) => node.kind === 'start');
  const endNodes = context.workflow.nodes.filter((node) => node.kind === 'end');

  if (startNodes.length !== 1) {
    issues.push({
      code: START_NODE_COUNT_ERROR,
      message: `開始ノードは 1 つ必要ですが、${startNodes.length} 個あります。`,
    });
  }

  if (endNodes.length !== 1) {
    issues.push({
      code: END_NODE_COUNT_ERROR,
      message: `終了ノードは 1 つ必要ですが、${endNodes.length} 個あります。`,
    });
  }

  const adjacency = buildAdjacency(context.workflow.edges, nodeMap, issues);
  validateBranchCounts(context.workflow.nodes, adjacency, issues);
  validateActionSchemaVersions(context.workflow.nodes, context.availableActions, issues);
  validateCycles(context.workflow.nodes, adjacency, issues);
  validateDisconnectedNodes(context.workflow.nodes, adjacency, issues, startNodes[0]?.id);

  return {
    valid: issues.length === 0,
    issues,
  };
}

function buildAdjacency(
  edges: WorkflowEdge[],
  nodeMap: Map<string, WorkflowNode>,
  issues: ValidationIssue[],
): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  for (const nodeId of nodeMap.keys()) {
    adjacency.set(nodeId, []);
  }

  edges.forEach((edge, index) => {
    if (!nodeMap.has(edge.from)) {
      issues.push({
        code: UNKNOWN_NODE_ERROR,
        message: `接続元ノード '${edge.from}' が見つかりません。`,
        edgeIndex: index,
      });
      return;
    }

    if (!nodeMap.has(edge.to)) {
      issues.push({
        code: UNKNOWN_NODE_ERROR,
        message: `接続先ノード '${edge.to}' が見つかりません。`,
        edgeIndex: index,
      });
      return;
    }

    adjacency.get(edge.from)?.push(edge.to);
  });

  return adjacency;
}

function validateBranchCounts(
  nodes: WorkflowNode[],
  adjacency: Map<string, string[]>,
  issues: ValidationIssue[],
): void {
  for (const node of nodes) {
    if (node.kind !== 'parallel' && node.kind !== 'condition') {
      continue;
    }

    if (typeof node.expectedBranches !== 'number' || node.expectedBranches < 2) {
      issues.push({
        code: INVALID_EXPECTED_BRANCH_COUNT_ERROR,
        message: `ノード '${node.id}' の分岐数は 2 以上で指定してください。`,
        nodeId: node.id,
      });
      continue;
    }

    const actualBranches = adjacency.get(node.id)?.length ?? 0;
    if (actualBranches !== node.expectedBranches) {
      issues.push({
        code: BRANCH_COUNT_ERROR,
        message: `ノード '${node.id}' の分岐数が一致しません。期待値: ${node.expectedBranches}, 実際: ${actualBranches}。`,
        nodeId: node.id,
      });
    }
  }
}

function validateActionSchemaVersions(
  nodes: WorkflowNode[],
  availableActions: ActionSchemaVersion[],
  issues: ValidationIssue[],
): void {
  for (const node of nodes) {
    if (node.kind !== 'action') {
      continue;
    }

    if (!node.actionCode || !node.actionVersion) {
      issues.push({
        code: ACTION_SCHEMA_ERROR,
        message: `アクションノード '${node.id}' に actionCode と actionVersion が必要です。`,
        nodeId: node.id,
      });
      continue;
    }

    const matchedSchema = availableActions.find(
      (schema) => schema.actionCode === node.actionCode && schema.version === node.actionVersion,
    );

    if (!matchedSchema) {
      issues.push({
        code: ACTION_SCHEMA_ERROR,
        message: `アクション '${node.actionCode}' のバージョン '${node.actionVersion}' が登録されていません。`,
        nodeId: node.id,
      });
    }
  }
}

function validateCycles(
  nodes: WorkflowNode[],
  adjacency: Map<string, string[]>,
  issues: ValidationIssue[],
): void {
  // DFS の色分けで循環を検出する。
  const visitState = new Map<string, 'unvisited' | 'visiting' | 'done'>();

  for (const node of nodes) {
    visitState.set(node.id, 'unvisited');
  }

  for (const node of nodes) {
    if (visitState.get(node.id) !== 'unvisited') {
      continue;
    }

    if (detectCycleDepthFirst(node.id, adjacency, visitState)) {
      issues.push({
        code: CYCLE_ERROR,
        message: `ノード '${node.id}' を起点とした循環が検出されました。`,
        nodeId: node.id,
      });
      return;
    }
  }
}

function detectCycleDepthFirst(
  nodeId: string,
  adjacency: Map<string, string[]>,
  visitState: Map<string, 'unvisited' | 'visiting' | 'done'>,
): boolean {
  visitState.set(nodeId, 'visiting');

  for (const nextNodeId of adjacency.get(nodeId) ?? []) {
    const nextState = visitState.get(nextNodeId);
    if (nextState === 'visiting') {
      return true;
    }

    if (nextState === 'unvisited' && detectCycleDepthFirst(nextNodeId, adjacency, visitState)) {
      return true;
    }
  }

  visitState.set(nodeId, 'done');
  return false;
}

function validateDisconnectedNodes(
  nodes: WorkflowNode[],
  adjacency: Map<string, string[]>,
  issues: ValidationIssue[],
  startNodeId?: string,
): void {
  if (!startNodeId) {
    return;
  }

  const reachable = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || reachable.has(current)) {
      continue;
    }

    reachable.add(current);
    for (const nextNodeId of adjacency.get(current) ?? []) {
      queue.push(nextNodeId);
    }
  }

  // 開始ノードから到達できないノードを未接続ノードとして扱う。
  for (const node of nodes) {
    if (!reachable.has(node.id)) {
      issues.push({
        code: DISCONNECTED_NODE_ERROR,
        message: `ノード '${node.id}' は開始ノードから到達できません。`,
        nodeId: node.id,
      });
    }
  }
}