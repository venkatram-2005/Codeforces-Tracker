
import { Problem } from '@/types/student';

interface SubmissionHeatmapProps {
  problems: Problem[];
}

export const SubmissionHeatmap = ({ problems }: SubmissionHeatmapProps) => {
  // Generate last 12 months of data
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      date,
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: 0
    });
  }

  // Count problems solved per month
  problems.forEach(problem => {
    if (problem.verdict === 'OK') {
      const problemMonth = new Date(problem.solvedAt.getFullYear(), problem.solvedAt.getMonth(), 1);
      const monthData = months.find(m => 
        m.date.getTime() === problemMonth.getTime()
      );
      if (monthData) {
        monthData.count++;
      }
    }
  });

  const maxCount = Math.max(...months.map(m => m.count), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'bg-green-200 dark:bg-green-900';
    if (intensity <= 0.5) return 'bg-green-300 dark:bg-green-800';
    if (intensity <= 0.75) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {months.map((month, index) => (
          <div key={index} className="space-y-1">
            <div 
              className={`h-8 rounded ${getIntensity(month.count)} border border-border/20`}
              title={`${month.month}: ${month.count} problems solved`}
            />
            <div className="text-xs text-center text-muted-foreground">
              {month.month.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-muted rounded-sm" />
          <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm" />
          <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
