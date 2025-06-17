export interface Poll {
  id: string;
  question: string;
  options: string[];
  createdBy: string;
  isActive: boolean;
  results: { [key: string]: number };
  createdAt: Date;
  expiresAt?: Date;
}

export interface Vote {
  pollId: string;
  option: string;
  voterId: string;
  timestamp: Date;
}

export interface CreatePollDto {
  question: string;
  options: string[];
  createdBy: string;
  expiresAt?: Date;
}