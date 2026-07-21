# Contract: Action Definition Management API

This contract describes the backend-facing interface required by the feature.

## Create or validate a definition

### `POST /action-definitions/validate`

Request body:

```json
{
  "actionCode": "string",
  "version": "string",
  "displayName": "string",
  "requestDeclarationYaml": "string",
  "selectable": true
}
```

Response:

```json
{
  "valid": true,
  "issues": []
}
```

## Persist a definition

### `POST /action-definitions`

Request body: same shape as validation.

Response:

```json
{
  "id": "string",
  "actionCode": "string",
  "version": "string",
  "displayName": "string",
  "selectable": true
}
```

Behavior:

- The server must validate the payload before persistence.
- Duplicate `actionCode + version` pairs must be rejected.
- A successful save creates an immutable version record.

## List definitions

### `GET /action-definitions`

Response:

```json
[
  {
    "id": "string",
    "actionCode": "string",
    "version": "string",
    "displayName": "string",
    "selectable": true
  }
]
```

## Update selectability

### `PATCH /action-definitions/{id}`

Request body:

```json
{
  "selectable": true
}
```

Response:

```json
{
  "id": "string",
  "selectable": true
}
```

Behavior:

- Updating selectability must not alter the immutable version payload.
- The workflow candidate list must only include versions where `selectable = true`.
