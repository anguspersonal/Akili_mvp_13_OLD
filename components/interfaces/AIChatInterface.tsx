import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { PremiumBackgroundElements } from '../PremiumBackgroundElements';
import { User, ChatMessage } from '../../utils/appTypes';

interface AIChatInterfaceProps {
  user: User;
  onBack: () => void;
}

export function AIChatInterface({ user, onBack }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hello ${user.name}! I'm your AI companion. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's a great question! Let me help you think through that.",
        "I understand you're looking for guidance on this. Here's what I suggest...",
        "Based on your goals, I think this approach might work well for you.",
        "Let's explore this together. What specific aspect interests you most?",
        "I can help you break this down into manageable steps."
      ];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-background flex flex-col"
    >
      <PremiumBackgroundElements />
      
      {/* Premium Header */}
      <motion.div 
        className="akilii-glass-premium premium-spacing-lg border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent flex items-center justify-center transition-premium hover-lift"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-foreground">AI Chat</h1>
            <p className="text-base text-muted-foreground">Your cognitive companion</p>
          </div>
          <ThemeToggle size="md" />
        </div>
      </motion.div>

      {/* Premium Messages */}
      <div className="flex-1 premium-spacing-lg space-y-6 overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm premium-spacing-md rounded-3xl transition-premium hover-lift ${
                message.sender === 'user'
                  ? 'akilii-gradient-animated-button text-primary-foreground'
                  : 'akilii-glass-premium border border-border text-foreground'
              }`}
            >
              <p className="text-base leading-relaxed">{message.text}</p>
              <p className={`text-sm mt-2 ${
                message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Premium Input */}
      <motion.div 
        className="premium-spacing-lg akilii-glass-premium border-t border-border"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 input-responsive akilii-glass border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-premium"
          />
          <motion.button
            onClick={sendMessage}
            className="btn-responsive akilii-gradient-animated-button text-primary-foreground hover-lift"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}