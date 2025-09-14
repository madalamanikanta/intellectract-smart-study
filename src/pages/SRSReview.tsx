import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Zap, CheckCircle, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// A hook to interact with the SRS review function (to be created)
const useSrsReview = () => {
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();
    const { toast } = useToast();

    const reviewItem = async (itemId: string, quality: number) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('srs-review', {
                body: { item_id: itemId, quality },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (error) throw error;

            toast({ title: "Success", description: "Review recorded!" });
            return data;
        } catch (error: any) {
            console.error("Error reviewing item:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { reviewItem, loading };
};


const SRSReviewPage = () => {
  const { user } = useAuth();
  const { reviewItem, loading: reviewLoading } = useSrsReview();
  const [dueItems, setDueItems] = useState<any[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  const fetchDueItems = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('spaced_items')
        .select('*')
        .eq('user_id', user.id)
        .lte('next_review', new Date().toISOString());

      if (error) throw error;
      setDueItems(data || []);
    } catch (error) {
      console.error('Error fetching due items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDueItems();
  }, [fetchDueItems]);

  const handleReview = async (quality: number) => {
    const currentItem = dueItems[currentItemIndex];
    if (!currentItem) return;

    await reviewItem(currentItem.id, quality);

    setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (quality >= 3 ? 1 : 0)
    }));

    if (currentItemIndex < dueItems.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session finished
      setCurrentItemIndex(prev => prev + 1);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading review session...</div>;
  }

  if (dueItems.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold">All caught up!</h2>
        <p className="text-muted-foreground">You have no items to review today.</p>
        <Button onClick={fetchDueItems} className="mt-4">
          <RotateCcw className="h-4 w-4 mr-2" />
          Check for more
        </Button>
      </Card>
    );
  }

  if (currentItemIndex >= dueItems.length) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Session Complete!</h2>
        <p className="text-muted-foreground">
          You reviewed {sessionStats.reviewed} items.
          Accuracy: {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
        </p>
        <Button onClick={() => window.location.href = '/dashboard'} className="mt-4">
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  const currentItem = dueItems[currentItemIndex];
  const progress = ((currentItemIndex + 1) / dueItems.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center mt-1">
                {currentItemIndex + 1} / {dueItems.length}
            </p>
        </div>
      <Card className="min-h-[300px] flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {currentItem.concept_title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-xl flex-grow flex items-center justify-center">
            {isFlipped ? (
                <p>{currentItem.concept_id}</p> // Assuming concept_id holds the "back" of the card
            ) : (
                <p className="text-muted-foreground italic">Click to show answer</p>
            )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!isFlipped ? (
            <Button onClick={() => setIsFlipped(true)} className="w-full">
              Show Answer
            </Button>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
              <Button variant="destructive" onClick={() => handleReview(0)}>Again</Button>
              <Button variant="outline" onClick={() => handleReview(3)}>Hard</Button>
              <Button variant="outline" onClick={() => handleReview(4)}>Good</Button>
              <Button variant="primary" onClick={() => handleReview(5)}>Easy</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SRSReviewPage;
