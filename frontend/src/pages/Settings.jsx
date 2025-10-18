import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Trash2, Save, Settings as SettingsIcon } from 'lucide-react';
import { getStorageData, saveStorageData } from '../utils/storage';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({ dailyGoal: 120 });
  const [presets, setPresets] = useState([]);
  const [newPreset, setNewPreset] = useState({
    name: '',
    work: 25,
    shortBreak: 5,
    longBreak: 15
  });

  useEffect(() => {
    const savedSettings = getStorageData('settings') || { dailyGoal: 120, currentStreak: 0 };
    const savedPresets = getStorageData('presets') || [
      { id: 'classic', name: 'Classic Pomodoro', work: 25, shortBreak: 5, longBreak: 15 },
      { id: 'short', name: 'Short Sessions', work: 15, shortBreak: 3, longBreak: 10 },
      { id: 'long', name: 'Long Focus', work: 50, shortBreak: 10, longBreak: 30 }
    ];
    
    setSettings(savedSettings);
    setPresets(savedPresets);
  }, []);

  const handleSaveSettings = () => {
    saveStorageData('settings', settings);
    toast({
      title: "Success",
      description: "Settings saved successfully"
    });
  };

  const addPreset = () => {
    if (!newPreset.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a preset name",
        variant: "destructive"
      });
      return;
    }

    const preset = {
      id: Date.now().toString(),
      ...newPreset
    };

    const updatedPresets = [...presets, preset];
    setPresets(updatedPresets);
    saveStorageData('presets', updatedPresets);

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
  };

  const deletePreset = (id) => {
    // Don't allow deletion of default presets
    if (['classic', 'short', 'long'].includes(id)) {
      toast({
        title: "Error",
        description: "Cannot delete default presets",
        variant: "destructive"
      });
      return;
    }

    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    saveStorageData('presets', updatedPresets);

    toast({
      title: "Deleted",
      description: "Preset removed successfully"
    });
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-8">
      <Toaster />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
          <p className="text-slate-500">Customize your study experience</p>
        </div>

        {/* Daily Goal */}
        <Card className="p-6 bg-white border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Daily Goal</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="dailyGoal">Target study time (minutes per day)</Label>
              <Input
                id="dailyGoal"
                type="number"
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) || 0 })}
                className="mt-2 max-w-xs"
                min="1"
              />
              <p className="text-sm text-slate-500 mt-2">
                Current goal: {Math.floor(settings.dailyGoal / 60)}h {settings.dailyGoal % 60}m per day
              </p>
            </div>
            
            <Button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </Card>

        {/* Timer Presets */}
        <Card className="p-6 bg-white border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Timer Presets</h2>
          </div>
          
          {/* Existing Presets */}
          <div className="space-y-3 mb-6">
            {presets.map(preset => (
              <div key={preset.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">{preset.name}</p>
                  <p className="text-sm text-slate-500">
                    Work: {preset.work}m | Short Break: {preset.shortBreak}m | Long Break: {preset.longBreak}m
                  </p>
                </div>
                {!['classic', 'short', 'long'].includes(preset.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePreset(preset.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Preset */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Add Custom Preset</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="presetName">Preset Name</Label>
                <Input
                  id="presetName"
                  placeholder="e.g., Deep Focus"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="workTime">Work (minutes)</Label>
                  <Input
                    id="workTime"
                    type="number"
                    value={newPreset.work}
                    onChange={(e) => setNewPreset({ ...newPreset, work: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                  <Input
                    id="shortBreak"
                    type="number"
                    value={newPreset.shortBreak}
                    onChange={(e) => setNewPreset({ ...newPreset, shortBreak: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="longBreak">Long Break (minutes)</Label>
                  <Input
                    id="longBreak"
                    type="number"
                    value={newPreset.longBreak}
                    onChange={(e) => setNewPreset({ ...newPreset, longBreak: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    min="1"
                  />
                </div>
              </div>
              
              <Button onClick={addPreset} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Preset
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-slate-600">
              All your data is stored locally in your browser. It will persist across sessions but won't sync to other devices.
            </p>
            
            <Button
              variant="outline"
              onClick={clearAllData}
              className="text-red-600 border-red-600 hover:bg-red-50"
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