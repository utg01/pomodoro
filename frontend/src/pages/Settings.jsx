import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Trash2, Save, Settings as SettingsIcon, Target, Timer as TimerIcon } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState({ dailyGoal: 120 });
  const [presets, setPresets] = useState([]);
  const [newPreset, setNewPreset] = useState({
    name: '',
    work: 25,
    shortBreak: 5,
    longBreak: 15
  });

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
          setPresets(savedSettings.presets || [
            { id: 'classic', name: 'Classic Pomodoro', work: 25, shortBreak: 5, longBreak: 15 },
            { id: 'short', name: 'Short Sessions', work: 15, shortBreak: 3, longBreak: 10 },
            { id: 'long', name: 'Long Focus', work: 50, shortBreak: 10, longBreak: 30 }
          ]);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      const updatedSettings = { ...settings, presets };
      await saveSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const addPreset = async () => {
    if (!newPreset.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a preset name",
        variant: "destructive"
      });
      return;
    }

    try {
      const preset = {
        id: Date.now().toString(),
        ...newPreset
      };

      const updatedPresets = [...presets, preset];
      setPresets(updatedPresets);
      
      const updatedSettings = { ...settings, presets: updatedPresets };
      await saveSettings(updatedSettings);

      setNewPreset({
        name: '',
        work: 25,
        shortBreak: 5,
        longBreak: 15
      });

      toast({
        title: "Success",
        description: "Preset added successfully"
      });
    } catch (error) {
      console.error('Error adding preset:', error);
      toast({
        title: "Error",
        description: "Failed to add preset",
        variant: "destructive"
      });
    }
  };

  const deletePreset = async (id) => {
    if (['classic', 'short', 'long'].includes(id)) {
      toast({
        title: "Error",
        description: "Cannot delete default presets",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedPresets = presets.filter(p => p.id !== id);
      setPresets(updatedPresets);
      
      const updatedSettings = { ...settings, presets: updatedPresets };
      await saveSettings(updatedSettings);

      toast({
        title: "Deleted",
        description: "Preset removed successfully"
      });
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: "Error",
        description: "Failed to delete preset",
        variant: "destructive"
      });
    }
  };

  const clearAllData = () => {
    toast({
      title: "Info",
      description: "Your data is synced to Firebase. Sign out to clear local cache.",
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 relative z-0">
      <Toaster />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">Settings</h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm">Customize your experience</p>
        </div>

        {/* Daily Goal */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/30">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Daily Goal</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="dailyGoal" className="text-gray-300 font-mono">Target study time (minutes per day)</Label>
              <Input
                id="dailyGoal"
                type="number"
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) || 0 })}
                className="mt-2 max-w-xs bg-[#1a1a24] border-[#22d3ee]/20 text-white font-mono"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-2 font-mono">
                Current goal: {Math.floor(settings.dailyGoal / 60)}h {settings.dailyGoal % 60}m per day
              </p>
            </div>
            
            <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0 shadow-lg shadow-cyan-500/30">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </Card>

        {/* Timer Presets */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/30">
              <TimerIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Timer Presets</h2>
          </div>
          
          {/* Existing Presets */}
          <div className="space-y-3 mb-6">
            {presets.map(preset => (
              <div key={preset.id} className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg border border-[#22d3ee]/10">
                <div>
                  <p className="font-semibold text-white font-mono">{preset.name}</p>
                  <p className="text-sm text-gray-400 font-mono">
                    Work: {preset.work}m | Short: {preset.shortBreak}m | Long: {preset.longBreak}m
                  </p>
                </div>
                {!['classic', 'short', 'long'].includes(preset.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePreset(preset.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Preset */}
          <div className="border-t border-[#22d3ee]/20 pt-6">
            <h3 className="font-semibold text-white mb-4 font-mono">Add Custom Preset</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="presetName" className="text-gray-300 font-mono">Preset Name</Label>
                <Input
                  id="presetName"
                  placeholder="e.g., Deep Focus"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                  className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white font-mono"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="workTime" className="text-gray-300 font-mono">Work (min)</Label>
                  <Input
                    id="workTime"
                    type="number"
                    value={newPreset.work}
                    onChange={(e) => setNewPreset({ ...newPreset, work: parseInt(e.target.value) || 0 })}
                    className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white font-mono"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="shortBreak" className="text-gray-300 font-mono">Short (min)</Label>
                  <Input
                    id="shortBreak"
                    type="number"
                    value={newPreset.shortBreak}
                    onChange={(e) => setNewPreset({ ...newPreset, shortBreak: parseInt(e.target.value) || 0 })}
                    className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white font-mono"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="longBreak" className="text-gray-300 font-mono">Long (min)</Label>
                  <Input
                    id="longBreak"
                    type="number"
                    value={newPreset.longBreak}
                    onChange={(e) => setNewPreset({ ...newPreset, longBreak: parseInt(e.target.value) || 0 })}
                    className="mt-1 bg-[#1a1a24] border-[#22d3ee]/20 text-white font-mono"
                    min="1"
                  />
                </div>
              </div>
              
              <Button onClick={addPreset} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-0 shadow-lg shadow-cyan-500/30">
                <Plus className="w-4 h-4 mr-2" />
                Add Preset
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 bg-[#13131a]/50 backdrop-blur-xl border-[#22d3ee]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center border border-red-500/30">
              <SettingsIcon className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-400 font-mono text-sm">
              All data is stored locally in your browser. It persists across sessions but won't sync to other devices.
            </p>
            
            <Button
              variant="outline"
              onClick={clearAllData}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 font-mono"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;