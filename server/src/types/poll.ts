export interface CreatePollDto {
  question: string;
  options: string[];
  createdBy: string;
}

export interface VoteDto {
  pollId: string;
  option: string;
  voterId: string;
}

export interface PollResults {
  pollId: string;
  results: { [key: string]: number };
}

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
  createdAt: Date;
  activatedAt?: Date;
  endedAt?: Date;
}