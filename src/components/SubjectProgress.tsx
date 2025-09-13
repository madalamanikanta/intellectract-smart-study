import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const subjects = [
  { name: 'Mathematics', progress: 80 },
  { name: 'Physics', progress: 65 },
  { name: 'Chemistry', progress: 90 },
  { name: 'Biology', progress: 75 },
];

const SubjectProgress = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{subject.name}</span>
                <span className="text-sm font-medium">{subject.progress}%</span>
              </div>
              <Progress value={subject.progress} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectProgress;
