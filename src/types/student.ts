
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastUpdated: Date;
  isActive: boolean;
  reminderEmailsSent: number;
  emailEnabled: boolean;
}

export interface Contest {
  id: string;
  name: string;
  date: Date;
  rank: number;
  ratingChange: number;
  newRating: number;
  problemsSolved: number;
  totalProblems: number;
}

export interface Problem {
  id: string;
  name: string;
  rating: number;
  solvedAt: Date;
  verdict: 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR';
}

export interface StudentProgress {
  student: Student;
  contests: Contest[];
  problems: Problem[];
  statistics: {
    totalSolved: number;
    averageRating: number;
    averagePerDay: number;
    maxProblemRating: number;
    ratingDistribution: { [rating: string]: number };
  };
}
