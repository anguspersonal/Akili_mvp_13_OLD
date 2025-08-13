import { Avatar, AvatarFallback } from "./ui/avatar";
import { MessageFeedback } from "./MessageFeedback";
import { User } from "lucide-react";
import robotWaving from "figma:asset/dd33bd000047de49ff7970ab848f56db978ab2db.png";
import robotCelebrating from "figma:asset/96b52453f6ca2fb65934ee3da3e29eac8e63f131.png";

interface MessageProps {
  id: string;
  content: string;
  isBot: boolean;
  timestamp?: Date;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

export function Message({ id, content, isBot, timestamp, attachments }: MessageProps) {
  // Randomly choose between the two robot images for variety
  const robotImage = Math.random() > 0.5 ? robotWaving : robotCelebrating;
  
  return (
    <div className={`group flex gap-3 mb-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="flex-shrink-0">
        {isBot ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 p-1 shadow-lg">
            <img 
              src={robotImage} 
              alt="Akilii Robot" 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 text-white">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      
      <div className={`max-w-[80%] ${isBot ? 'text-left' : 'text-right'}`}>
        <div className="space-y-2">
          <div
            className={`inline-block p-4 rounded-2xl break-words shadow-sm ${
              isBot
                ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-100 text-gray-800'
                : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`inline-block p-3 rounded-lg border max-w-xs ${
                    isBot
                      ? 'bg-white border-blue-200'
                      : 'bg-white/90 border-purple-200'
                  }`}
                >
                  {attachment.type.startsWith('image/') ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {attachment.type.split('/')[1]?.toUpperCase().slice(0, 3) || 'FILE'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{attachment.name}</p>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-2 px-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
          {timestamp && (
            <p className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          
          {/* Feedback for bot messages only */}
          {isBot && (
            <MessageFeedback 
              messageId={id}
              messageContent={content}
            />
          )}
        </div>
      </div>
    </div>
  );
}