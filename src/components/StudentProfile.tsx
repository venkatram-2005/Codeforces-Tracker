
import { ArrowLeft, Calendar, Trophy, Target, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/types/student';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { RatingChart } from './RatingChart';
import { ProblemDistributionChart } from './ProblemDistributionChart';
import { SubmissionHeatmap } from './SubmissionHeatmap';
import { useState, useMemo } from 'react';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

export const StudentProfile = ({ student, onBack }: StudentProfileProps) => {
  const { data: studentProgress, isLoading } = useStudentProgress(student.id);
  const [contestFilter, setContestFilter] = useState('365');
  const [problemFilter, setProblemFilter] = useState('30');

  // Filter contests based on selected time period
  const filteredContests = useMemo(() => {
    if (!studentProgress?.contests) return [];
    
    const days = parseInt(contestFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return studentProgress.contests.filter(contest => contest.date >= cutoffDate);
  }, [studentProgress?.contests, contestFilter]);

  // Filter problems based on selected time period
  const filteredProblems = useMemo(() => {
    if (!studentProgress?.problems) return [];
    
    const days = parseInt(problemFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return studentProgress.problems.filter(problem => problem.solvedAt >= cutoffDate);
  }, [studentProgress?.problems, problemFilter]);

  // Calculate filtered problem statistics
  const filteredProblemStats = useMemo(() => {
    const solvedProblems = filteredProblems.filter(p => p.verdict === 'OK');
    const validRatings = solvedProblems.filter(p => p.rating).map(p => p.rating);
    
    const totalSolved = solvedProblems.length;
    const averageRating = validRatings.length > 0 ? Math.round(validRatings.reduce((a, b) => a + b, 0) / validRatings.length) : 0;
    const maxProblemRating = validRatings.length > 0 ? Math.max(...validRatings) : 0;
    const days = parseInt(problemFilter);
    const averagePerDay = totalSolved / days;

    // Rating distribution for filtered problems
    const ratingDistribution: { [rating: string]: number } = {};
    validRatings.forEach(rating => {
      const bucket = Math.floor(rating / 100) * 100;
      const key = `${bucket}-${bucket + 99}`;
      ratingDistribution[key] = (ratingDistribution[key] || 0) + 1;
    });

    return {
      totalSolved,
      averageRating,
      averagePerDay,
      maxProblemRating,
      ratingDistribution
    };
  }, [filteredProblems, problemFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <div className="text-center">Loading student data...</div>
      </div>
    );
  }

  if (!studentProgress) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <div className="text-center">No data found for this student.</div>
      </div>
    );
  }

  const { student: studentData, contests, problems, statistics } = studentProgress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{studentData.name}</h1>
          <p className="text-muted-foreground">@{studentData.codeforcesHandle}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Rating</p>
                <p className="text-2xl font-bold">{studentData.currentRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Rating</p>
                <p className="text-2xl font-bold">{studentData.maxRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">{statistics.totalSolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Day</p>
                <p className="text-2xl font-bold">{statistics.averagePerDay.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="contests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="contests">Contest History</TabsTrigger>
          <TabsTrigger value="problems">Problem Solving Data</TabsTrigger>
          <TabsTrigger value="activity">Activity Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="contests" className="space-y-6">
          {/* Contest Filter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contest History</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={contestFilter} onValueChange={setContestFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last 365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RatingChart contests={filteredContests} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contest List ({filteredContests.length} contests)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No contest data available for the selected period
                  </p>
                ) : (
                  filteredContests.slice(0, 10).map((contest) => {
                    const problemsUnsolved = contest.totalProblems - contest.problemsSolved;
                    return (
                      <div key={contest.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{contest.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {contest.date.toLocaleDateString()} • Rank: {contest.rank}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Problems unsolved: {problemsUnsolved}/{contest.totalProblems}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={contest.ratingChange >= 0 ? "default" : "destructive"}>
                            {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            New Rating: {contest.newRating}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems" className="space-y-6">
          {/* Problem Filter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Problem Solving Statistics</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={problemFilter} onValueChange={setProblemFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Most Difficult</p>
                  <p className="text-2xl font-bold">{filteredProblemStats.maxProblemRating || 'N/A'}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Total Solved</p>
                  <p className="text-2xl font-bold">{filteredProblemStats.totalSolved}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{filteredProblemStats.averageRating || 'N/A'}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Avg per Day</p>
                  <p className="text-2xl font-bold">{filteredProblemStats.averagePerDay.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Problem Distribution by Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <ProblemDistributionChart ratingDistribution={filteredProblemStats.ratingDistribution} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionHeatmap problems={problems} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
