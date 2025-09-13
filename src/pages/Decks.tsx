import DeckList from '@/components/DeckList';
import DeckForm from '@/components/DeckForm';
import { useState, useEffect } from 'react';
import { getDecks, createDeck, deleteDeck } from '@/lib/srs';

const Decks = () => {
  const [decks, setDecks] = useState(getDecks());

  const handleCreateDeck = (name: string) => {
    createDeck(name);
    setDecks([...getDecks()]);
  };

  const handleDeleteDeck = (deckId: number) => {
    deleteDeck(deckId);
    setDecks([...getDecks()]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Flashcard Decks</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeckList decks={decks} onDelete={handleDeleteDeck} />
        </div>
        <div>
          <DeckForm onCreate={handleCreateDeck} />
        </div>
      </div>
    </div>
  );
};

export default Decks;
