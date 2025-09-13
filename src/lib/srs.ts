/**
 * @file This file contains a mocked implementation of a Spaced Repetition System (SRS) algorithm
 * and data management for flashcard decks. It is intended for frontend development and
 * testing purposes only. In a production environment, this file should be replaced with a
 * proper backend API client.
 */

export interface Deck {
  id: number;
  name: string;
}

export interface Flashcard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

// This is a mock database.
let mockDecks: Deck[] = [
  { id: 1, name: 'French Vocabulary' },
  { id: 2, name: 'Data Structures' },
];

let mockFlashcards: Flashcard[] = [
  { id: 1, deckId: 1, front: 'What is the capital of France?', back: 'Paris', nextReview: new Date(), interval: 0, easeFactor: 2.5, repetitions: 0 },
  { id: 2, deckId: 1, front: 'What is "hello" in French?', back: 'Bonjour', nextReview: new Date(), interval: 0, easeFactor: 2.5, repetitions: 0 },
  { id: 3, deckId: 2, front: 'What is a linked list?', back: 'A linear data structure where elements are stored in nodes and linked using pointers.', nextReview: new Date(), interval: 0, easeFactor: 2.5, repetitions: 0 },
];

let nextDeckId = 3;
let nextFlashcardId = 4;

// Deck Management
export const getDecks = () => mockDecks;

export const createDeck = (name: string) => {
  const newDeck = { id: nextDeckId++, name };
  mockDecks.push(newDeck);
  return newDeck;
};

export const updateDeck = (deckId: number, name: string) => {
  const deck = mockDecks.find(d => d.id === deckId);
  if (deck) {
    deck.name = name;
  }
  return deck;
};

export const deleteDeck = (deckId: number) => {
  mockDecks = mockDecks.filter(d => d.id !== deckId);
  mockFlashcards = mockFlashcards.filter(f => f.deckId !== deckId);
};

// Flashcard Management
export const getFlashcardsByDeck = (deckId: number) => mockFlashcards.filter(f => f.deckId === deckId);

export const createFlashcard = (deckId: number, front: string, back: string) => {
  const newFlashcard: Flashcard = {
    id: nextFlashcardId++,
    deckId,
    front,
    back,
    nextReview: new Date(),
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  };
  mockFlashcards.push(newFlashcard);
  return newFlashcard;
};

export const updateFlashcardContent = (cardId: number, front: string, back: string) => {
  const card = mockFlashcards.find(c => c.id === cardId);
  if (card) {
    card.front = front;
    card.back = back;
  }
  return card;
};

export const deleteFlashcard = (cardId: number) => {
  mockFlashcards = mockFlashcards.filter(c => c.id !== cardId);
};


// SRS Logic
export const getFlashcardsForReview = (deckId: number): Flashcard[] => {
  return mockFlashcards.filter(card => card.deckId === deckId && card.nextReview <= new Date());
};

export const updateFlashcardReview = (cardId: number, quality: number) => {
  const card = mockFlashcards.find(c => c.id === cardId);
  if (!card) return;

  if (quality < 3) {
    card.repetitions = 0;
    card.interval = 1;
  } else {
    card.repetitions += 1;
    if (card.repetitions === 1) {
      card.interval = 1;
    } else if (card.repetitions === 2) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
  }

  card.easeFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  if (card.easeFactor < 1.3) {
    card.easeFactor = 1.3;
  }

  const now = new Date();
  card.nextReview = new Date(now.setDate(now.getDate() + card.interval));
};

export const getSchedule = () => {
  const scheduleMap = new Map<string, number>();

  mockFlashcards.forEach(card => {
    if (card.nextReview > new Date()) {
      const dateStr = card.nextReview.toDateString();
      scheduleMap.set(dateStr, (scheduleMap.get(dateStr) || 0) + 1);
    }
  });

  const schedule = Array.from(scheduleMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
