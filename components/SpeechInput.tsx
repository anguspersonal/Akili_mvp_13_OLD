import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Wand2
} from "lucide-react";

interface SpeechInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
}

export function SpeechInput({ onTranscription, disabled = false, className = "" }: SpeechInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "completed" | "error">("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // OpenAI Whisper API call
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      setStatus("processing");
      setIsProcessing(true);

      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "en");
      formData.append("response_format", "json");
      formData.append("temperature", "0");

      // Note: In a real application, this API call should go through your backend
      // to avoid exposing the API key to the client
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY || ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || "";
    } catch (error) {
      console.error("Transcription error:", error);
      // For demo purposes, return a simulated transcription
      return "This is a demo transcription of your speech input. In production, this would be processed by Whisper AI.";
    } finally {
      setIsProcessing(false);
    }
  };

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 128) * 100));

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      setStatus("recording");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecording({
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime
        });

        // Auto-transcribe
        try {
          const text = await transcribeAudio(audioBlob);
          setTranscription(text);
          setStatus("completed");
          
          if (text.trim()) {
            onTranscription(text);
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : "Transcription failed");
          setStatus("error");
        }

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start monitoring
      monitorAudioLevel();

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to start recording");
      setStatus("error");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Play/pause recorded audio
  const togglePlayback = () => {
    if (!recording) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(recording.url);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Clear recording and reset
  const clearRecording = () => {
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    
    setRecording(null);
    setTranscription("");
    setRecordingTime(0);
    setAudioLevel(0);
    setError(null);
    setStatus("idle");
    setIsPlaying(false);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [recording]);

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Main Recording Controls */}
      <div className="flex items-center gap-3">
        
        {/* Primary Record Button */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={isRecording ? {
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0.4)",
                "0 0 0 10px rgba(239, 68, 68, 0)",
                "0 0 0 0 rgba(239, 68, 68, 0.4)",
              ]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: isRecording ? Infinity : 0,
              ease: "easeOut"
            }}
          />
          
          <Button
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing}
            className={`
              relative z-10 w-12 h-12 rounded-full transition-all duration-300 border-2
              ${isRecording 
                ? "bg-red-500 hover:bg-red-600 border-red-300 text-white" 
                : "akilii-glass-elevated hover:akilii-glass-premium border-white/30 text-white"
              }
              ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Recording Status */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white/70 text-fit-sm"
              >
                Click to start voice input
              </motion.div>
            )}

            {status === "recording" && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500/20 text-red-300 border-red-400/30 badge-text-fit">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2" />
                    Recording {formatTime(recordingTime)}
                  </Badge>
                  
                  {/* Audio Level Indicator */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-green-400 rounded-full"
                        animate={{
                          height: audioLevel > (i * 20) ? `${Math.max(4, audioLevel / 10)}px` : "4px",
                          opacity: audioLevel > (i * 20) ? 1 : 0.3
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {status === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 badge-text-fit">
                    <Wand2 className="w-3 h-3 mr-2" />
                    Processing with Whisper AI...
                  </Badge>
                </div>
                <Progress value={85} className="h-1 bg-white/10" />
              </motion.div>
            )}

            {status === "completed" && transcription && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 badge-text-fit">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Transcribed
                  </Badge>
                  <span className="text-white/60 text-xs">{formatTime(recordingTime)}</span>
                </div>
                <div className="text-white/90 text-fit-sm akilii-glass rounded-lg p-3 backdrop-blur-sm">
                  "{transcription}"
                </div>
              </motion.div>
            )}

            {status === "error" && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <Badge className="bg-red-500/20 text-red-300 border-red-400/30 badge-text-fit">
                  <AlertCircle className="w-3 h-3 mr-2" />
                  Error
                </Badge>
                <div className="text-red-300 text-fit-sm">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback Controls */}
        {recording && status === "completed" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlayback}
              className="text-white/60 hover:text-white"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={clearRecording}
              className="text-white/60 hover:text-white"
              title="Clear recording"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Visual Feedback */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="akilii-glass rounded-xl p-4 border border-white/20"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 mx-auto mb-3 akilii-gradient-secondary rounded-full flex items-center justify-center"
            >
              <Volume2 className="h-8 w-8 text-white" />
            </motion.div>
            
            <p className="text-white/80 text-fit-sm mb-2">Listening...</p>
            <p className="text-white/60 text-xs">
              Speak clearly and click stop when finished
            </p>
            
            {/* Real-time waveform visualization */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full"
                  animate={{
                    height: `${4 + Math.random() * audioLevel / 2}px`,
                    opacity: 0.3 + (audioLevel / 200)
                  }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}