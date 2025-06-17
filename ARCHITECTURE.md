# Live Polling System Architecture

## System Overview
A real-time polling system that allows teachers to create and manage polls while students can participate in active polls.

## Core Requirements Changes

### Session Management
1. Implement robust session persistence:
   - Store user data in localStorage with encryption
   - Add session expiration and refresh tokens
   - Implement proper logout with session cleanup

### Question/Poll Management
1. Single Active Question Policy:
   - Add state field: `PollState` (DRAFT, LIVE, ENDED)
   - Enforce single active poll at database level
   - Auto-deactivate previous poll when new one goes live

2. Teacher Controls:
   - Draft/save questions without activating
   - Toggle question visibility
   - Instant poll termination
   - Real-time response monitoring

### Student Interface
1. Real-time Updates:
   - WebSocket subscription to active poll changes
   - Automatic new poll notifications
   - Response status tracking
   - Access control for inactive polls

### Data Model Updates

```typescript
enum PollState {
  DRAFT = 'draft',
  LIVE = 'live',
  ENDED = 'ended'
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  state: PollState;
  createdBy: string;
  results: { [key: string]: number };
  createdAt: Date;
  activatedAt?: Date;
  endedAt?: Date;
  votedUsers: string[];
}

interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  sessionToken: string;
  lastActive: Date;
}

interface Response {
  pollId: string;
  userId: string;
  answer: string;
  submittedAt: Date;
}
```

### Security Enhancements
1. Session Protection:
   - JWT with refresh tokens
   - Rate limiting on all endpoints
   - Role-based middleware
   - WebSocket connection validation

2. Data Validation:
   - Input sanitization
   - State transition validation
   - Response uniqueness enforcement

### WebSocket Events

```typescript
// Server -> Client Events
interface ServerEvents {
  'poll-activated': (poll: Poll) => void;
  'poll-ended': (pollId: string) => void;
  'response-recorded': (response: Response) => void;
  'state-error': (error: string) => void;
}

// Client -> Server Events
interface ClientEvents {
  'activate-poll': (pollId: string) => void;
  'end-poll': (pollId: string) => void;
  'submit-response': (response: Response) => void;
}
```

## Implementation Changes Required

### Backend Updates
1. Update Poll Model:
   - Add state management
   - Add activation/end time tracking
   - Add response tracking

2. Socket Handlers:
   - Add connection state management
   - Implement role-based event filtering
   - Add reconnection handling

3. API Routes:
   - Add poll state management endpoints
   - Implement stricter validation
   - Add session management routes

### Frontend Updates
1. Context Changes:
   - Add session management
   - Add poll state tracking
   - Add response tracking

2. Component Updates:
   - TeacherDashboard: Add draft management
   - StudentInterface: Add response status
   - Add session timeout handling

### Database Changes
1. Indexes:
   - Add index on poll state
   - Add compound index for user responses
   - Add session tracking

2. Constraints:
   - Enforce single active poll
   - Enforce unique responses
   - Add state transition validation

## Testing Requirements
1. State Management:
   - Verify single active poll enforcement
   - Test state transitions
   - Validate response uniqueness

2. Real-time Updates:
   - Test WebSocket reconnection
   - Verify broadcast consistency
   - Test concurrent access

3. Security:
   - Test session timeout
   - Verify role enforcement
   - Test rate limiting

## Deployment Considerations
1. Session Management:
   - Use secure cookie settings
   - Implement proper CORS
   - Add environment-specific configs

2. Monitoring:
   - Add WebSocket connection logging
   - Track state transitions
   - Monitor response times