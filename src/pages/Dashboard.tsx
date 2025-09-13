import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAIRoadmap } from "@/hooks/useAIRoadmap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Plus,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { AICoach } from "@/components/AICoach";
import { QuickActions } from "@/components/QuickActions";
import CourseCompletionChart from "@/components/CourseCompletionChart";
import RecentActivityChart from "@/components/RecentActivityChart";
import SubjectProgress from "@/components/SubjectProgress";
import Leaderboard from "@/components/Leaderboard";

const Dashboard = () => {
  const { user } = useAuth();
  const { generateRoadmap, loading: roadmapLoading } = useAIRoadmap();
  const { toast } = useToast();
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [showRoadmapDialog, setShowRoadmapDialog] = useState(false);
  const [roadmapForm, setRoadmapForm] = useState({
    goal: '',
    timeline_weeks: 4,
    available_hours_per_week: 10,
    difficulty_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
  });

  useEffect(() => {
    fetchStudyPlans();
    fetchRecentSessions();
  }, []);

  const fetchStudyPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setStudyPlans(data || []);
    } catch (error) {
      console.error('Error fetching study plans:', error);
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSessions(data || []);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!roadmapForm.goal.trim()) {
      toast({
        title: "Error",
        description: "Please enter a study goal",
        variant: "destructive"
      });
      return;
    }

    const result = await generateRoadmap(roadmapForm);
    
    if (result) {
      toast({
        title: "Success!",
        description: "Your AI study roadmap has been created",
      });
      setShowRoadmapDialog(false);
      setRoadmapForm({
        goal: '',
        timeline_weeks: 4,
        available_hours_per_week: 10,
        difficulty_level: 'intermediate'
      });
      fetchStudyPlans(); // Refresh the study plans list
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Welcome back!</h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            12 day streak
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Roadmap */}
          <Card className="border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>AI Study Roadmap</CardTitle>
                </div>
                <Dialog open={showRoadmapDialog} onOpenChange={setShowRoadmapDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Create AI Study Roadmap
                      </DialogTitle>
                      <DialogDescription>
                        Let AI create a personalized study plan based on your goals and schedule.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal">Study Goal</Label>
                        <Input
                          id="goal"
                          placeholder="e.g., Learn React for web development"
                          value={roadmapForm.goal}
                          onChange={(e) => setRoadmapForm(prev => ({ ...prev, goal: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="timeline">Timeline (weeks)</Label>
                          <Input
                            id="timeline"
                            type="number"
                            min="1"
                            max="52"
                            value={roadmapForm.timeline_weeks}
                            onChange={(e) => setRoadmapForm(prev => ({ ...prev, timeline_weeks: parseInt(e.target.value) || 4 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hours">Hours/week</Label>
                          <Input
                            id="hours"
                            type="number"
                            min="1"
                            max="40"
                            value={roadmapForm.available_hours_per_week}
                            onChange={(e) => setRoadmapForm(prev => ({ ...prev, available_hours_per_week: parseInt(e.target.value) || 10 }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty Level</Label>
                        <Select
                          value={roadmapForm.difficulty_level}
                          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                            setRoadmapForm(prev => ({ ...prev, difficulty_level: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleGenerateRoadmap} 
                        disabled={roadmapLoading}
                        className="w-full"
                      >
                        {roadmapLoading ? "Generating..." : "Create Roadmap"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Personalized learning path powered by AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyPlans.length > 0 ? (
                <div className="space-y-3">
                  {studyPlans.slice(0, 2).map((plan) => (
                    <div key={plan.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{plan.title}</span>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                      </div>
                      <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {plan.difficulty_level} • {plan.timeline_days} days • {plan.hours_per_week}h/week
                      </p>
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-primary text-white hover:opacity-90" asChild>
                    <a href="/plans">View All Plans</a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">No study plans yet</p>
                  <Button 
                    onClick={() => setShowRoadmapDialog(true)}
                    className="bg-gradient-primary text-white hover:opacity-90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Your First Roadmap
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Tasks
              </CardTitle>
              <CardDescription>Recommended by your AI coach</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.duration_minutes ? `${session.duration_minutes}min` : 'Study session'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No tasks for today</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourseCompletionChart />
            <RecentActivityChart />
          </div>

          <SubjectProgress />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />
          
          {/* AI Coach */}
          <AICoach />

          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;