export type WorkflowNodeType = 'start' | 'action' | 'end';

export interface WorkflowNodeInput {
  nodeKey: string;
  nodeType: WorkflowNodeType;
  label: string;
  actionDefinitionId?: number | null;
  positionX: number;
  positionY: number;
}

export interface WorkflowEdgeInput {
  fromNodeKey: string;
  toNodeKey: string;
  label?: string;
}

export interface WorkflowDefinitionInput {
  workflowDefinitionId?: number;
  name: string;
  description: string;
  nodes: WorkflowNodeInput[];
  edges: WorkflowEdgeInput[];
}

export interface WorkflowDefinitionSummaryRecord {
  workflowDefinitionId: number;
  name: string;
  description: string;
  currentVersion: number;
  updatedAt: string;
}

export interface WorkflowNodeRecord extends WorkflowNodeInput {
  id: number;
}

export interface WorkflowEdgeRecord extends WorkflowEdgeInput {
  id: number;
  label: string;
}

export interface WorkflowVersionRecord {
  workflowDefinitionId: number;
  workflowVersionId: number;
  version: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNodeRecord[];
  edges: WorkflowEdgeRecord[];
}

export interface WorkflowValidationIssue {
  code: string;
  message: string;
  targetType?: 'workflow' | 'node' | 'edge' | 'action';
  targetId?: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  issues: WorkflowValidationIssue[];
}