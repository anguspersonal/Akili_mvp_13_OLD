import React from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface SimplifiedMessageFeedbackProps {
  messageId: string;
  currentFeedback?: 'positive' | 'negative' | null;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  size?: 'sm' | 'default';
}

export function SimplifiedMessageFeedback({ 
  messageId, 
  currentFeedback, 
  onFeedback,
  size = 'default'
}: SimplifiedMessageFeedbackProps) {
  
  const buttonSize = size === 'sm' ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1">
      {/* Positive Feedback */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(messageId, 'positive')}
            disabled={currentFeedback !== null}
            className={`${buttonSize} transition-colors ${
              currentFeedback === 'positive' 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <ThumbsUp className={iconSize} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {currentFeedback === 'positive' ? 'Marked as helpful' : 'Mark as helpful'}
        </TooltipContent>
      </Tooltip>

      {/* Negative Feedback */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(messageId, 'negative')}
            disabled={currentFeedback !== null}
            className={`${buttonSize} transition-colors ${
              currentFeedback === 'negative' 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <ThumbsDown className={iconSize} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {currentFeedback === 'negative' ? 'Marked as not helpful' : 'Mark as not helpful'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default SimplifiedMessageFeedback;