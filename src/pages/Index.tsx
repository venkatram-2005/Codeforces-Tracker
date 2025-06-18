
import { useState } from 'react';
import { Student } from '@/types/student';
import { Layout } from '@/components/Layout';
import { StudentsTable } from '@/components/StudentsTable';
import { StudentProfile } from '@/components/StudentProfile';

const Index = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <Layout>
      {selectedStudent ? (
        <StudentProfile 
          student={selectedStudent} 
          onBack={() => setSelectedStudent(null)} 
        />
      ) : (
        <StudentsTable onViewStudent={setSelectedStudent} />
      )}
    </Layout>
  );
};

export default Index;
