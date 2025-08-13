import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
}

export function TextToSpeech({ 
  text, 
  autoPlay = false,
  onStart,
  onEnd,
  onError,
  className = '',
  showControls = true,
  compact = false
}: TextToSpeechProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    voice: null
  });
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Select a good default voice (prefer English)
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
        
        if (englishVoice && !settings.voice) {
          setSettings(prev => ({ ...prev, voice: englishVoice }));
        }
      };

      // Load voices immediately and on voiceschanged event
      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    } else {
      setIsSupported(false);
      console.warn('Speech synthesis not supported in this browser');
    }
  }, []);

  useEffect(() => {
    if (autoPlay && text && isSupported) {
      handlePlay();
    }
  }, [autoPlay, text, isSupported]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const createUtterance = (textToSpeak: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    if (settings.voice) {
      utterance.voice = settings.voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
      onStart?.();
      
      // Start progress tracking
      const textLength = textToSpeak.length;
      const estimatedDuration = (textLength / settings.rate / 200) * 60 * 1000; // Rough estimate
      let elapsed = 0;
      
      progressIntervalRef.current = setInterval(() => {
        elapsed += 100;
        const newProgress = Math.min((elapsed / estimatedDuration) * 100, 95);
        setProgress(newProgress);
      }, 100);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      onEnd?.();
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 1000);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      const errorMessage = `Speech synthesis failed: ${event.error}`;
      console.error(errorMessage, event);
      onError?.(errorMessage);
      toast.error('Speech playback failed');
    };

    return utterance;
  };

  const handlePlay = () => {
    if (!text || !isSupported) return;

    try {
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      // Create new utterance
      utteranceRef.current = createUtterance(text);
      speechSynthesis.speak(utteranceRef.current);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      onError?.('Failed to start speech synthesis');
      toast.error('Failed to start speech playback');
    }
  };

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <VolumeX className="h-4 w-4" />
        <span className="text-xs">Speech not supported</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (isPlaying) {
              if (isPaused) {
                handleResume();
              } else {
                handlePause();
              }
            } else {
              handlePlay();
            }
          }}
          disabled={!text}
          className="h-8 w-8 p-0"
          title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
        >
          {isPlaying ? (
            isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
        
        {progress > 0 && progress < 100 && (
          <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (isPlaying) {
              if (isPaused) {
                handleResume();
              } else {
                handlePause();
              }
            } else {
              handlePlay();
            }
          }}
          disabled={!text}
          className="flex items-center gap-2"
        >
          {isPlaying ? (
            isPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Listen
            </>
          )}
        </Button>

        {isPlaying && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStop}
            className="flex items-center gap-2"
          >
            <VolumeX className="h-4 w-4" />
            Stop
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={handleRestart}
          disabled={!text}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>

        {showControls && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="space-y-1">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Playing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && showControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 akilii-glass rounded-lg border border-border/30"
          >
            <h4 className="text-sm font-medium text-foreground">Voice Settings</h4>
            
            {/* Voice Selection */}
            {voices.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Voice</label>
                <select
                  value={settings.voice?.name || ''}
                  onChange={(e) => {
                    const selectedVoice = voices.find(v => v.name === e.target.value);
                    setSettings(prev => ({ ...prev, voice: selectedVoice || null }));
                  }}
                  className="w-full px-3 py-2 text-xs akilii-glass border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground">Speed</label>
                <span className="text-xs text-foreground">{settings.rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, rate: value }))}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground">Pitch</label>
                <span className="text-xs text-foreground">{settings.pitch.toFixed(1)}</span>
              </div>
              <Slider
                value={[settings.pitch]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, pitch: value }))}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground">Volume</label>
                <span className="text-xs text-foreground">{Math.round(settings.volume * 100)}%</span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, volume: value }))}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSettings({
                rate: 0.9,
                pitch: 1.0,
                volume: 0.8,
                voice: voices.find(v => v.lang.startsWith('en')) || voices[0] || null
              })}
              className="w-full"
            >
              Reset to Default
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}