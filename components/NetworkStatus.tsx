import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface NetworkStatusProps {
  onRetry?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'slow' | 'poor'>('good');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      
      // Auto-hide success message
      setTimeout(() => {
        setShowStatus(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show initial status if offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    // Test connection quality
    testConnectionQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testConnectionQuality = async () => {
    if (!navigator.onLine) return;

    try {
      const startTime = performance.now();
      const response = await fetch('/manifest.json', { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      if (loadTime < 500) {
        setConnectionQuality('good');
      } else if (loadTime < 2000) {
        setConnectionQuality('slow');
      } else {
        setConnectionQuality('poor');
      }
    } catch (error) {
      setConnectionQuality('poor');
    }
  };

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        title: 'You\'re offline',
        message: 'Your data is saved locally and will sync when you\'re back online.',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20'
      };
    }

    switch (connectionQuality) {
      case 'slow':
        return {
          icon: Clock,
          title: 'Slow connection',
          message: 'Your connection is slower than usual. Some features may take longer to load.',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        };
      case 'poor':
        return {
          icon: AlertCircle,
          title: 'Poor connection',
          message: 'Your connection is unstable. Data will be saved locally if needed.',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20'
        };
      default:
        return {
          icon: CheckCircle,
          title: 'You\'re back online',
          message: 'Connection restored. Syncing your data now.',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  if (!showStatus && isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-md`}
      >
        <div className={`akilii-glass-premium p-4 rounded-2xl border ${config.borderColor} ${config.bgColor}`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${config.color}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${config.color} text-sm`}>
                {config.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {config.message}
              </p>
              
              {!isOnline && onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Retry connection
                </button>
              )}
            </div>

            {showStatus && isOnline && (
              <button
                onClick={() => setShowStatus(false)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Connection quality indicator for the corner of the screen
export const NetworkIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'slow' | 'poor'>('good');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connection quality periodically
    const interval = setInterval(() => {
      if (navigator.onLine) {
        testConnectionQuality();
      }
    }, 30000); // Every 30 seconds

    const testConnectionQuality = async () => {
      try {
        const startTime = performance.now();
        await fetch('/manifest.json', { 
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        if (loadTime < 500) {
          setConnectionQuality('good');
        } else if (loadTime < 2000) {
          setConnectionQuality('slow');
        } else {
          setConnectionQuality('poor');
        }
      } catch (error) {
        setConnectionQuality('poor');
      }
    };

    if (navigator.onLine) {
      testConnectionQuality();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getIndicatorColor = () => {
    if (!isOnline) return 'text-destructive';
    
    switch (connectionQuality) {
      case 'slow': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-40 ${getIndicatorColor()} opacity-60`}>
      {isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
    </div>
  );
};