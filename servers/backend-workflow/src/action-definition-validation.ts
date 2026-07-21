import { parse } from 'yaml';

export interface ActionDefinitionInput {
  actionCode: string;
  version: string;
  displayName: string;
  requestDeclarationYaml: string;
  selectable: boolean;
}

export interface ActionDefinitionRecord extends ActionDefinitionInput {
  id: number;
  createdAt: Date;
  updatedAt: Date;
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

export function validateActionDefinitionInput(
  input: ActionDefinitionInput,
  existingDefinitions: Pick<ActionDefinitionRecord, 'id' | 'actionCode' | 'version'>[] = [],
): ActionDefinitionValidationResult {
  const issues: ActionDefinitionValidationIssue[] = [];

  validateRequiredText(input.actionCode, 'actionCode', 'Action 名', issues);
  validateRequiredText(input.version, 'version', 'version', issues);
  validateRequiredText(input.displayName, 'displayName', '表示名', issues);
  validateRequestDeclarationYaml(input.requestDeclarationYaml, issues);

  if (typeof input.selectable !== 'boolean') {
    issues.push({
      code: 'SELECTABLE_INVALID',
      message: 'selectable は true または false である必要があります。',
      field: 'selectable',
    });
  }

  const normalizedActionCode = input.actionCode?.trim();
  const normalizedVersion = input.version?.trim();

  if (
    normalizedActionCode &&
    normalizedVersion &&
    existingDefinitions.some(
      (definition) =>
        definition.actionCode === normalizedActionCode && definition.version === normalizedVersion,
    )
  ) {
    issues.push({
      code: 'ACTION_DEFINITION_DUPLICATE',
      message: `Action 名 '${normalizedActionCode}' と version '${normalizedVersion}' の組み合わせは既に存在します。`,
      field: 'version',
    });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function validateRequiredText(
  value: string,
  field: keyof ActionDefinitionInput,
  label: string,
  issues: ActionDefinitionValidationIssue[],
): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push({
      code: 'TEXT_REQUIRED',
      message: `${label} を入力してください。`,
      field,
    });
  }
}

function validateRequestDeclarationYaml(
  requestDeclarationYaml: string,
  issues: ActionDefinitionValidationIssue[],
): void {
  if (typeof requestDeclarationYaml !== 'string' || requestDeclarationYaml.trim().length === 0) {
    issues.push({
      code: 'REQUEST_DECLARATION_REQUIRED',
      message: 'requestDeclarationYaml を入力してください。',
      field: 'requestDeclarationYaml',
    });
    return;
  }

  let parsedDocument: unknown;

  try {
    parsedDocument = parse(requestDeclarationYaml) as unknown;
  } catch (error) {
    issues.push({
      code: 'REQUEST_DECLARATION_INVALID_YAML',
      message: `requestDeclarationYaml の YAML を解析できません: ${(error as Error).message}`,
      field: 'requestDeclarationYaml',
    });
    return;
  }

  if (typeof parsedDocument !== 'object' || parsedDocument === null || Array.isArray(parsedDocument)) {
    issues.push({
      code: 'REQUEST_DECLARATION_OBJECT_REQUIRED',
      message: 'requestDeclarationYaml はオブジェクト形式である必要があります。',
      field: 'requestDeclarationYaml',
    });
    return;
  }

  const declaration = parsedDocument as Record<string, unknown>;
  const requiredKeys = parseStringArray(declaration.requiredKeys, 'requiredKeys', issues);
  const optionalKeys = parseStringArray(declaration.optionalKeys, 'optionalKeys', issues);
  const allowedKeys = parseStringArray(declaration.allowedKeys, 'allowedKeys', issues);

  if (!requiredKeys || !optionalKeys || !allowedKeys) {
    return;
  }

  for (const requiredKey of requiredKeys) {
    if (optionalKeys.includes(requiredKey)) {
      issues.push({
        code: 'REQUEST_DECLARATION_KEY_CONFLICT',
        message: `requiredKeys と optionalKeys に同じキー '${requiredKey}' は指定できません。`,
        field: 'requestDeclarationYaml',
      });
    }
  }

  for (const requiredKey of requiredKeys) {
    if (!allowedKeys.includes(requiredKey)) {
      issues.push({
        code: 'REQUEST_DECLARATION_REQUIRED_NOT_ALLOWED',
        message: `requiredKeys のキー '${requiredKey}' が allowedKeys に含まれていません。`,
        field: 'requestDeclarationYaml',
      });
    }
  }

  for (const optionalKey of optionalKeys) {
    if (!allowedKeys.includes(optionalKey)) {
      issues.push({
        code: 'REQUEST_DECLARATION_OPTIONAL_NOT_ALLOWED',
        message: `optionalKeys のキー '${optionalKey}' が allowedKeys に含まれていません。`,
        field: 'requestDeclarationYaml',
      });
    }
  }
}

function parseStringArray(
  value: unknown,
  fieldName: string,
  issues: ActionDefinitionValidationIssue[],
): string[] | undefined {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    issues.push({
      code: 'REQUEST_DECLARATION_INVALID_KEYS',
      message: `${fieldName} は文字列配列である必要があります。`,
      field: 'requestDeclarationYaml',
    });
    return undefined;
  }

  return value.map((item) => item.trim()).filter((item) => item.length > 0);
}