import FlashcardList from '@/components/FlashcardList';
import FlashcardForm from '@/components/FlashcardForm';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFlashcardsByDeck, createFlashcard, deleteFlashcard, getDecks } from '@/lib/srs';

const Deck = () => {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    if (deckId) {
      const deckIdNum = parseInt(deckId, 10);
      const decks = getDecks();
      const currentDeck = decks.find(d => d.id === deckIdNum);
      setDeck(currentDeck);
      setFlashcards(getFlashcardsByDeck(deckIdNum));
    }
  }, [deckId]);

  const handleCreateFlashcard = (front: string, back: string) => {
    if (deckId) {
      const deckIdNum = parseInt(deckId, 10);
      createFlashcard(deckIdNum, front, back);
      setFlashcards([...getFlashcardsByDeck(deckIdNum)]);
    }
  };

  const handleDeleteFlashcard = (cardId: number) => {
    if (deckId) {
      deleteFlashcard(cardId);
      const deckIdNum = parseInt(deckId, 10);
      setFlashcards([...getFlashcardsByDeck(deckIdNum)]);
    }
  };

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{deck.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FlashcardList flashcards={flashcards} onDelete={handleDeleteFlashcard} />
        </div>
        <div>
          <FlashcardForm onCreate={handleCreateFlashcard} />
        </div>
      </div>
    </div>
  );
};

export default Deck;
