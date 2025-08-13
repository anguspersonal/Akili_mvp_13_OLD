import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PremiumBackgroundElements } from '../PremiumBackgroundElements';
import { User } from '../../utils/appTypes';
import { goalOptions } from '../../utils/appConstants';

interface GoalSettingInterfaceProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export function GoalSettingInterface({ user, onBack, onUpdateUser }: GoalSettingInterfaceProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user.goals);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const saveGoals = () => {
    onUpdateUser({ ...user, goals: selectedGoals });
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
            <h1 className="text-2xl font-black text-foreground">Set Goals</h1>
            <p className="text-base text-muted-foreground">Choose what matters most to you</p>
          </div>
          <ThemeToggle size="md" />
        </div>
      </motion.div>

      {/* Premium Goals */}
      <div className="flex-1 premium-spacing-lg space-y-6">
        {goalOptions.map((goal, index) => (
          <motion.button
            key={goal.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            onClick={() => toggleGoal(goal.id)}
            className={`w-full premium-spacing-lg rounded-3xl flex items-center gap-6 transition-premium border-2 ${
              selectedGoals.includes(goal.id)
                ? 'akilii-glass-premium border-primary/50 hover-glow'
                : 'akilii-glass border-border hover:akilii-glass-elevated hover:border-primary/30 hover-lift'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-premium"
              style={{ backgroundColor: goal.color + '20' }}
            >
              <goal.icon className="h-8 w-8" style={{ color: goal.color }} />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-foreground font-bold text-xl mb-2">{goal.title}</h3>
              <p className="text-muted-foreground text-base">{goal.description}</p>
            </div>
            {selectedGoals.includes(goal.id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-8 h-8 akilii-gradient-animated-button rounded-full flex items-center justify-center"
              >
                <Check className="h-5 w-5 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Premium Save Button */}
      <motion.div 
        className="premium-spacing-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.button
          onClick={saveGoals}
          className="w-full btn-responsive akilii-multi-color-button text-primary-foreground font-bold text-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save Goals ({selectedGoals.length})
        </motion.button>
      </motion.div>
    </motion.div>
  );
}