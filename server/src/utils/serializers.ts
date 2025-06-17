import { IPollDocument } from '../models/Poll';
import { Types } from 'mongoose';

export const serializePoll = (poll: IPollDocument) => {
  const pollObj = poll.toObject();
  return {
    ...pollObj,
    id: (pollObj._id as Types.ObjectId).toString(),
    _id: undefined,
    results: Object.fromEntries(
      poll.options.map(option => [
        option,
        (pollObj.results?.get(option) || 0)
      ])
    )
  };
};