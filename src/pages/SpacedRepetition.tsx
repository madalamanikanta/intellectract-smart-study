import Flashcard from '@/components/Flashcard';
import SRSControls from '@/components/SRSControls';
import SRSSchedule from '@/components/SRSSchedule';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFlashcardsForReview, updateFlashcardReview, getSchedule, Flashcard as FlashcardType } from '@/lib/srs';

const SpacedRepetition = () => {
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deckId');

  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    if (deckId) {
      const deckIdNum = parseInt(deckId, 10);
      setFlashcards(getFlashcardsForReview(deckIdNum));
    }
    setSchedule(getSchedule());
  }, [deckId]);

  const handleQualityClick = (quality: number) => {
    const card = flashcards[currentCardIndex];
    if (card) {
      updateFlashcardReview(card.id, quality);
      setCurrentCardIndex(prevIndex => prevIndex + 1);
      setSchedule(getSchedule());
    }
  };

  if (!deckId) {
    return <div>No deck selected.</div>;
  }

  const currentCard = flashcards[currentCardIndex];

  if (!currentCard) {
    return <div>You have completed all the flashcards for today!</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Spaced Repetition</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Flashcard front={currentCard.front} back={currentCard.back} />
          <SRSControls onQualityClick={handleQualityClick} />
        </div>
        <div className="space-y-6">
          <SRSSchedule schedule={schedule} />
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetition;
