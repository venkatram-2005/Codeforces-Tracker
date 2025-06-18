
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types/student';
import { toast } from '@/hooks/use-toast';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(student => ({
        ...student,
        lastUpdated: new Date(student.last_updated || ''),
        isActive: student.is_active || false,
        reminderEmailsSent: student.reminder_emails_sent || 0,
        emailEnabled: student.email_enabled || true,
        codeforcesHandle: student.codeforces_handle,
        currentRating: student.current_rating || 0,
        maxRating: student.max_rating || 0
      })) as Student[];
    }
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (student: Omit<Student, 'id' | 'lastUpdated'>) => {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: student.name,
          email: student.email,
          phone: student.phone,
          codeforces_handle: student.codeforcesHandle,
          current_rating: student.currentRating,
          max_rating: student.maxRating,
          is_active: student.isActive,
          reminder_emails_sent: student.reminderEmailsSent,
          email_enabled: student.emailEnabled
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student added",
        description: "Student has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add student: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (student: Student) => {
      const { data, error } = await supabase
        .from('students')
        .update({
          name: student.name,
          email: student.email,
          phone: student.phone,
          codeforces_handle: student.codeforcesHandle,
          current_rating: student.currentRating,
          max_rating: student.maxRating,
          is_active: student.isActive,
          reminder_emails_sent: student.reminderEmailsSent,
          email_enabled: student.emailEnabled
        })
        .eq('id', student.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student updated",
        description: "Student has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update student: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student deleted",
        description: "Student has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete student: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};
