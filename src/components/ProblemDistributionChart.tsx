
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProblemDistributionChartProps {
  ratingDistribution: { [rating: string]: number };
}

export const ProblemDistributionChart = ({ ratingDistribution }: ProblemDistributionChartProps) => {
  const chartData = Object.entries(ratingDistribution)
    .map(([range, count]) => ({
      range,
      count,
      displayRange: range.replace('-', ' - ')
    }))
    .sort((a, b) => {
      const aStart = parseInt(a.range.split('-')[0]);
      const bStart = parseInt(b.range.split('-')[0]);
      return aStart - bStart;
    });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No problem data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="displayRange" 
          fontSize={12}
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          fontSize={12}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                  <p className="font-medium">Rating Range: {label}</p>
                  <p className="text-sm">
                    Problems Solved: <span className="font-medium">{payload[0]?.value}</span>
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="count" 
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
