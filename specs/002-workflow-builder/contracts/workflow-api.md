# Contract: Workflow Builder API

This contract describes the workflow registration and validation surface required by the feature.

## Validate a workflow definition

### `POST /workflow-definitions/validate`

Request body:

```json
{
  "name": "string",
  "description": "string",
  "nodes": [
    {
      "id": "string",
      "actionDefinitionId": 123,
      "label": "string",
      "nodeType": "action",
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "string",
      "fromNodeId": "string",
      "toNodeId": "string"
    }
  ]
}
```

Response:

```json
{
  "valid": true,
  "issues": []
}
```

Behavior:

- The server validates graph shape, Action availability, and version-specific constraints.
- Invalid workflow graphs must be rejected before persistence.

## Save a workflow version

### `POST /workflow-definitions`

Request body: same shape as validation.

Response:

```json
{
  "workflowDefinitionId": "string",
  "workflowVersionId": "string",
  "version": "string",
  "valid": true,
  "issues": []
}
```

Behavior:

- A successful save creates a new immutable workflow version.
- Existing versions must not be overwritten.

## List workflows

### `GET /workflow-definitions`

Response:

```json
[
  {
    "workflowDefinitionId": "string",
    "name": "string",
    "currentVersion": "string",
    "updatedAt": "string"
  }
]
```

## Read a workflow version

### `GET /workflow-definitions/{workflowDefinitionId}/versions/{version}`

Response:

```json
{
  "workflowDefinitionId": "string",
  "workflowVersionId": "string",
  "name": "string",
  "version": "string",
  "nodes": [],
  "edges": []
}
```

Behavior:

- The editor must be able to reload a saved version for review or re-editing.