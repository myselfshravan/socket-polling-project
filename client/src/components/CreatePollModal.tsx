import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

interface CreatePollModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (question: string, options: string[]) => Promise<void>;
}

const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(opt => opt.trim()).filter(Boolean);
    
    if (!trimmedQuestion) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive'
      });
      return false;
    }

    if (trimmedOptions.length < MIN_OPTIONS) {
      toast({
        title: 'Error',
        description: `Please enter at least ${MIN_OPTIONS} options`,
        variant: 'destructive'
      });
      return false;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(trimmedOptions);
    if (uniqueOptions.size !== trimmedOptions.length) {
      toast({
        title: 'Error',
        description: 'Options must be unique',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const trimmedOptions = options.map(opt => opt.trim()).filter(Boolean);
      await onSubmit(question.trim(), trimmedOptions);
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create poll',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, '']);
    } else {
      toast({
        title: 'Error',
        description: `Maximum ${MAX_OPTIONS} options allowed`,
        variant: 'destructive'
      });
    }
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              disabled={submitting}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Options ({MIN_OPTIONS}-{MAX_OPTIONS})</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={submitting}
                  maxLength={100}
                  required
                />
                {options.length > MIN_OPTIONS && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={submitting}
                    className="px-2"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            {options.length < MAX_OPTIONS && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={submitting}
                className="w-full"
              >
                Add Option
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
