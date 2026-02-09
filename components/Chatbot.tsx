
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SimulationResult, UserInput, SavedSimulation } from '../types';
import { CHATBOT_INSTRUCTION } from '../constants';

interface ChatbotProps {
  currentResult: SimulationResult | null;
  userInput: UserInput;
  history: SavedSimulation[];
  theme: 'light' | 'dark';
}

const STORAGE_KEY = 'aura_chat_history';
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Chatbot = forwardRef((props: ChatbotProps, ref) => {
  const { currentResult, userInput, history, theme } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as { role: 'user' | 'model'; text: string }[] : [
      { role: 'model', text: "Hi! I'm Aura, your life drafting buddy. 💖 I've peeked into your archive and I'm ready to help you chat through your latest simulation or any big decision on your mind. How can I help you today? ✨" }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    toggleChat: () => setIsOpen(prev => !prev)
  }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    const initChat = () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const historyContext = history.length > 0 
        ? `PAST JOURNEYS IN ARCHIVE: ${history.map(h => h.input.decision).join(', ')}`
        : "No previous history.";

      const simulationDataContext = currentResult 
        ? `\n\nCURRENT SIMULATION DATA (FOR EXPLANATION): \n${JSON.stringify(currentResult)}`
        : "\n\nNo active simulation data is available to discuss.";

      const systemContext = `${CHATBOT_INSTRUCTION}

      USER'S CONTEXT:
      Current Decision: ${userInput.decision}
      Current Context: ${userInput.situation}
      Historical Context: ${historyContext}
      ${simulationDataContext}`;
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: systemContext,
        },
      });
      setChatSession(chat);
    };

    initChat();
  }, [currentResult, userInput, history]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading || !chatSession) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm thinking... but the signal's a bit fuzzy! 💖" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Hmm, the simulation hit a little bump. Let's try that again! ✨" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const renderText = (text: string) => {
    return text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-pink-600 dark:text-cyan-300 font-extrabold">{part}</strong> : part);
  };

  const toggleSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end">
      {isOpen && (
        <div className={`mb-6 transition-all duration-500 ease-in-out rounded-[32px] flex flex-col overflow-hidden shadow-2xl border-2 backdrop-blur-3xl glass-card ${
          theme === 'dark' ? 'border-pink-500/30 shadow-pink-500/10' : 'border-pink-100'
        } animate-in slide-in-from-bottom-8 ${
          isExpanded ? 'w-[90vw] sm:w-[60vw] h-[80vh]' : 'w-[320px] sm:w-[380px] h-[45vh] sm:h-[55vh]'
        }`}>
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-feather-pointed text-white text-sm"></i>
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-white leading-none">Aura Advisor</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest">Memory Active ✨</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={toggleSize} className="w-9 h-9 flex items-center justify-center text-pink-400 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-full transition-all">
                <i className={`fa-solid ${isExpanded ? 'fa-compress-arrows-alt' : 'fa-expand'} text-sm`}></i>
              </button>
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 flex items-center justify-center text-pink-400 hover:text-pink-600 dark:hover:text-white rounded-full transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
          </div>
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-pink-500/5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[24px] text-[13px] font-bold leading-relaxed shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-none' 
                    : theme === 'dark' ? 'bg-slate-800 text-slate-100 border border-white/10 rounded-bl-none' : 'bg-white text-slate-800 border border-pink-50 rounded-bl-none'
                }`}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-[24px] rounded-bl-none bg-slate-100 dark:bg-white/10 flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme === 'dark' ? 'border-white/10 bg-slate-900/60' : 'bg-white'}`}>
            <div className="relative flex gap-2">
              <div className="relative flex-grow">
                <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Brainstorm with Aura... ✨" 
                    className={`w-full pl-6 pr-12 py-3 rounded-full bg-transparent border-2 outline-none transition-all text-xs font-bold ${
                        isListening 
                            ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]' 
                            : (theme === 'dark' ? 'border-white/10 focus:border-pink-500 text-white placeholder:text-slate-500' : 'border-pink-100 focus:border-pink-500 placeholder:text-slate-400')
                    }`}
                />
                <button type="button" onClick={toggleListen} className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-pink-500 text-white animate-pulse' : 'text-slate-400 hover:text-pink-500'}`}><i className={`fa-solid ${isListening ? 'fa-microphone' : 'fa-microphone-slash'}`}></i></button>
              </div>
              <button type="submit" disabled={!inputText.trim() || isLoading} className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 text-white flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:grayscale"><i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i></button>
            </div>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} aria-label="Talk to Aura" className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(236,72,153,0.4)] transition-all hover:scale-110 active:scale-90 group relative ${isOpen ? 'bg-[#0f172a] rotate-90 shadow-none' : 'bg-gradient-to-tr from-pink-500 to-cyan-500'}`}>
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-comment-dots'} text-2xl text-white`}></i>
        {!isOpen && <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 border-4 border-white dark:border-[#02041a] rounded-full animate-bounce shadow-lg flex items-center justify-center"><span className="text-[10px]">✨</span></span>}
      </button>
    </div>
  );
});

export default Chatbot;
