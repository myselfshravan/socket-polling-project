import express, { Request, Response } from 'express';
import Poll from '../models/Poll';
import { CreatePollDto } from '../types/poll';

const router = express.Router();

// Get all active polls
router.get('/', async (req: Request, res: Response) => {
  try {
    const polls = await Poll.find({ isActive: true });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching polls' });
  }
});

// Get specific poll
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching poll' });
  }
});

// Create new poll
router.post('/', async (req: Request, res: Response) => {
  try {
    const pollData: CreatePollDto = req.body;
    
    // Initialize results object
    const initialResults: { [key: string]: number } = {};
    pollData.options.forEach(option => {
      initialResults[option] = 0;
    });

    const newPoll = new Poll({
      ...pollData,
      results: initialResults
    });

    await newPoll.save();
    res.status(201).json(newPoll);
  } catch (error) {
    res.status(500).json({ message: 'Error creating poll' });
  }
});

// End a poll
router.patch('/:id/end', async (req: Request, res: Response) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    poll.isActive = false;
    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Error ending poll' });
  }
});

// Get poll results
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json({ results: poll.results });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching poll results' });
  }
});

export default router;