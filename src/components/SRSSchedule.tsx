import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SRSScheduleProps {
  schedule: {
    date: string;
    count: number;
  }[];
}

const SRSSchedule = ({ schedule }: SRSScheduleProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.map((review) => (
            <div key={review.date} className="flex items-center justify-between">
              <span className="font-medium">{review.date}</span>
              <Badge>{review.count} cards</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SRSSchedule;
