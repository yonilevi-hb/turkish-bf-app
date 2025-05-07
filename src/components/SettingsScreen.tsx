
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SettingsProps {
  settings: {
    swipeSensitivity: number;
    speechRate: number;
    autoFlip: boolean;
    cardFlipTime: number;
    theme: 'light' | 'dark' | 'system';
  };
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

export function SettingsScreen({ settings, onSettingsChange, onClose }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    onSettingsChange({ ...localSettings, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-white text-lg">Card Behavior</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="swipe-sensitivity" className="text-sm text-slate-700 dark:text-slate-300">
                Swipe Sensitivity
              </Label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {localSettings.swipeSensitivity}%
              </span>
            </div>
            <Slider 
              id="swipe-sensitivity"
              value={[localSettings.swipeSensitivity]} 
              min={10} 
              max={100} 
              step={5} 
              onValueChange={(value) => handleChange('swipeSensitivity', value[0])}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Higher values require less swiping distance to trigger a card change
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-flip" className="text-sm text-slate-700 dark:text-slate-300">Auto Flip Cards</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically flip cards after a delay
              </p>
            </div>
            <Switch 
              id="auto-flip"
              checked={localSettings.autoFlip} 
              onCheckedChange={(value) => handleChange('autoFlip', value)}
            />
          </div>
          
          {localSettings.autoFlip && (
            <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <Label htmlFor="card-flip-time" className="text-sm text-slate-700 dark:text-slate-300">
                  Card Flip Time
                </Label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {localSettings.cardFlipTime}s
                </span>
              </div>
              <Slider 
                id="card-flip-time"
                value={[localSettings.cardFlipTime]} 
                min={1} 
                max={10} 
                step={0.5} 
                onValueChange={(value) => handleChange('cardFlipTime', value[0])}
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-white text-lg">Speech Settings</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="speech-rate" className="text-sm text-slate-700 dark:text-slate-300">
                Speech Rate
              </Label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {localSettings.speechRate}x
              </span>
            </div>
            <Slider 
              id="speech-rate"
              value={[localSettings.speechRate]} 
              min={0.5} 
              max={2} 
              step={0.1} 
              onValueChange={(value) => handleChange('speechRate', value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-white text-lg">Appearance</h3>
          
          <div className="space-y-2">
            <Label className="text-sm text-slate-700 dark:text-slate-300">Theme</Label>
            <RadioGroup 
              value={localSettings.theme} 
              onValueChange={(value) => handleChange('theme', value)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="text-sm text-slate-700 dark:text-slate-300">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="text-sm text-slate-700 dark:text-slate-300">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="text-sm text-slate-700 dark:text-slate-300">System</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
