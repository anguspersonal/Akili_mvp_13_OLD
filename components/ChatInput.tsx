import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FileUpload } from "./FileUpload";
import { SpeechToText } from "./SpeechToText";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Send, Loader2, Sparkles, Paperclip, ChevronUp, ChevronDown } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Array<{id: string; name: string; type: string; url: string;}>) => void;
  isLoading: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading && !disabled) {
      const messageToSend = message.trim() || (attachments.length > 0 ? `[Sent ${attachments.length} attachment(s)]` : "");
      const attachmentsToSend = attachments.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        url: file.url
      }));
      
      onSendMessage(messageToSend, attachmentsToSend);
      setMessage("");
      setAttachments([]);
      setShowFileUpload(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSpeechTranscript = (transcript: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + transcript);
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setAttachments(files);
  };

  const canSend = (message.trim() || attachments.length > 0) && !isLoading && !disabled;

  return (
    <div className="space-y-3">
      {/* File Upload Collapsible */}
      <Collapsible open={showFileUpload} onOpenChange={setShowFileUpload}>
        <CollapsibleContent>
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4">
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              maxFiles={3}
              disabled={isLoading || disabled}
            />
          </div>
        </CollapsibleContent>

        {/* Main Input Area */}
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask akilii anything..."
              disabled={isLoading || disabled}
              className="min-h-[48px] resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-200 rounded-2xl px-4 pr-20 bg-white/80 backdrop-blur-sm"
            />
            
            {/* Voice and Attachment Controls */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <SpeechToText
                onTranscript={handleSpeechTranscript}
                disabled={isLoading || disabled}
              />
              
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isLoading || disabled}
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                  title={showFileUpload ? "Hide file upload" : "Attach files"}
                >
                  {showFileUpload ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!canSend}
            className="h-[48px] px-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-1" />
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Collapsible>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          📎 {attachments.length} file(s) attached
        </div>
      )}
    </div>
  );
}