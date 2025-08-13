import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PremiumBackgroundElements } from '../PremiumBackgroundElements';
import { User, MoodEntry } from '../../utils/appTypes';
import { moodOptions } from '../../utils/appConstants';

interface MoodCheckInterfaceProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export function MoodCheckInterface({ user, onBack, onUpdateUser }: MoodCheckInterfaceProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const saveMood = () => {
    if (selectedMood === null) return;

    const moodEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      note,
      date: new Date()
    };

    const updatedUser = {
      ...user,
      mood: selectedMood,
      moodHistory: [...(user.moodHistory || []), moodEntry]
    };

    onUpdateUser(updatedUser);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-background flex flex-col"
    >
      <PremiumBackgroundElements />
      
      {/* Premium Header */}
      <motion.div 
        className="akilii-glass-premium premium-spacing-lg border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent flex items-center justify-center transition-premium hover-lift"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-foreground">Mood Check</h1>
            <p className="text-base text-muted-foreground">How are you feeling today?</p>
          </div>
          <ThemeToggle size="md" />
        </div>
      </motion.div>

      {/* Premium Content */}
      <div className="flex-1 premium-spacing-2xl flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-foreground mb-4">Rate your mood</h2>
          <p className="text-xl text-muted-foreground">This helps us personalize your AI experience</p>
        </motion.div>

        {/* Premium Mood Options */}
        <div className="space-y-6 mb-12">
          {moodOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (index * 0.1), ease: "easeOut" }}
              onClick={() => setSelectedMood(option.value)}
              className={`w-full premium-spacing-lg rounded-3xl flex items-center gap-6 transition-premium border-2 ${
                selectedMood === option.value
                  ? 'akilii-glass-premium border-primary/50 hover-glow'
                  : 'akilii-glass border-border hover:akilii-glass-elevated hover:border-primary/30 hover-lift'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center transition-premium"
                style={{ backgroundColor: option.color + '20' }}
              >
                <option.icon className="h-8 w-8" style={{ color: option.color }} />
              </div>
              <span className="text-foreground font-bold text-xl">{option.label}</span>
              {selectedMood === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="ml-auto w-8 h-8 akilii-gradient-animated-button rounded-full flex items-center justify-center"
                >
                  <Check className="h-5 w-5 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Premium Note Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <label className="text-foreground font-bold text-lg mb-4 block">
            Add a note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full premium-spacing-lg rounded-3xl akilii-glass border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-32 transition-premium"
          />
        </motion.div>
      </div>

      {/* Premium Save Button */}
      <motion.div 
        className="premium-spacing-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <motion.button
          onClick={saveMood}
          disabled={selectedMood === null}
          className={`w-full btn-responsive font-bold text-xl transition-premium ${
            selectedMood !== null
              ? 'akilii-multi-color-button text-primary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          whileHover={selectedMood !== null ? { scale: 1.02 } : {}}
          whileTap={selectedMood !== null ? { scale: 0.98 } : {}}
        >
          Save Mood Check
        </motion.button>
      </motion.div>
    </motion.div>
  );
}