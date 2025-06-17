import mongoose, { Schema, Document, Model } from 'mongoose';
import { PollState } from '../types/poll';

export interface IPollDocument extends Document {
  question: string;
  options: string[];
  state: PollState;
  createdBy: string;
  results: Map<string, number>;
  votedUsers: string[];
  createdAt: Date;
  activatedAt?: Date;
  endedAt?: Date;
  isExpired(): boolean;
  addVote(userId: string, option: string): Promise<IPollDocument>;
}

interface IPollModel extends Model<IPollDocument> {
  activatePoll(pollId: string): Promise<IPollDocument | null>;
  endPoll(pollId: string): Promise<IPollDocument | null>;
}

const pollSchema = new Schema<IPollDocument>({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  state: {
    type: String,
    enum: Object.values(PollState),
    default: PollState.DRAFT,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  results: {
    type: Map,
    of: Number,
    default: () => new Map(),
  },
  votedUsers: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  activatedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  }
}, {
  // Enable timestamps
  timestamps: true,
  // Enable toJSON transform
  toJSON: { virtuals: true },
  // Enable toObject transform
  toObject: { virtuals: true }
});

// Initialize results for all options when creating a new poll
pollSchema.pre('save', function(next) {
  if (this.isNew) {
    const results = new Map<string, number>();
    this.options.forEach(option => {
      results.set(option, 0);
    });
    this.results = results;
  }
  next();
});

// Method to check if poll is expired
pollSchema.methods.isExpired = function(): boolean {
  return this.state === PollState.ENDED || (
    this.endedAt ? new Date() > this.endedAt : false
  );
};

// Method to add a vote
pollSchema.methods.addVote = async function(userId: string, option: string): Promise<IPollDocument> {
  if (this.state !== PollState.LIVE) {
    throw new Error('Poll is not active');
  }

  if (this.isExpired()) {
    this.state = PollState.ENDED;
    await this.save();
    throw new Error('Poll has expired');
  }

  if (this.votedUsers.includes(userId)) {
    throw new Error('User has already voted');
  }

  if (!this.options.includes(option)) {
    throw new Error('Invalid option');
  }

  const results = this.results || new Map<string, number>();
  results.set(option, (results.get(option) || 0) + 1);
  this.results = results;
  this.votedUsers.push(userId);

  return this.save();
};

// Static method to activate poll
pollSchema.statics.activatePoll = async function(pollId: string): Promise<IPollDocument | null> {
  // End any currently active polls
  await this.updateMany(
    { state: PollState.LIVE },
    { 
      state: PollState.ENDED,
      endedAt: new Date()
    }
  );

  // Activate the requested poll
  return this.findByIdAndUpdate(
    pollId,
    {
      state: PollState.LIVE,
      activatedAt: new Date(),
      endedAt: undefined
    },
    { new: true }
  );
};

// Static method to end poll
pollSchema.statics.endPoll = async function(pollId: string): Promise<IPollDocument | null> {
  return this.findByIdAndUpdate(
    pollId,
    {
      state: PollState.ENDED,
      endedAt: new Date()
    },
    { new: true }
  );
};

// Create indexes
pollSchema.index({ state: 1 });
pollSchema.index({ createdAt: -1 });

export default mongoose.model<IPollDocument, IPollModel>('Poll', pollSchema);