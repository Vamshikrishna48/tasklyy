import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

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
      text: "Hi there! I'm Tasskly's AI Assistant. Ask me anything about how the marketplace, bidding, payments, or levels work!",
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

  const getAIResponse = (input: string): string => {
    const q = input.toLowerCase();

    if (q.includes("bid") || q.includes("apply") || q.includes("work")) {
      return "To place a bid: \n1. Go to 'Browse Jobs' and click on a job you like.\n2. In the job details, enter your bid amount, write a friendly proposal message, and choose your delivery time.\n3. Click 'Place Bid'. The job poster will be notified instantly! 🔔";
    }
    
    if (q.includes("escrow") || q.includes("payment") || q.includes("pay") || q.includes("fee") || q.includes("commission")) {
      return "Tasskly uses a secure Escrow System:\n1. When an employer accepts a bid, they pay the amount to the platform.\n2. Tasskly holds this payment safely in escrow.\n3. The platform keeps a 10% fee and holds the rest (90%) for the worker.\n4. Once the worker submits the task and it is verified, the admin releases the escrow funds directly to the worker's wallet.";
    }

    if (q.includes("withdraw") || q.includes("wallet") || q.includes("upi") || q.includes("bank") || q.includes("transfer") || q.includes("money")) {
      return "To request a withdrawal:\n1. Go to your Profile Dashboard and add your UPI ID and Bank Account details.\n2. Once verified, go to 'Earnings' tab and click 'Request Payout'.\n3. The admin will review and process the transfer to your account within 24 hours. 💸";
    }

    if (q.includes("level") || q.includes("tier") || q.includes("expert") || q.includes("elite")) {
      return "Tasskly has 3 worker levels based on your performance:\n- **Level 1 (Starter)**: 70% payout, 30% platform fee.\n- **Level 2 (Expert)**: 80% payout (Requires 10 completed jobs).\n- **Level 3 (Elite)**: 90% payout (Requires 25 completed jobs historically). Higher levels get priority matching and reduced fees!";
    }

    if (q.includes("urgent") || q.includes("quick") || q.includes("time") || q.includes("10 min")) {
      return "Look out for special tags on job cards:\n- ⚡ **10 Min Task**: Quick tasks you can finish immediately.\n- 🚨 **Urgent**: Needs completion on a short timeline.\n- 🎓 **Campus Only**: Restricts applications to students inside that specific campus.";
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greet")) {
      return "Hello! How can I help you today? You can ask me about placing bids, payment flows, levels, or withdraw processes. 😊";
    }

    return "I understand your doubt. Tasskly is a secure student marketplace. You can search jobs, place bids, upload deliverables, and get paid securely. If you have any specific query about escrow payments, bids, or withdrawals, let me know!";
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const responseText = getAIResponse(textToSend);
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
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
              <MessageSquare className="h-6 w-6" />
              {/* Soft pulsing notification dot */}
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-bounce">
                AI
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
                  <p className="text-[10px] text-indigo-100 font-medium">Ready to clear your doubts • Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
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
                      {msg.text}
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
