
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contest, Problem, StudentProgress } from '@/types/student';

export const useStudentProgress = (studentId: string) => {
  return useQuery({
    queryKey: ['student-progress', studentId],
    queryFn: async () => {
      // Fetch student data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentError) throw studentError;

      // Fetch contests
      const { data: contestsData, error: contestsError } = await supabase
        .from('contests')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });
      
      if (contestsError) throw contestsError;

      // Fetch problems
      const { data: problemsData, error: problemsError } = await supabase
        .from('problems')
        .select('*')
        .eq('student_id', studentId)
        .order('solved_at', { ascending: false });
      
      if (problemsError) throw problemsError;

      // Transform data
      const contests: Contest[] = contestsData.map(contest => ({
        id: contest.id,
        name: contest.name,
        date: new Date(contest.date),
        rank: contest.rank || 0,
        ratingChange: contest.rating_change || 0,
        newRating: contest.new_rating || 0,
        problemsSolved: contest.problems_solved || 0,
        totalProblems: contest.total_problems || 0
      }));

      const problems: Problem[] = problemsData.map(problem => ({
        id: problem.id,
        name: problem.name,
        rating: problem.rating || 0,
        solvedAt: new Date(problem.solved_at),
        verdict: problem.verdict as Problem['verdict'] || 'OK'
      }));

      // Calculate statistics
      const totalSolved = problems.filter(p => p.verdict === 'OK').length;
      const validRatings = problems.filter(p => p.rating && p.verdict === 'OK').map(p => p.rating);
      const averageRating = validRatings.length > 0 ? Math.round(validRatings.reduce((a, b) => a + b, 0) / validRatings.length) : 0;
      const maxProblemRating = validRatings.length > 0 ? Math.max(...validRatings) : 0;
      
      // Calculate average per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentProblems = problems.filter(p => p.solvedAt >= thirtyDaysAgo && p.verdict === 'OK');
      const averagePerDay = recentProblems.length / 30;

      // Rating distribution
      const ratingDistribution: { [rating: string]: number } = {};
      validRatings.forEach(rating => {
        const bucket = Math.floor(rating / 100) * 100;
        const key = `${bucket}-${bucket + 99}`;
        ratingDistribution[key] = (ratingDistribution[key] || 0) + 1;
      });

      const studentProgress: StudentProgress = {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone || '',
          codeforcesHandle: student.codeforces_handle,
          currentRating: student.current_rating || 0,
          maxRating: student.max_rating || 0,
          lastUpdated: new Date(student.last_updated || ''),
          isActive: student.is_active || false,
          reminderEmailsSent: student.reminder_emails_sent || 0,
          emailEnabled: student.email_enabled || true
        },
        contests,
        problems,
        statistics: {
          totalSolved,
          averageRating,
          averagePerDay,
          maxProblemRating,
          ratingDistribution
        }
      };

      return studentProgress;
    },
    enabled: !!studentId
  });
};
