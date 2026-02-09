
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SimulationResult, UserInput } from '../types';
import { FUTURE_REFLECTION_INSTRUCTION } from '../constants';
import { generateVoiceDirective, playPCM } from '../services/geminiService';

interface FutureReflectionProps {
  result: SimulationResult;
  input: UserInput;
  theme: 'light' | 'dark';
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const FutureReflection: React.FC<FutureReflectionProps> = ({ result, input, theme }) => {
  const storageKey = `aura_reflection_v1_${btoa(input.decision).slice(0, 12)}`;

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) as { role: 'user' | 'model'; text: string }[] : [];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [hasStarted, setHasStarted] = useState(() => messages.length > 0);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const audioControllerRef = useRef<{ stop: () => void } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (hasStarted && !chatSession) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `
        PATH CHOSEN: ${input.decision}
        CORE DRIVERS: ${input.values.join(', ')}
        5-YEAR OUTCOME SUMMARY: ${result.trajectory[result.trajectory.length - 1]?.milestone || 'Integration'}
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: FUTURE_REFLECTION_INSTRUCTION + "\n\nBACKGROUND CONTEXT OF THIS TIMELINE:\n" + context,
        },
      });
      setChatSession(chat);
    }
  }, [hasStarted, chatSession, input.decision, input.values, result.trajectory]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  useEffect(() => {
    if (SpeechRecognition && isVoiceMode) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Set to false for single, distinct inputs
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInterimText(interimTranscript);

        if (finalTranscript) {
          handleSend(undefined, finalTranscript.trim());
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'no-speech') {
          setSpeechError("I didn't catch that. Could you try again?");
        } else if (event.error === 'network') {
          setSpeechError("My connection is a bit fuzzy. Please check yours.");
        } else {
          setSpeechError("Hmm, my ears are ringing. Let's try that again.");
        }
        setTimeout(() => setSpeechError(null), 3000);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      
      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }
    
    return () => {
      recognitionRef.current?.stop();
    };
  }, [isVoiceMode, isListening]);

  const speakMessage = async (text: string) => {
    if (audioControllerRef.current) audioControllerRef.current.stop();
    setIsReadingAloud(true);
    try {
      const voiceBase64 = await generateVoiceDirective(text);
      const ctrl = await playPCM(voiceBase64, () => {
        setIsReadingAloud(false);
      });
      if (ctrl) audioControllerRef.current = ctrl;
    } catch (err) {
      console.error("Voice Error:", err);
      setIsReadingAloud(false);
    }
  };

  const startReflection = async () => {
    setHasStarted(true);
    if (messages.length === 0) {
      const greeting = "Perspective synchronized. I am a reflection of the you that chose this road. Five years have shaped me. What part of our future together would you like to explore? ✨";
      setMessages([{ role: 'model', text: greeting }]);
      if (isVoiceMode) speakMessage(greeting);
    }
  };

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const text = overrideText || inputText.trim();
    if (!text || isLoading || !chatSession) return;

    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');
    setInterimText('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: text });
      const modelText = response.text || "The resonance is fading... could you try again? 🌿";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      if (isVoiceMode) speakMessage(modelText);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "The temporal link is unstable. One more time? 💫" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    if (isReadingAloud && audioControllerRef.current) {
      audioControllerRef.current.stop();
      setIsReadingAloud(false);
    }
    setIsListening(prev => !prev);
  };

  const ConsciousnessOrb = () => (
    <div className="relative w-72 h-72 flex items-center justify-center scale-110">
      <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-700 ${
        isReadingAloud ? 'bg-pink-500/50 scale-125' : 
        isListening ? 'bg-cyan-400/40 scale-150' : 'bg-indigo-900/20 scale-100'
      }`}></div>
      
      <div className={`absolute inset-[-10px] border border-white/10 rounded-full animate-spin-slow opacity-30 ${isReadingAloud ? 'border-pink-500/40' : ''}`}></div>
      
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 filter drop-shadow-[0_0_30px_rgba(236,72,153,0.4)]">
        <defs>
          <linearGradient id="futureOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0080" />
            <stop offset="100%" stopColor="#00f2ff" />
          </linearGradient>
        </defs>
        
        {(isReadingAloud || isListening) && [1, 2, 3].map((i) => (
          <circle 
            key={`wave-${i}`} cx="100" cy="100" r="40"
            fill="none" stroke="url(#futureOrbGrad)" strokeWidth="0.5" className="opacity-40"
            style={{ 
                animation: `radiate ${1.5 + i}s infinite linear`, 
                animationDelay: `${i * 0.3}s`,
                transformOrigin: 'center'
            }}
          />
        ))}

        <circle 
          cx="100" cy="100" r={isReadingAloud ? 55 : isListening ? 60 : 50} 
          fill="url(#futureOrbGrad)" 
          className={`transition-all duration-500 ease-in-out ${isReadingAloud ? 'scale-110' : ''}`}
        />
        <circle cx="100" cy="100" r="15" fill="white" className="opacity-30 blur-md animate-pulse" />
      </svg>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radiate {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(2.5); opacity: 0; }
        }
      `}} />
    </div>
  );

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
        <div className="p-16 rounded-[80px] border border-slate-200 dark:border-white/10 glass-card text-center max-w-2xl shadow-3xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 mx-auto mb-10 flex items-center justify-center text-white shadow-2xl floating">
            <i className="fa-solid fa-user-astronaut text-4xl"></i>
          </div>
          <h3 className="text-4xl font-black italic mb-6 dark:text-white">Meet Your Future Self</h3>
          <p className="text-lg font-bold opacity-60 leading-relaxed mb-12 dark:text-slate-300 italic">
            Reach forward to a version of you from five years in the future.
          </p>
          <button 
            onClick={startReflection}
            className="px-16 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Open Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-[980px] mx-auto">
      <div className="text-center mb-12">
          <h4 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 text-slate-900 dark:text-white leading-none">The Future Reflection</h4>
          <p className="max-w-3xl mx-auto text-lg font-bold opacity-60 italic leading-relaxed text-slate-600 dark:text-slate-300">
            A dialogue with a possible future version of you. 
          </p>
      </div>

      <div className={`rounded-[64px] border-4 border-white dark:border-white/10 glass-card overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-700 relative h-[69vh] min-h-[600px] ${isVoiceMode ? 'bg-slate-950 text-white' : ''}`}>
        
        <div className="absolute top-8 left-8 z-50 flex gap-2">
          <button 
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border shadow-xl ${
              isVoiceMode ? 'bg-pink-500 border-pink-400 text-white' : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <i className={`fa-solid ${isVoiceMode ? 'fa-microphone' : 'fa-keyboard'}`}></i>
            {isVoiceMode ? 'Voice Mode Active' : 'Switch to Voice Chat'}
          </button>
        </div>

        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden ${
          isVoiceMode ? 'w-full md:w-[23%] h-[350px] md:h-full border-b md:border-b-0 md:border-r border-white/10' : 'hidden md:flex md:w-[23%] border-r border-white/5'
        }`}>
          <ConsciousnessOrb />
          <div className="mt-8 text-center px-8 relative z-20">
              <h4 className="font-black text-sm uppercase tracking-[0.4em] text-indigo-400 mb-2">TEMPORAL LINK</h4>
              <p className="text-[9px] font-bold opacity-40 italic tracking-widest uppercase">
                {isReadingAloud ? 'Syncing frequency...' : isListening ? 'Capturing present voice...' : 'Frequency Stable'}
              </p>
          </div>
        </div>

        <div className={`flex flex-col min-h-0 transition-all duration-700 ${
          isVoiceMode ? 'w-full md:w-[77%]' : 'w-full md:w-[77%]'
        }`}>
            <div ref={scrollRef} className="flex-grow p-6 md:p-12 overflow-y-auto space-y-10 scrollbar-hide scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[80%] p-6 md:p-8 rounded-[40px] text-[15px] md:text-[17px] font-bold leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' 
                      : isVoiceMode ? 'bg-white/10 text-white border border-white/10 rounded-bl-none backdrop-blur-md' : 'bg-white dark:bg-[#0c0e2b] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-bl-none shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {interimText && (
                <div className="flex justify-end opacity-50 italic">
                   <div className="max-w-[80%] p-6 md:p-8 rounded-[40px] rounded-br-none bg-indigo-500/10 text-indigo-400 text-sm font-bold">
                     {interimText}...
                   </div>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-6 rounded-[24px] bg-white/10 flex gap-1.5 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>
            {speechError && (
              <div className="px-12 pb-2 text-center text-rose-500 text-xs font-bold animate-in fade-in">
                {speechError}
              </div>
            )}
            <div className="p-8 md:p-12 bg-white/5 backdrop-blur-3xl border-t border-white/10">
              {isVoiceMode ? (
                <div className="flex flex-col items-center justify-center py-6">
                   <div className="relative">
                      <button 
                        onClick={toggleListen}
                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl relative z-20 ${
                          isListening ? 'bg-pink-500 scale-110 shadow-pink-500/40 animate-pulse' : 'bg-indigo-600 hover:scale-105'
                        }`}
                      >
                        <i className={`fa-solid ${isListening ? 'fa-microphone' : 'fa-microphone-slash'} text-4xl text-white`}></i>
                      </button>
                   </div>
                   <p className="mt-10 text-[11px] font-black uppercase tracking-[0.3em] opacity-40">
                     {isListening ? 'Synchronizing voice...' : 'Tap to synchronize voice'}
                   </p>
                </div>
              ) : (
                <form onSubmit={handleSend} className="relative max-w-5xl mx-auto">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Talk to your possible future self..." 
                    className="w-full pl-10 pr-36 py-8 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-transparent focus:border-indigo-500 outline-none transition-all text-base font-bold shadow-inner dark:text-white"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    <button 
                      type="submit"
                      disabled={!inputText.trim() || isLoading}
                      className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                    >
                      <i className="fa-solid fa-paper-plane text-base"></i>
                    </button>
                  </div>
                </form>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FutureReflection;
