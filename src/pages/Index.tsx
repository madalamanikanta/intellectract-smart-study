import { Calendar, Brain, Target, TrendingUp, Clock, BookOpen, Zap, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudyCalendar } from "@/components/StudyCalendar";
import { AICoach } from "@/components/AICoach";
import { QuickActions } from "@/components/QuickActions";

const Index = () => {
  const currentStudyPlan = {
    title: "Data Structures & Algorithms",
    progress: 68,
    nextTask: "Binary Trees - Traversal Algorithms",
    timeToday: "2h 15m",
    streak: 12
  };

  const todaysTasks = [
    { id: 1, title: "Complete Binary Tree Problems", type: "practice", priority: "high", estimated: "45min" },
    { id: 2, title: "Review Hash Maps", type: "review", priority: "medium", estimated: "20min" },
    { id: 3, title: "Watch Dynamic Programming Video", type: "learn", priority: "low", estimated: "30min" }
  ];

  const recentProgress = [
    { subject: "Arrays", completed: 15, total: 20, lastStudied: "Today" },
    { subject: "Linked Lists", completed: 12, total: 15, lastStudied: "Yesterday" },
    { subject: "Stacks & Queues", completed: 8, total: 10, lastStudied: "2 days ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome to StudyForge</h1>
        <p className="text-xl text-muted-foreground">Your AI-powered study companion is ready!</p>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Current Study Plan */}
            <Card className="shadow-medium border-0 bg-gradient-secondary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-secondary-foreground">
                      {currentStudyPlan.title}
                    </CardTitle>
                    <CardDescription className="text-secondary-foreground/70">
                      Your AI-generated study roadmap
                    </CardDescription>
                  </div>
                  <Target className="w-8 h-8 text-secondary-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-foreground">Progress</span>
                      <span className="text-sm text-secondary-foreground/70">{currentStudyPlan.progress}%</span>
                    </div>
                    <Progress value={currentStudyPlan.progress} className="h-3" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div>
                      <p className="font-medium text-foreground">Next: {currentStudyPlan.nextTask}</p>
                      <p className="text-sm text-muted-foreground">Recommended by AI Coach</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Start Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>
                  Personalized schedule for optimal learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-warning' : 
                          task.priority === 'medium' ? 'bg-primary' : 'bg-success'
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">{task.title}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{task.type}</Badge>
                            <span>~{task.estimated}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Complete</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Progress */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-success" />
                  Recent Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProgress.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{item.subject}</span>
                          <span className="text-sm text-muted-foreground">{item.lastStudied}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(item.completed / item.total) * 100} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {item.completed}/{item.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Study Calendar */}
            <StudyCalendar />
            
            {/* AI Coach */}
            <AICoach />
            
            {/* Study Stats */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Study Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-success-light rounded-lg">
                    <div className="text-2xl font-bold text-success">{currentStudyPlan.timeToday}</div>
                    <div className="text-xs text-success/70">Today</div>
                  </div>
                  <div className="text-center p-3 bg-primary-light rounded-lg">
                    <div className="text-2xl font-bold text-primary">87</div>
                    <div className="text-xs text-primary/70">Problems Solved</div>
                  </div>
                  <div className="text-center p-3 bg-warning-light rounded-lg">
                    <div className="text-2xl font-bold text-warning">4.2</div>
                    <div className="text-xs text-warning/70">Avg Hours/Day</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-secondary-accent">92%</div>
                    <div className="text-xs text-secondary-foreground/70">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;