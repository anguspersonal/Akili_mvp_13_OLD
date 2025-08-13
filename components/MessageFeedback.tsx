import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { ThumbsUp, ThumbsDown, MessageSquare, X, WifiOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface MessageFeedbackProps {
  messageId: string;
  messageContent: string;
  onFeedbackSubmitted?: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  messageId: string;
  type: 'positive' | 'negative';
  comment?: string;
  timestamp: Date;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69`;

export function MessageFeedback({ messageId, messageContent, onFeedbackSubmitted }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const checkServerConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const submitFeedback = async (type: 'positive' | 'negative', feedbackComment?: string) => {
    setIsSubmitting(true);
    
    try {
      const feedbackData: FeedbackData = {
        messageId,
        type,
        comment: feedbackComment,
        timestamp: new Date(),
      };

      // Check server connection
      const serverAvailable = await checkServerConnection();
      
      if (!serverAvailable) {
        // Store feedback locally for offline mode
        setIsOfflineMode(true);
        const localFeedback = JSON.parse(localStorage.getItem('offlineFeedback') || '[]');
        localFeedback.push({
          ...feedbackData,
          messageContent: messageContent.substring(0, 200),
        });
        localStorage.setItem('offlineFeedback', JSON.stringify(localFeedback));
        
        setFeedback(type);
        onFeedbackSubmitted?.(feedbackData);
        
        toast.success(
          type === 'positive' 
            ? 'Thanks for the feedback! (Saved locally)' 
            : 'Thanks for the feedback! (Saved locally)',
          {
            description: "Your feedback will be sent when connection is restored"
          }
        );
      } else {
        // Send to server
        const response = await fetch(`${SERVER_URL}/feedback/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...feedbackData,
            messageContent: messageContent.substring(0, 200),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }

        setFeedback(type);
        onFeedbackSubmitted?.(feedbackData);
        
        toast.success(
          type === 'positive' 
            ? 'Thanks for the positive feedback!' 
            : 'Thanks for the feedback! We\'ll use it to improve.'
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowCommentDialog(false);
      setComment('');
    }
  };

  const handleThumbsUp = () => {
    if (feedback === 'positive') return; // Already submitted
    submitFeedback('positive');
  };

  const handleThumbsDown = () => {
    if (feedback === 'negative') return; // Already submitted
    setShowCommentDialog(true);
  };

  const handleCommentSubmit = () => {
    submitFeedback('negative', comment.trim() || undefined);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Positive Feedback */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleThumbsUp}
        disabled={isSubmitting || feedback !== null}
        className={`h-6 w-6 p-0 transition-colors ${
          feedback === 'positive' 
            ? 'text-green-600 bg-green-50 hover:bg-green-100' 
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        }`}
        title="Helpful response"
      >
        <ThumbsUp className="w-3 h-3" />
      </Button>

      {/* Negative Feedback */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleThumbsDown}
        disabled={isSubmitting || feedback !== null}
        className={`h-6 w-6 p-0 transition-colors ${
          feedback === 'negative' 
            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        }`}
        title="Not helpful"
      >
        <ThumbsDown className="w-3 h-3" />
      </Button>

      {/* Comment Dialog for Negative Feedback */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Help Us Improve
              {isOfflineMode && <WifiOff className="w-4 h-4 text-orange-500" />}
            </DialogTitle>
            <DialogDescription>
              What could have been better about this response? Your feedback helps akilii learn and improve for everyone.
              {isOfflineMode && " (Feedback will be saved locally and sent when connection is restored)"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what went wrong or how we could improve..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/500 characters
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommentDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCommentSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Status */}
      {feedback && (
        <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
          feedback === 'positive' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback === 'positive' ? '👍 Helpful' : '👎 Feedback sent'}
          {isOfflineMode && <WifiOff className="w-3 h-3" />}
        </div>
      )}
    </div>
  );
}