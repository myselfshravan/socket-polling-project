export enum PollState {
  DRAFT = 'draft',
  LIVE = 'live',
  ENDED = 'ended'
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  state: PollState;
  createdBy: string;
  results: { [key: string]: number };
  votedUsers: string[];
  createdAt: string;
  activatedAt?: string;
  endedAt?: string;
  duration?: number; // Duration in seconds
  endsAt?: Date; // Calculated end time
}

export interface CreatePollDto {
  question: string;
  options: string[];
  createdBy?: string;
}

export interface VoteDto {
  pollId: string;
  option: string;
  voterId?: string;
}

export interface PollResults {
  pollId: string;
  results: { [key: string]: number };
}

export interface ServerEvents {
  'create-poll': CreatePollDto;
  'activate-poll': string;
  'end-poll': string;
  'submit-vote': VoteDto;
}

export interface SocketEvents {
  'poll-created': (poll: Poll) => void;
  'poll-activated': (poll: Poll) => void;
  'poll-ended': (poll: Poll) => void;
  'poll-updated': (data: { pollId: string; results: Record<string, number> }) => void;
  'error': (error: { message: string }) => void;
}
