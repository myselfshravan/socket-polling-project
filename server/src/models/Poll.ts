import mongoose, { Schema, Document } from 'mongoose';
import { Poll as IPoll } from '../types/poll';

// Omit the id field from IPoll since mongoose will provide _id
export interface IPollDocument extends Omit<IPoll, 'id'>, Document {}

const pollSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  createdBy: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  results: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
  }
});

export default mongoose.model<IPollDocument>('Poll', pollSchema);