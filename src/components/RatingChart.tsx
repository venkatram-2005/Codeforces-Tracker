
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Contest } from '@/types/student';

interface RatingChartProps {
  contests: Contest[];
}

export const RatingChart = ({ contests }: RatingChartProps) => {
  const chartData = contests
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(contest => ({
      date: contest.date.toLocaleDateString(),
      rating: contest.newRating || 0,
      name: contest.name
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No contest data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          fontSize={12}
          tick={{ fontSize: 12 }}
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
                  <p className="font-medium">{payload[0]?.payload?.name}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-sm">
                    Rating: <span className="font-medium">{payload[0]?.value}</span>
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="rating" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
