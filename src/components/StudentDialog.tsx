
import { useState, useEffect } from 'react';
import { Student } from '@/types/student';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (student: Student) => void;
}

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    phone: '',
    codeforcesHandle: '',
    currentRating: 0,
    maxRating: 0,
    isActive: true,
    emailEnabled: true,
    reminderEmailsSent: 0,
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
        currentRating: 0,
        maxRating: 0,
        isActive: true,
        emailEnabled: true,
        reminderEmailsSent: 0,
      });
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData: Student = {
      id: student?.id || Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      codeforcesHandle: formData.codeforcesHandle || '',
      currentRating: formData.currentRating || 0,
      maxRating: formData.maxRating || 0,
      lastUpdated: new Date(),
      isActive: formData.isActive || true,
      reminderEmailsSent: formData.reminderEmailsSent || 0,
      emailEnabled: formData.emailEnabled || true,
    };

    onSave(studentData);
  };

  const updateField = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {student ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">Codeforces Handle</Label>
              <Input
                id="handle"
                value={formData.codeforcesHandle}
                onChange={(e) => updateField('codeforcesHandle', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentRating">Current Rating</Label>
              <Input
                id="currentRating"
                type="number"
                value={formData.currentRating}
                onChange={(e) => updateField('currentRating', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRating">Max Rating</Label>
              <Input
                id="maxRating"
                type="number"
                value={formData.maxRating}
                onChange={(e) => updateField('maxRating', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => updateField('isActive', checked)}
              />
              <Label htmlFor="active">Active Student</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="emailEnabled"
                checked={formData.emailEnabled}
                onCheckedChange={(checked) => updateField('emailEnabled', checked)}
              />
              <Label htmlFor="emailEnabled">Email Notifications</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
