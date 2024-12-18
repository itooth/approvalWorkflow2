# BeeFlow API Reference

## API Overview

- Base URL: `/api/v1`
- All endpoints require authentication unless specified
- All responses follow standard format
- All dates are in ISO 8601 format
- All IDs are MongoDB ObjectIds

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "string",
    "refreshToken": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "name": "string"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

## Workflow Management

### Create Workflow
```http
POST /workflows
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "nodes": [
    {
      "id": "string",
      "type": "APPROVAL" | "COPY" | "TASK" | "CONDITION",
      "config": {
        "assigneeType": "USER" | "ROLE" | "DEPARTMENT",
        "assigneeId": "string",
        "multipleApproval": boolean,
        "approvalType": "ANY" | "ALL" | "SEQUENCE"
      }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "condition": {
        "field": "string",
        "operator": "string",
        "value": "any"
      }
    }
  ]
}

Response 201:
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "nodes": [...],
    "edges": [...],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Start Workflow Instance
```http
POST /workflows/:id/start
Content-Type: application/json

{
  "formData": {
    "title": "string",
    "field1": "any",
    "field2": "any"
  },
  "options": {
    "priority": number,
    "dueDate": "string",
    "variables": {
      "key": "value"
    }
  }
}

Response 201:
{
  "success": true,
  "data": {
    "id": "string",
    "workflowId": "string",
    "status": "RUNNING",
    "currentNodeId": "string",
    "formData": {...},
    "variables": {...},
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## Task Management

### Get User Tasks
```http
GET /tasks/user/:userId
Query Parameters:
- status: "PENDING" | "APPROVED" | "REJECTED"
- page: number
- limit: number

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "workflowInstanceId": "string",
      "nodeId": "string",
      "status": "PENDING",
      "assignees": [
        {
          "userId": "string",
          "type": "USER",
          "status": "PENDING"
        }
      ],
      "title": "string",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  }
}
```

### Approve Task
```http
POST /tasks/:id/approve
Content-Type: application/json

{
  "comment": "string"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "string",
    "status": "APPROVED",
    "handledBy": "string",
    "handledAt": "string",
    "comment": "string"
  }
}
```

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}
```

### Workflow
```typescript
{
  id: string;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: string;
    config: any;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    condition?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### WorkflowInstance
```typescript
{
  id: string;
  workflowId: string;
  status: "RUNNING" | "COMPLETED" | "REJECTED" | "CANCELED";
  currentNodeId: string;
  formData: any;
  variables: { [key: string]: any };
  initiatorId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Task
```typescript
{
  id: string;
  workflowInstanceId: string;
  nodeId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  assignees: Array<{
    userId: string;
    type: "USER" | "ROLE" | "DEPARTMENT";
    status: string;
    comment?: string;
    handledAt?: string;
  }>;
  title: string;
  description?: string;
  priority: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input parameters |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error |

## Rate Limiting

- Rate limit: 100 requests per minute
- Rate limit header: `X-RateLimit-Limit`
- Remaining requests: `X-RateLimit-Remaining`
- Reset time: `X-RateLimit-Reset` 