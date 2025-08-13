import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Advanced Interactive Mouse Follower
export function InteractiveMouseFollower({ theme, mousePosition }: { theme: string; mousePosition: { x: number; y: number } }) {
  const [isActive, setIsActive] = useState(false);
  const followerCount = 3;
  const followers = Array.from({ length: followerCount }, (_, i) => i);

  const getFollowerColors = (theme: string) => {
    switch (theme) {
      case 'light':
        return ['#4ecdc4', '#ff6b9d', '#a8e6cf'];
      case 'darker':
        return ['#a8e6cf', '#74b9ff', '#fd79a8'];
      default:
        return ['#4ecdc4', '#a8e6cf', '#ff6b9d'];
    }
  };

  const colors = getFollowerColors(theme);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsActive(true);
      const timeout = setTimeout(() => setIsActive(false), 100);
      return () => clearTimeout(timeout);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {followers.map((follower, index) => (
        <motion.div
          key={`follower-${follower}`}
          className="fixed rounded-full pointer-events-none z-50 mix-blend-screen"
          style={{
            width: `${8 - index * 2}px`,
            height: `${8 - index * 2}px`,
            background: `radial-gradient(circle, ${colors[index]} 0%, transparent 70%)`,
          }}
          animate={{
            x: mousePosition.x - (4 - index),
            y: mousePosition.y - (4 - index),
            scale: isActive ? [1, 1.5, 1] : 1,
            opacity: isActive ? [0.8, 1, 0.8] : 0.6,
          }}
          transition={{
            type: "spring",
            damping: 20 + index * 5,
            stiffness: 300 - index * 50,
            mass: 0.5 + index * 0.2,
            scale: { duration: 0.3 },
            opacity: { duration: 0.2 },
          }}
        />
      ))}
    </>
  );
}