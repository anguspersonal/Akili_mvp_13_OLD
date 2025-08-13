import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, CheckSquare } from 'lucide-react';
import { NPRUserProfile, NPRTask } from '../utils/nprTypes';

interface StatsDashboardProps {
  nprProfile: NPRUserProfile;
  tasks: NPRTask[];
}

export function StatsDashboard({ nprProfile, tasks }: StatsDashboardProps) {
  const stats = [
    {
      value: nprProfile.entries.allEntries.length,
      label: 'NPR Entries',
      icon: Brain,
      color: 'from-blue-500/20 to-purple-500/20'
    },
    {
      value: tasks.filter(t => t.is_ai_generated).length,
      label: 'AI Tasks',
      icon: Sparkles,
      color: 'from-green-500/20 to-emerald-500/20'
    },
    {
      value: tasks.filter(t => t.is_completed).length,
      label: 'Completed',
      icon: CheckSquare,
      color: 'from-orange-500/20 to-yellow-500/20'
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="mb-12"
    >
      <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 + (index * 0.1) }}
            className="text-center akilii-glass-premium p-6 rounded-2xl border border-border/30 hover:border-primary/30 transition-all duration-300 group"
            whileHover={{ y: -2, scale: 1.02 }}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            
            <motion.div 
              className="text-3xl font-black text-foreground mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 + (index * 0.1) }}
            >
              {stat.value}
            </motion.div>
            
            <div className="text-xs akilii-two-tone-text-subtle font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}