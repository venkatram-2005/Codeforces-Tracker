
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Plus, Edit, Trash2, Download, RefreshCw } from 'lucide-react';
import { Student } from '@/types/student';
import { StudentDialog } from './StudentDialog';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '@/hooks/useStudents';
import { toast } from '@/hooks/use-toast';

interface StudentsTableProps {
  onViewStudent: (student: Student) => void;
}

export const StudentsTable = ({ onViewStudent }: StudentsTableProps) => {
  const { data: students = [], isLoading, refetch } = useStudents();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudentMutation.mutateAsync(studentId);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (student: Student) => {
    try {
      if (editingStudent) {
        await updateStudentMutation.mutateAsync(student);
      } else {
        await createStudentMutation.mutateAsync(student);
      }
      setIsDialogOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating', 'Last Updated', 'Status'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.name,
        student.email,
        student.phone,
        student.codeforcesHandle,
        student.currentRating,
        student.maxRating,
        student.lastUpdated.toISOString(),
        student.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSyncStudent = async (studentId: string) => {
    try {
      const response = await fetch('https://jycnchyashsvnvbqrvgf.supabase.co/functions/v1/sync-codeforces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Y25jaHlhc2hzdm52YnFydmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzgzOTIsImV4cCI6MjA2NTc1NDM5Mn0.tdeduz4cQM55qy65aAbEVZ5nOZ7tULYEbLn1yBlF87w`
        },
        body: JSON.stringify({ student_id: studentId })
      });
      
      if (response.ok) {
        toast({
          title: "Sync initiated",
          description: "Student data sync has been started.",
        });
        setTimeout(() => refetch(), 2000);
      } else {
        throw new Error('Failed to sync student data');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync student data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div>Loading students...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student List</CardTitle>
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No students found matching your search.' : 'No students added yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Codeforces Handle</TableHead>
                  <TableHead>Current Rating</TableHead>
                  <TableHead>Max Rating</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.codeforcesHandle}</TableCell>
                    <TableCell>{student.currentRating}</TableCell>
                    <TableCell>{student.maxRating}</TableCell>
                    <TableCell>{student.lastUpdated.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? "default" : "destructive"}>
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewStudent(student)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncStudent(student.id)}
                          title="Sync Codeforces data"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={editingStudent}
        onSave={handleSave}
      />
    </div>
  );
};
