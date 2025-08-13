import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AnimatedAkiliiLogo } from './AnimatedAkiliiLogo';
import { User } from '../utils/appTypes';

interface DailyGreetingProps {
  user: User | null;
}

export function DailyGreeting({ user }: DailyGreetingProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center mb-12"
    >
      <motion.h1 
        className="text-4xl font-black mb-4 text-foreground premium-spacing-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        {getTimeBasedGreeting()}, {user.name}
      </motion.h1>
      <motion.p 
        className="text-xl text-muted-foreground flex items-center justify-center gap-3 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span>Day {user.streak} of your</span>
        <AnimatedAkiliiLogo size="lg" animated={true} inline={true} glowEffect={true} />
        <span>journey</span>
      </motion.p>
    </motion.div>
  );
}