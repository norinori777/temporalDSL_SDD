export interface ActionDefinitionInput {
  actionCode: string;
  version: string;
  displayName: string;
  requestDeclarationYaml: string;
  selectable: boolean;
}

export interface ActionDefinitionRecord extends ActionDefinitionInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActionDefinitionValidationIssue {
  code: string;
  message: string;
  field?: keyof ActionDefinitionInput | 'id';
}

export interface ActionDefinitionValidationResult {
  valid: boolean;
  issues: ActionDefinitionValidationIssue[];
}