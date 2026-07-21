import { ActionDefinitionInput, ActionDefinitionValidationIssue } from '../types/actionDefinition';

interface ActionDefinitionFormProps {
  value: ActionDefinitionInput;
  validationIssues: ActionDefinitionValidationIssue[];
  saving: boolean;
  onChange: (nextValue: ActionDefinitionInput) => void;
  onSubmit: () => void | Promise<void>;
  onReset: () => void;
}

const fieldLabels: Record<keyof ActionDefinitionInput, string> = {
  actionCode: 'Action 名',
  version: 'version',
  displayName: '表示名',
  requestDeclarationYaml: 'YAML 宣言',
  selectable: 'selectable',
};

export function ActionDefinitionForm({
  value,
  validationIssues,
  saving,
  onChange,
  onSubmit,
  onReset,
}: ActionDefinitionFormProps) {
  const issueMap = validationIssues.reduce<Partial<Record<keyof ActionDefinitionInput, string[]>>>((accumulator, issue) => {
    if (!issue.field || !(issue.field in fieldLabels)) {
      return accumulator;
    }

    const field = issue.field as keyof ActionDefinitionInput;
    accumulator[field] = [...(accumulator[field] ?? []), issue.message];
    return accumulator;
  }, {});

  function updateField<K extends keyof ActionDefinitionInput>(field: K, nextValue: ActionDefinitionInput[K]) {
    onChange({ ...value, [field]: nextValue });
  }

  return (
    <form
      className="action-form"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit();
      }}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow eyebrow-small">Register</p>
          <h2>Action 定義を登録</h2>
        </div>

        <button className="text-button" type="button" onClick={onReset} disabled={saving}>
          クリア
        </button>
      </div>

      <div className="form-grid">
        <label>
          <span>{fieldLabels.actionCode}</span>
          <input
            value={value.actionCode}
            onChange={(event) => updateField('actionCode', event.target.value)}
            placeholder="microservice1.reserveSlot"
          />
          {issueMap.actionCode?.map((message) => (
            <em key={message}>{message}</em>
          ))}
        </label>

        <label>
          <span>{fieldLabels.version}</span>
          <input
            value={value.version}
            onChange={(event) => updateField('version', event.target.value)}
            placeholder="1.0.0"
          />
          {issueMap.version?.map((message) => (
            <em key={message}>{message}</em>
          ))}
        </label>

        <label>
          <span>{fieldLabels.displayName}</span>
          <input
            value={value.displayName}
            onChange={(event) => updateField('displayName', event.target.value)}
            placeholder="予約枠を確保する"
          />
          {issueMap.displayName?.map((message) => (
            <em key={message}>{message}</em>
          ))}
        </label>

        <label className="selectable-field">
          <input
            type="checkbox"
            checked={value.selectable}
            onChange={(event) => updateField('selectable', event.target.checked)}
          />
          <span>{fieldLabels.selectable}</span>
        </label>

        <label className="textarea-field">
          <span>{fieldLabels.requestDeclarationYaml}</span>
          <textarea
            value={value.requestDeclarationYaml}
            onChange={(event) => updateField('requestDeclarationYaml', event.target.value)}
            rows={12}
            spellCheck={false}
          />
          {issueMap.requestDeclarationYaml?.map((message) => (
            <em key={message}>{message}</em>
          ))}
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? '保存中...' : '保存する'}
        </button>

        <p className="helper-copy">
          保存時のみ検証され、問題がある version は保存されません。 version を変えると新しい履歴として追加されます。
        </p>
      </div>
    </form>
  );
}