import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  language?: string;
  disabled?: boolean;
}

export function SpeechToText({ onTranscript, language = 'en-US', disabled = false }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Voice recognition started - speak now!');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          setTranscript('');
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            toast.error('Microphone access denied or not available.');
            break;
          case 'not-allowed':
            toast.error('Please enable microphone access to use voice input.');
            break;
          case 'network':
            toast.error('Network error occurred. Please check your connection.');
            break;
          default:
            toast.error('Voice recognition failed. Please try again.');
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Request microphone permission and start recognition
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognitionRef.current?.start();
        })
        .catch((error) => {
          console.error('Microphone access error:', error);
          toast.error('Please enable microphone access to use voice input.');
        });
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="text-muted-foreground"
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleListening}
        disabled={disabled}
        className={`transition-colors ${
          isListening 
            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
            : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
        }`}
        title={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        {isListening ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <MicOff className="w-4 h-4" />
          </div>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      
      {/* Live transcript preview */}
      {isListening && transcript && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-800 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-3 h-3" />
            <span className="text-xs text-blue-600">Listening...</span>
          </div>
          <p className="text-xs italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }
}