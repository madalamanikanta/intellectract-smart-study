import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Deck {
  id: number;
  name: string;
  cardCount: number;
}

interface DeckListProps {
  decks: Deck[];
  onDelete: (deckId: number) => void;
}

const DeckList = ({ decks, onDelete }: DeckListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Decks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {decks.map((deck) => (
            <Link key={deck.id} to={`/dashboard/decks/${deck.id}`} className="block p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{deck.name}</h3>
                  <p className="text-sm text-muted-foreground">{deck.cardCount} cards</p>
                </div>
                <div>
                  <Button asChild variant="outline" size="sm" className="mr-2" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/dashboard/srs?deckId=${deck.id}`}>Start Session</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={(e) => e.stopPropagation()}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(deck.id); }}>
                    Delete
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeckList;
