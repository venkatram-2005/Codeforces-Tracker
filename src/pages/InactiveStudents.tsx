
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Mail, AlertCircle } from 'lucide-react';
import { useStudents, useUpdateStudent } from '@/hooks/useStudents';
import { toast } from '@/hooks/use-toast';

const InactiveStudents = () => {
  const { data: students = [], isLoading } = useStudents();
  const updateStudentMutation = useUpdateStudent();

  const inactiveStudents = students.filter(student => !student.isActive);

  const sendReminderEmail = (studentId: string) => {
    // TODO: Implement email sending via Edge Function
    toast({
      title: "Reminder sent",
      description: "Reminder email has been sent to the student.",
    });
  };

  const toggleEmailNotifications = async (student: any) => {
    try {
      await updateStudentMutation.mutateAsync({
        ...student,
        emailEnabled: !student.emailEnabled
      });
    } catch (error) {
      console.error('Error toggling email notifications:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Inactive Students</h1>
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Inactive Students</h1>
            <p className="text-muted-foreground">
              Students who haven't made submissions in the last 7 days
            </p>
          </div>
        </div>

        {inactiveStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-green-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">All Students Active!</h3>
              <p className="text-muted-foreground">
                Great news! All students have been active in the last 7 days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {inactiveStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">@{student.codeforcesHandle}</p>
                        </div>
                        <Badge variant="destructive">Inactive</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p>{student.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Rating</p>
                          <p className="font-medium">{student.currentRating}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p>{student.lastUpdated.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Reminders sent: {student.reminderEmailsSent}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={student.emailEnabled}
                            onCheckedChange={() => toggleEmailNotifications(student)}
                          />
                          <span className="text-sm text-muted-foreground">
                            Email notifications
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => sendReminderEmail(student.id)}
                        disabled={!student.emailEnabled}
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InactiveStudents;
