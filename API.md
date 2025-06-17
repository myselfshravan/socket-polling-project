# API Documentation

## REST Endpoints

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "name": string,
  "role": "teacher" | "student"
}

Response: {
  "user": {
    "id": string,
    "name": string,
    "role": string
  },
  "token": string,
  "refreshToken": string
}
```

### Poll Management

#### Create Poll
```http
POST /api/polls
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": string,
  "options": string[],
  "state": "draft" | "live"
}

Response: {
  "id": string,
  "question": string,
  "options": string[],
  "state": string,
  "createdAt": string
}
```

#### Get Polls
```http
GET /api/polls
Authorization: Bearer <token>

Response: {
  "polls": [
    {
      "id": string,
      "question": string,
      "options": string[],
      "state": string,
      "results": Object,
      "createdAt": string
    }
  ]
}
```

#### Activate Poll
```http
PATCH /api/polls/:id/activate
Authorization: Bearer <token>

Response: {
  "id": string,
  "state": "live",
  "activatedAt": string
}
```

#### End Poll
```http
PATCH /api/polls/:id/end
Authorization: Bearer <token>

Response: {
  "id": string,
  "state": "ended",
  "endedAt": string
}
```

## WebSocket Events

### Server -> Client Events

#### Poll Activated
```typescript
socket.on('poll-activated', (data: {
  id: string;
  question: string;
  options: string[];
  activatedAt: string;
}) => void);
```

#### Poll Ended
```typescript
socket.on('poll-ended', (data: {
  id: string;
  endedAt: string;
  finalResults: {
    [option: string]: number;
  }
}) => void);
```

#### Response Recorded
```typescript
socket.on('response-recorded', (data: {
  pollId: string;
  userId: string;
  option: string;
  timestamp: string;
}) => void);
```

#### Error Events
```typescript
socket.on('state-error', (data: {
  code: string;
  message: string;
}) => void);
```

### Client -> Server Events

#### Join Poll Room
```typescript
socket.emit('join-poll', {
  pollId: string;
  userId: string;
});
```

#### Submit Response
```typescript
socket.emit('submit-response', {
  pollId: string;
  userId: string;
  option: string;
});
```

## Error Codes

```typescript
enum ErrorCodes {
  UNAUTHORIZED = 'unauthorized',
  INVALID_STATE = 'invalid_state',
  ALREADY_VOTED = 'already_voted',
  POLL_ENDED = 'poll_ended',
  POLL_NOT_ACTIVE = 'poll_not_active',
  INVALID_OPTION = 'invalid_option'
}
```

## Response Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., already voted)
- 500: Internal Server Error

## Rate Limiting

```typescript
// API Rate Limits
{
  "general": "100 requests per minute",
  "auth": "10 requests per minute",
  "poll-creation": "30 requests per minute",
  "responses": "60 requests per minute"
}
```

## WebSocket Connection

```typescript
// Connection URL
const socket = io('ws://server-url', {
  auth: {
    token: 'jwt-token'
  },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

## Data Validation Rules

### Poll Creation
```typescript
{
  "question": {
    "minLength": 10,
    "maxLength": 500
  },
  "options": {
    "minItems": 2,
    "maxItems": 10,
    "itemLength": {
      "min": 1,
      "max": 100
    }
  }
}
```

### Response Submission
```typescript
{
  "pollId": "must be valid UUID",
  "userId": "must be valid UUID",
  "option": "must be one of poll options"
}
```

## Session Management

### Token Format
```typescript
{
  "accessToken": {
    "expiry": "15 minutes",
    "type": "JWT"
  },
  "refreshToken": {
    "expiry": "7 days",
    "type": "JWT"
  }
}
```

### Token Refresh
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": string
}

Response: {
  "token": string,
  "refreshToken": string
}