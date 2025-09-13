import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface FlashcardListProps {
  flashcards: Flashcard[];
  onDelete: (cardId: number) => void;
}

const FlashcardList = ({ flashcards, onDelete }: FlashcardListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flashcards.map((flashcard) => (
            <div key={flashcard.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{flashcard.front}</p>
                <p className="text-sm text-muted-foreground">{flashcard.back}</p>
              </div>
              <div>
                <Button variant="outline" size="sm" className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(flashcard.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardList;
