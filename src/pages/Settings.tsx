
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  
  const [syncTime, setSyncTime] = useState('02:00');
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [inactivityThreshold, setInactivityThreshold] = useState('7');

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setSyncTime(settings.syncTime || '02:00');
      setSyncFrequency(settings.syncFrequency || 'daily');
      setAutoEmailEnabled(settings.autoEmailEnabled);
      setInactivityThreshold(settings.inactivityThresholdDays?.toString() || '7');
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      await updateSettingsMutation.mutateAsync({
        id: settings.id,
        syncTime,
        syncFrequency,
        autoEmailEnabled,
        inactivityThresholdDays: parseInt(inactivityThreshold)
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleManualSync = async () => {
    try {
      const response = await fetch('https://jycnchyashsvnvbqrvgf.supabase.co/functions/v1/sync-codeforces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Y25jaHlhc2hzdm52YnFydmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzgzOTIsImV4cCI6MjA2NTc1NDM5Mn0.tdeduz4cQM55qy65aAbEVZ5nOZ7tULYEbLn1yBlF87w`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        toast({
          title: "Sync initiated",
          description: "Manual data sync has been started. This may take a few minutes.",
        });
      } else {
        throw new Error('Failed to start sync');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start manual sync. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <div className="grid gap-6">
          {/* Data Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncTime">Sync Time</Label>
                  <Input
                    id="syncTime"
                    type="time"
                    value={syncTime}
                    onChange={(e) => setSyncTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time when automatic data sync runs (24-hour format)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncFrequency">Sync Frequency</Label>
                  <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twiceDaily">Twice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleManualSync} variant="outline">
                  Run Manual Sync Now
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Last sync: {settings?.lastSync ? new Date(settings.lastSync).toLocaleString() : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Automatic Email Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminder emails to inactive students
                  </p>
                </div>
                <Switch
                  checked={autoEmailEnabled}
                  onCheckedChange={setAutoEmailEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Inactivity Threshold (Days)</Label>
                <Select value={inactivityThreshold} onValueChange={setInactivityThreshold}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Send reminder after this many days of inactivity
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Codeforces API</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Connected and healthy</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Database</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Supabase</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Sync Service</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
