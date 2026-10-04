import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { sendChatMessage } from "../../services/chat.service";

const QUICK_SUGGESTIONS = [
  { label: "Coorg trip", query: "Plan a weekend trip to Coorg from Bangalore for 4 people" },
  { label: "Goa getaway", query: "Plan a Goa trip from Bangalore for a group of 6" },
  { label: "Ooty fare", query: "Estimate the fare to Ooty from Bangalore for 4 people" },
  { label: "Hampi spots", query: "What are the best places to visit in Hampi?" },
  { label: "Best vehicle", query: "Which vehicle is best for a group of 6 for a long trip?" },
];

/**
 * Basic markdown-style formatter for AI messages.
 * Converts bold (**text**), lists (- or 1.), and newlines into clean styled JSX.
 */
function FormatAIMessage({ content }) {
  if (!content) return null;

  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split("\n");
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              // Parse bold **text**
              const parts = line.split(/(\*\*.*?\*\*)/g);
              const formattedLine = parts.map((part, idx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={idx} className="font-bold text-orange">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              });

              // Check if bullet point
              if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-orange text-xs">•</span>
                    <span>{formattedLine}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{formattedLine}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AIChatAssistantModal({ isOpen, onClose }) {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize conversation session & welcome message
  useEffect(() => {
    if (isOpen) {
      if (!conversationId) {
        const newId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        setConversationId(newId);
      }

      if (messages.length === 0) {
        const userName = userProfile?.name || currentUser?.displayName || currentUser?.phoneNumber || "Traveler";
        const greeting = `Hi **${userName}**!\n\nI'm **Zenera AI**, your outstation trip planner.\n\nAsk me anything about **itineraries**, **vehicle recommendations**, **fare estimates**, or **route places to visit**!`;
        
        setMessages([
          {
            id: "welcome_1",
            role: "assistant",
            content: greeting,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend = null) => {
    const messageText = (textToSend || input).trim();

    console.log("[AI CHAT] AI SEND CLICKED", {
      messageText,
      uid: currentUser?.uid,
      conversationId,
      isTyping,
    });

    if (!messageText || isTyping) {
      console.warn("[AI CHAT] Send aborted: empty message or typing in progress.");
      return;
    }

    if (!currentUser || !currentUser.uid) {
      console.error("[AI CHAT] Send aborted: user not authenticated.");
      setErrorMsg("You must be logged in to chat with Zenera AI.");
      return;
    }

    const userMsgId = `user_${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: messageText,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    setErrorMsg(null);
    setLastFailedMessage(null);

    try {
      console.log("[AI CHAT] Calling sendChatMessage service...");
      const response = await sendChatMessage({
        message: messageText,
        conversationId,
        uid: currentUser.uid,
      });

      console.log("[AI CHAT] Response received in modal:", response);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: response.reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("[AI CHAT] Modal caught error sending message:", err);
      const friendlyErr = err.message || "Failed to reach Zenera AI backend.";
      setErrorMsg(friendlyErr);
      setLastFailedMessage(messageText);

      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: friendlyErr,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    const newId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    setConversationId(newId);
    setErrorMsg(null);
    setLastFailedMessage(null);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "New conversation started!\n\nWhat outstation trip are we planning today?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col bg-theme-surface border border-theme-border rounded-3xl shadow-theme-elevated overflow-hidden text-theme-text-primary transition-colors duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-surface-secondary backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange to-orangeLight flex items-center justify-center text-white text-base font-extrabold shadow-lg shadow-orange/20 border border-orange/40">
                AI
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-theme-text-primary text-lg flex items-center gap-2">
                  <span>Zenera AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-sans font-normal">
                    Online · Trip Planner
                  </span>
                </h3>
                <p className="font-body text-theme-text-muted text-xs">Real-time Outstation Travel Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetChat}
                title="New Chat"
                className="p-2 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-surface-secondary text-theme-text-muted hover:text-theme-text-primary text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline font-body">New Chat</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-surface-secondary text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length <= 2 && (
            <div className="px-6 py-3 border-b border-theme-border bg-theme-surface-secondary/50">
              <p className="text-[10px] uppercase font-bold tracking-wider text-theme-text-muted mb-2">
                Quick Ask Suggestions
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-surface border border-theme-border hover:border-orange/40 hover:bg-orange/10 text-theme-text-secondary hover:text-theme-text-primary text-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2.5`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-orange/20 border border-orange/40 flex items-center justify-center text-[10px] font-bold text-orange flex-shrink-0 mb-1">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl border ${
                      isUser
                        ? "bg-orange text-white border-orange/40 rounded-br-none shadow-lg shadow-orange/10"
                        : msg.isError
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 rounded-bl-none"
                        : "bg-theme-surface-secondary text-theme-text-primary border-theme-border rounded-bl-none shadow-sm"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm font-body whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    ) : (
                      <FormatAIMessage content={msg.content} />
                    )}

                    <div
                      className={`text-[9px] mt-1.5 font-mono text-right ${
                        isUser ? "text-white/70" : "text-theme-text-muted"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-theme-surface-secondary border border-theme-border flex items-center justify-center text-[10px] font-bold flex-shrink-0 mb-1 text-theme-text-muted">
                      U
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-orange/20 border border-orange/40 flex items-center justify-center text-[10px] font-bold text-orange">
                  AI
                </div>
                <div className="px-4 py-3 rounded-2xl bg-theme-surface-secondary border border-theme-border rounded-bl-none text-theme-text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-orange animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-orange animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {/* Retry Option on Error */}
            {errorMsg && lastFailedMessage && !isTyping && (
              <div className="flex justify-center my-2">
                <button
                  onClick={() => handleSendMessage(lastFailedMessage)}
                  className="px-4 py-2 rounded-xl bg-orange/20 border border-orange/40 text-orange hover:bg-orange hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Retry message</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-theme-border bg-theme-surface-secondary/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about itineraries, fare estimates, vehicle recommendations..."
                rows={1}
                className="flex-1 bg-theme-input-bg border border-theme-input-border rounded-2xl px-4 py-3 text-theme-input-text text-xs sm:text-sm placeholder:text-theme-input-placeholder focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors resize-none"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isTyping}
                className={`p-3.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  input.trim() && !isTyping
                    ? "bg-orange text-white hover:bg-orangeLight shadow-lg shadow-orange/30"
                    : "bg-theme-surface-secondary text-theme-text-muted cursor-not-allowed border border-theme-border"
                }`}
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-theme-text-muted text-center mt-2">
              Powered by Zenera Trips AI Cloud Engine · 50 messages/day limit
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
