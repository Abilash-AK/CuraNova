import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  Check
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m CuraNova AI Assistant, your medical knowledge companion. I can help you with clinical guidelines, medication information, diagnostic workup, treatment protocols, and general medical questions. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Add loading message
    const loadingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const conversationHistory = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isLoading);
        return [
          ...withoutLoading,
          {
            role: 'assistant',
            content: data.response,
            timestamp: data.timestamp
          }
        ];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove loading message on error
      setMessages(prev => prev.filter(m => !m.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I assist you with your next medical question?',
        timestamp: new Date().toISOString()
      }
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">CuraNova AI Assistant</h2>
              <p className="text-sm text-gray-600">Medical Knowledge Companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Chat
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div
                className={`flex-1 ${
                  message.role === 'user' ? 'flex justify-end' : ''
                }`}
              >
                <div
                  className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      {message.role === 'assistant' && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => copyToClipboard(message.content, index)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Quick Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "First-line treatment for type 2 diabetes",
                "Hypertension management guidelines",
                "Workup for unexplained anemia",
                "Common drug interactions to avoid"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(suggestion)}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a medical question... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {inputMessage.length}/2000
              </div>
            </div>
            <button
              onClick={() => void handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-3 flex items-start space-x-2 text-xs text-gray-500">
            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
            <p>
              AI-generated responses are for informational purposes. Always verify with current clinical guidelines 
              and use your professional judgment for patient care decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
