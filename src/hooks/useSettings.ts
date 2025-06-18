
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AppSettings {
  id: string;
  syncTime: string;
  syncFrequency: string;
  autoEmailEnabled: boolean;
  inactivityThresholdDays: number;
  lastSync: string | null;
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        syncTime: data.sync_time,
        syncFrequency: data.sync_frequency,
        autoEmailEnabled: data.auto_email_enabled,
        inactivityThresholdDays: data.inactivity_threshold_days,
        lastSync: data.last_sync
      } as AppSettings;
    }
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      const { data, error } = await supabase
        .from('app_settings')
        .update({
          sync_time: settings.syncTime,
          sync_frequency: settings.syncFrequency,
          auto_email_enabled: settings.autoEmailEnabled,
          inactivity_threshold_days: settings.inactivityThresholdDays
        })
        .eq('id', settings.id!)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};
