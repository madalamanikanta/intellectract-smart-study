import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface FlashcardFormProps {
  onCreate: (front: string, back: string) => void;
}

const FlashcardForm = ({ onCreate }: FlashcardFormProps) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onCreate(front, back);
    setFront('');
    setBack('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Flashcard</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea
              id="front"
              placeholder="Enter the question or term"
              value={front}
              onChange={(e) => setFront(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              placeholder="Enter the answer or definition"
              value={back}
              onChange={(e) => setBack(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Flashcard
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FlashcardForm;
