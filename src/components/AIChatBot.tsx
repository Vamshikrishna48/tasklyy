import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage, ChatMessage } from "@/services/aiChatService";

type Message = ChatMessage;

const suggestionChips = [
  { label: "How do I place a bid? 🙋‍♂️", q: "How do I place a bid on a job?" },
  { label: "What is escrow payment? 🔒", q: "Explain the escrow payment system." },
  { label: "How to request a withdrawal? 💰", q: "How do I withdraw my earnings?" },
  { label: "What are worker levels? 🏆", q: "Explain the worker level system." }
];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi there! I'm Tasskly's AI Assistant powered by Google Gemini ✨. Ask me anything about posting tasks, bidding, escrow security, levels, or UPI withdrawals!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputValue("");
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(updatedHistory, textToSend);
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: "I ran into a temporary connection issue. You can ask again, or chat with us directly on WhatsApp for personal assistance: https://wa.me/919640008684",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "Conversation refreshed! Ask me anything about Tasskly, bidding, tasks, or payouts.",
        timestamp: new Date()
      }
    ]);
  };

  const formatMarkdown = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMessageText = (text: string) => {
    if (text.includes("https://wa.me/")) {
      const parts = text.split("https://wa.me/919640008684");
      return (
        <div className="space-y-2">
          <div className="whitespace-pre-line">{formatMarkdown(parts[0])}</div>
          <a
            href="https://wa.me/919640008684"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all text-[11px]"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45h.005c5.422 0 9.832-4.41 9.835-9.83.001-2.624-1.02-5.09-2.873-6.944C16.483 1.975 14.022 1.96 12.012 1.96c-5.424 0-9.83 4.407-9.834 9.829-.001 1.742.453 3.442 1.316 4.96L2.502 21.2l4.145-1.046zm11.082-7.46c-.287-.143-1.697-.838-1.959-.933-.262-.096-.452-.143-.642.143-.19.285-.733.933-.899 1.123-.166.19-.332.214-.618.072-.287-.143-1.21-.446-2.305-1.424-.853-.76-1.429-1.698-1.597-1.983-.167-.285-.018-.44.125-.581.13-.127.287-.333.43-.5.143-.166.19-.285.286-.476.095-.19.048-.357-.024-.5-.071-.143-.642-1.548-.88-2.119-.232-.56-.47-.482-.642-.49-.166-.008-.357-.01-.548-.01-.19 0-.5.072-.762.357-.262.285-1.002.977-1.002 2.38 0 1.403 1.022 2.757 1.164 2.948.143.19 2.01 3.07 4.872 4.312.68.297 1.213.474 1.627.605.684.218 1.306.187 1.8.113.548-.083 1.697-.69 1.936-1.357.238-.667.238-1.238.166-1.357-.07-.12-.262-.19-.548-.332z" />
            </svg>
            Chat on WhatsApp
          </a>
          {parts[1] && <div className="whitespace-pre-line">{formatMarkdown(parts[1])}</div>}
        </div>
      );
    }
    return <div className="whitespace-pre-line">{formatMarkdown(text)}</div>;
  };

  return (
    <>
      {/* Floating circular chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl hover:scale-105 transition-transform duration-200 focus:outline-none relative group border border-white/20"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <Bot className="h-6 w-6" />
              {/* Soft pulsing notification dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white ring-2 ring-white shadow-lg animate-pulse">
                ✨
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Floating chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[370px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-card/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex flex-row items-center justify-between space-y-0 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    Tasskly Assistant <Sparkles className="h-3 w-3 text-pink-300 fill-pink-300" />
                  </CardTitle>
                  <p className="text-[10px] text-indigo-100 font-medium">Powered by Gemini AI • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      msg.sender === "user" 
                        ? "bg-indigo-600 text-white" 
                        : "bg-purple-100 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white border-indigo-700 rounded-tr-none"
                          : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                      }`}
                    >
                      {renderMessageText(msg.text)}
                    </div>
                    <span className="text-[8px] text-muted-foreground block px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>

            {/* Suggestions Chips & Input Box */}
            <div className="p-3 border-t shrink-0 bg-white">
              {/* Suggestion Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.q)}
                    className="shrink-0 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 rounded-full px-3 py-1 transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your doubt here..."
                  className="h-9 text-xs focus-visible:ring-indigo-500 border-slate-200"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 rounded-xl"
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
