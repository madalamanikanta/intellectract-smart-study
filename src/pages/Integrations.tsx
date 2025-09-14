import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Integrations = () => {
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
      title: 'Coming Soon!',
      description: 'This feature is not yet implemented.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your accounts from other platforms to import your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link2 className="w-5 h-5 mr-2" />
              LeetCode
            </CardTitle>
            <CardDescription>
              Connect your LeetCode account to sync your solved problems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleConnect}>
              Connect to LeetCode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;
