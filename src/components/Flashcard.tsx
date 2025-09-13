import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FlashcardProps {
  front: string;
  back: string;
}

const Flashcard = ({ front, back }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [front]);

  return (
    <Card
      className="h-64 flex items-center justify-center text-2xl font-bold cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <CardContent>
        {isFlipped ? <p>{back}</p> : <p>{front}</p>}
      </CardContent>
    </Card>
  );
};

export default Flashcard;
