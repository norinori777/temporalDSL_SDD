import {
  ActionDefinitionInput,
  ActionDefinitionRecord,
  ActionDefinitionValidationIssue,
  ActionDefinitionValidationResult,
} from '../types/actionDefinition';

const API_BASE_URL = import.meta.env.VITE_ACTION_DEFINITION_API_URL ?? '/api';

export class ActionDefinitionApiError extends Error {
  issues: ActionDefinitionValidationIssue[];

  constructor(message: string, issues: ActionDefinitionValidationIssue[] = []) {
    super(message);
    this.name = 'ActionDefinitionApiError';
    this.issues = issues;
  }
}

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
        ? String((payload as { message?: unknown }).message ?? 'Action 定義 API エラー')
        : 'Action 定義 API エラー';
    const issues =
      typeof payload === 'object' && payload !== null && 'issues' in payload
        ? ((payload as { issues?: ActionDefinitionValidationIssue[] }).issues ?? [])
        : [];

    throw new ActionDefinitionApiError(message, issues);
  }

  return payload as T;
}

export async function listActionDefinitions(): Promise<ActionDefinitionRecord[]> {
  return requestJson<ActionDefinitionRecord[]>('/action-definitions');
}

export async function createActionDefinition(
  input: ActionDefinitionInput,
): Promise<ActionDefinitionRecord> {
  return requestJson<ActionDefinitionRecord>('/action-definitions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateActionDefinitionSelectable(
  id: number,
  selectable: boolean,
): Promise<ActionDefinitionRecord> {
  return requestJson<ActionDefinitionRecord>(`/action-definitions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ selectable }),
  });
}

export async function validateActionDefinition(
  input: ActionDefinitionInput,
): Promise<ActionDefinitionValidationResult> {
  return requestJson<ActionDefinitionValidationResult>('/action-definitions/validate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}