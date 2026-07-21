import { ActionDefinitionRecord } from '../types/actionDefinition';
import {
  WorkflowDefinitionInput,
  WorkflowDefinitionSummaryRecord,
  WorkflowValidationResult,
  WorkflowVersionRecord,
} from '../types/workflowDefinition';

const API_BASE_URL = import.meta.env.VITE_WORKFLOW_API_URL ?? '/api';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text.length > 0 ? (JSON.parse(text) as unknown) : undefined;

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message?: unknown }).message ?? 'Workflow API エラー')
        : 'Workflow API エラー';
    const issues =
      typeof payload === 'object' && payload !== null && 'issues' in payload
        ? ((payload as { issues?: WorkflowValidationResult['issues'] }).issues ?? [])
        : [];

    const error = new Error(message) as Error & { issues: WorkflowValidationResult['issues'] };
    error.issues = issues;
    throw error;
  }

  return payload as T;
}

export async function listWorkflowDefinitions(): Promise<WorkflowDefinitionSummaryRecord[]> {
  return requestJson<WorkflowDefinitionSummaryRecord[]>('/workflow-definitions');
}

export async function listWorkflowVersions(
  workflowDefinitionId: number,
): Promise<WorkflowVersionRecord[]> {
  return requestJson<WorkflowVersionRecord[]>(`/workflow-definitions/${workflowDefinitionId}/versions`);
}

export async function getWorkflowVersion(
  workflowDefinitionId: number,
  version: number,
): Promise<WorkflowVersionRecord> {
  return requestJson<WorkflowVersionRecord>(
    `/workflow-definitions/${workflowDefinitionId}/versions/${version}`,
  );
}

export async function validateWorkflowDefinition(
  input: WorkflowDefinitionInput,
): Promise<WorkflowValidationResult> {
  return requestJson<WorkflowValidationResult>('/workflow-definitions/validate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createWorkflowDefinition(
  input: WorkflowDefinitionInput,
): Promise<WorkflowVersionRecord> {
  return requestJson<WorkflowVersionRecord>('/workflow-definitions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listSelectableActionDefinitions(): Promise<ActionDefinitionRecord[]> {
  return requestJson<ActionDefinitionRecord[]>('/action-definitions');
}