
import React, { useState, useEffect, useRef } from 'react';
import { UserInput, SimulationResult, FinalDirective, ReasoningArtifacts, FollowUp, SavedSimulation } from './types';
import { CORE_VALUES } from './constants';
import { interpretDecision, simulateScenarios, synthesizeDirective, generateVisionBoard, generateVoiceDirective, playPCM } from './services/geminiService';
import StrategicDashboard from './components/StrategicDashboard';
import OutcomeTree from './components/OutcomeTree';
import Chatbot from './components/Chatbot';
import TrajectoryTimeline from './components/TrajectoryTimeline';
import RegretPredictor from './components/RegretPredictor';
import InactionView from './components/InactionView';
import FutureReflection from './components/FutureReflection';
import FollowUpAgent from './components/FollowUpAgent';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'strategy' | 'ripple' | 'risk' | 'inaction' | 'decisions' | 'futureSelf'>('strategy');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<{ message: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Multimodal Context
  const [situationImage, setSituationImage] = useState<string | null>(null);
  const [pivotImage, setPivotImage] = useState<string | null>(null);

  const [input, setInput] = useState<UserInput>({
    situation: '',
    decision: '',
    values: [],
    goals: '',
    fears: '',
    constraints: ''
  });
  
  const [reasoning, setReasoning] = useState<ReasoningArtifacts | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, 'yes' | 'no'>>({});
  const [directive, setDirective] = useState<FinalDirective | null>(null);
  const [vaults, setVaults] = useState<SavedSimulation[]>([]);
  const [showVaults, setShowVaults] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  // Voice & Input Control
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioCtl = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTarget = useRef<'situation' | 'pivot'>('situation');

  useEffect(() => {
    const savedVaults = localStorage.getItem('lifedraft_vaults');
    if (savedVaults) setVaults(JSON.parse(savedVaults));
    
    const savedFollows = localStorage.getItem('lifedraft_follows');
    if (savedFollows) setFollowUps(JSON.parse(savedFollows));

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (recordingField) {
          setInput(prev => ({
            ...prev,
            [recordingField]: (prev[recordingField as keyof UserInput] || '') + (prev[recordingField as keyof UserInput] ? ' ' : '') + transcript
          }));
        }
        setRecordingField(null);
      };
      recognitionRef.current.onerror = () => setRecordingField(null);
      recognitionRef.current.onend = () => setRecordingField(null);
    }
  }, [recordingField]);

  const toggleListen = (field: keyof UserInput) => {
    if (recordingField === field) {
      recognitionRef.current?.stop();
      setRecordingField(null);
    } else {
      setRecordingField(field);
      recognitionRef.current?.start();
    }
  };

  const triggerUpload = (target: 'situation' | 'pivot') => {
    currentUploadTarget.current = target;
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (currentUploadTarget.current === 'situation') {
          setSituationImage(base64);
        } else {
          setPivotImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterpreterCall = async (nextStep: number) => {
    if (!input.situation.trim() || !input.decision.trim()) {
      setError({ message: "Please share your current situation and the decision you're drafting. ✨" });
      return;
    }

    setLoading(true);
    setLoadingStep("Aura is interpreting your context...");
    try {
      const activeImages = [];
      if (situationImage) activeImages.push(situationImage);
      if (pivotImage) activeImages.push(pivotImage);
      const art = await interpretDecision(input, activeImages, [], reasoning || undefined);
      setReasoning(art);
      setStep(nextStep);
      setError(null);
    } catch (err) {
      setError({ message: "Context mapping failed. Let's try again. 💖" });
    } finally {
      setLoading(false);
    }
  };

  const handleNextToStep3 = () => {
    if (!input.goals?.trim() || !input.fears?.trim() || !input.constraints?.trim()) {
        setError({ message: "Please share your goals, fears, and constraints. 🌟" });
        return;
    }
    setError(null);
    setStep(3);
  };

  const handleSimulateCall = async () => {
    if (!reasoning) return;
    if (input.values.length !== 5) {
      setError({ message: "Please select exactly 5 life drivers to anchor your future. 🌿" });
      return;
    }

    setLoading(true);
    setLoadingStep("Forecasting probabilistic futures...");
    try {
      const activeImages = [];
      if (situationImage) activeImages.push(situationImage);
      if (pivotImage) activeImages.push(pivotImage);
      const sim = await simulateScenarios(reasoning, input.values, activeImages);
      
      // CALL #2.5: Vision Board Generation
      setLoadingStep("Aura is visualizing your optimal destiny...");
      const visionUrl = await generateVisionBoard(sim.outcomes.mostLikely.title, sim.summary);
      sim.visionBoardUrl = visionUrl;
      
      setResult(sim);
      setStep(4);
      setError(null);
    } catch (err) {
      setError({ message: "Simulation error. Check your connection. 💖" });
    } finally {
      setLoading(false);
    }
  };

  const handleSynthesize = async () => {
    if (!result) return;
    if (directive) {
      setStep(5);
      return;
    }
    setLoading(true);
    setLoadingStep("Aura is synthesizing final counsel...");
    try {
      const dir = await synthesizeDirective(input, result.crossroads, answers, reasoning || undefined);
      setDirective(dir);
      setStep(5);
      setError(null);
    } catch (err) {
      setError({ message: "Synthesis error. Let's try once more. ✨" });
    } finally {
      setLoading(false);
    }
  };

  const handleStoreConsultation = () => {
    if (!result) return;
    
    // Check for duplicates
    const isDuplicate = vaults.some(v => 
      v.input.decision === input.decision && 
      v.input.situation === input.situation
    );

    if (isDuplicate) {
      alert("This consultation is already stored in your memory vault. ✨");
      return;
    }

    const newVault = [...vaults, { id: `v_${Date.now()}`, timestamp: Date.now(), input, result }];
    setVaults(newVault);
    localStorage.setItem('lifedraft_vaults', JSON.stringify(newVault));
    alert("Consultation stored in memory vault. 💖");
  };

  const handlePlayAdvice = async () => {
    if (isSpeaking && audioCtl.current) {
      audioCtl.current.stop();
      setIsSpeaking(false);
      return;
    }
    if (!directive) return;
    setIsSpeaking(true);
    const audioData = await generateVoiceDirective(directive.finalVerdict);
    const controller = await playPCM(audioData, () => setIsSpeaking(false));
    if (controller) audioCtl.current = controller;
  };

  const handleExportPDF = () => {
    const element = document.getElementById('export-content');
    if (!element) {
      alert("No report content available to export.");
      return;
    }
    
    const opt = {
      margin: 10,
      filename: `LifeDraft_Report_${input.decision.slice(0, 20).replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    (window as any).html2pdf().from(element).set(opt).save();
  };

  const reset = (shouldStart: boolean = false) => {
    setStep(1); 
    setIsStarted(shouldStart); 
    setResult(null); 
    setDirective(null); 
    setSituationImage(null);
    setPivotImage(null);
    setInput({ situation: '', decision: '', values: [], goals: '', fears: '', constraints: '' });
    setError(null);
  };

  const Stepper = ({ current }: { current: number }) => (
    <div className="flex items-center justify-center max-sm mx-auto mb-16 px-4">
      {[1, 2, 3, 4, 5].map((s, idx) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
            current === s ? 'bg-[#0c0e2b] text-white ring-4 ring-pink-100' : 
            current > s ? 'bg-pink-500 text-white' : 'bg-white border border-slate-200 text-slate-400'
          }`}>
            {current > s ? <i className="fa-solid fa-check"></i> : s}
          </div>
          {idx < 4 && <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-700 ${current > s ? 'bg-pink-500' : 'bg-slate-100'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-1000 ${theme === 'dark' ? 'bg-[#02041a] text-slate-100' : 'light-mesh text-slate-900'}`}>
      <nav className="sticky top-0 z-[100] px-6 md:px-12 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => reset(false)}>
          <div className="w-8 h-8 bg-[#ff1088] rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-feather-pointed text-white text-xs"></i>
          </div>
          <h1 className="text-lg font-black tracking-tighter">LifeDraft<span className="text-[#ff1088]">.</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Memory Sync Active
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={!result}
            className="px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-file-pdf text-rose-500"></i> Export PDF
          </button>
          <button onClick={() => setShowVaults(true)} className="px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest bg-[#0c0e2b] text-white">Archive ({vaults.length})</button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-5 py-12">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />

        {!isStarted && (
          <div className="animate-in fade-in duration-1000 min-h-[80vh] flex flex-col justify-center">
            {/* HERO Stick to left with 70% content width feel */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 w-full">
               <div className="flex-1 text-left max-w-[70%] mr-auto">
                  <div className="relative inline-block mb-12">
                    <h1 className="text-[100px] md:text-[140px] font-black tracking-tighter leading-[0.8] text-[#0c0e2b] uppercase">
                      LIFE<br/>DRAFTING<span className="text-[#ff1088]">.</span>
                    </h1>
                    <div className="absolute -bottom-2 left-0 w-12 h-12 bg-[#ff1088] transform translate-y-1/2"></div>
                  </div>
                  
                  <div className="border-l-[8px] border-[#0c0e2b] pl-10 mb-12">
                    <p className="text-2xl md:text-3xl font-black tracking-tight text-[#0c0e2b] leading-none whitespace-nowrap">
                      Think through life — before you live it.
                    </p>
                  </div>

                  <p className="max-w-2xl text-xl md:text-2xl font-bold text-[#0c0e2b]/50 mb-16 leading-relaxed">
                    Decisions before you take them. Helping you explore possible futures, understand trade-offs, and reflect clearly — <span className="text-[#ff1088] italic font-extrabold">without telling you what to do.</span>
                  </p>

                  <div className="flex flex-col gap-12">
                    <div className="flex items-stretch h-24 max-w-sm">
                      <button onClick={() => setIsStarted(true)} className="flex-grow px-12 bg-[#e8e9ff]/50 border-[3px] border-[#0c0e2b] border-r-0 text-[#0c0e2b] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-[#ff1088] hover:text-white transition-all">
                        START A NEW DECISION
                      </button>
                      <button onClick={() => setIsStarted(true)} className="w-24 bg-[#0c0e2b] flex items-center justify-center text-white border-[3px] border-[#0c0e2b] hover:bg-[#ff1088] hover:border-[#ff1088] transition-all">
                        <i className="fa-solid fa-arrow-right text-2xl"></i>
                      </button>
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0c0e2b]/20">
                      CAREER, RELATIONSHIPS, EDUCATION — TAKE IT STEP BY STEP.
                    </p>
                  </div>
               </div>

               <div className="flex-1 flex justify-center relative">
                  <div className="relative w-[450px] h-[450px] md:w-[600px] md:h-[600px] flex items-center justify-center">
                    {/* Glowing Aura Background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#ff1088]/20 via-purple-500/10 to-cyan-500/20 blur-[140px] rounded-full"></div>
                    
                    {/* Main Visual Orb */}
                    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] rounded-full bg-white/5 border-2 border-white/10 backdrop-blur-md flex items-center justify-center shadow-3xl">
                      <i className="fa-solid fa-feather-pointed text-[#0c0e2b]/5 text-[140px] md:text-[200px]"></i>
                    </div>

                    {/* Floating Strategy Card */}
                    <div className="absolute top-12 -right-4 w-64 p-8 glass-card rounded-[40px] shadow-2xl floating border border-white/40">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-[9px] font-black text-[#ff1088] tracking-widest uppercase">STRATEGY 01</span>
                        <i className="fa-solid fa-star text-amber-400 text-xs"></i>
                      </div>
                      <div className="space-y-3 mb-8 opacity-20">
                        <div className="h-3 w-full bg-[#0c0e2b] rounded-full"></div>
                        <div className="h-3 w-4/5 bg-[#0c0e2b] rounded-full"></div>
                      </div>
                      <div className="flex justify-between items-center pt-5 border-t border-slate-900/5">
                        <span className="text-[10px] font-black text-[#0c0e2b] tracking-widest">92% MATCH</span>
                        <i className="fa-solid fa-bolt-lightning text-cyan-400"></i>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {isStarted && step === 1 && (
          <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
             <Stepper current={1} />
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 uppercase">Current Reality</h2>
             <p className="text-lg opacity-60 font-bold mb-12 italic">Describe where you are now and the decision you're drafting.</p>
             <div className="space-y-8 text-left">
                <div className={`relative glass-card p-10 md:p-14 rounded-[56px] border-none shadow-2xl transition-all ${!input.situation && error ? 'ring-2 ring-rose-400 bg-rose-50/10' : ''}`}>
                  <textarea 
                    aria-label="Describe your current lifestyle, career, and environment"
                    value={input.situation} 
                    onChange={e => setInput(prev => ({...prev, situation: e.target.value}))} 
                    placeholder="Describe your current lifestyle, career, and environment..." 
                    className="w-full bg-transparent outline-none font-bold text-xl md:text-3xl text-slate-800 resize-none min-h-[150px]"
                  ></textarea>
                  
                  {situationImage && (
                    <div className="mt-4 flex gap-4">
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                        <img src={situationImage} className="w-full h-full object-cover" alt="Reality Context" />
                        <button onClick={() => setSituationImage(null)} className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px]"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                    </div>
                  )}

                  <div className="absolute right-8 bottom-8 flex gap-4">
                    <button onClick={() => toggleListen('situation')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${recordingField === 'situation' ? 'bg-pink-500 text-white animate-pulse' : 'bg-white shadow-xl text-slate-400'}`}><i className="fa-solid fa-microphone"></i></button>
                    <button onClick={() => triggerUpload('situation')} className="w-12 h-12 rounded-xl bg-white shadow-xl flex items-center justify-center text-slate-400 cursor-pointer"><i className="fa-solid fa-camera"></i></button>
                  </div>
                </div>
                <div className={`relative glass-card p-10 md:p-14 rounded-[56px] border-none shadow-2xl transition-all ${!input.decision && error ? 'ring-2 ring-rose-400 bg-rose-50/10' : ''}`}>
                  <textarea 
                    aria-label="What big move are you considering"
                    value={input.decision} 
                    onChange={e => setInput(prev => ({...prev, decision: e.target.value}))} 
                    placeholder="What big move are you considering?" 
                    className="w-full bg-transparent outline-none font-black italic text-xl md:text-2xl text-slate-800 resize-none"
                  ></textarea>
                  <button onClick={() => toggleListen('decision')} className={`absolute right-8 bottom-8 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${recordingField === 'decision' ? 'bg-pink-500 text-white animate-pulse' : 'bg-[#0c0e2b] text-white shadow-xl'}`}><i className="fa-solid fa-microphone"></i></button>
                </div>
             </div>
             <button onClick={() => handleInterpreterCall(2)} className="mt-12 px-16 py-6 bg-[#0c0e2b] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Next Step</button>
          </div>
        )}

        {isStarted && step === 2 && (
          <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
             <Stepper current={2} />
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 uppercase">Deep Context</h2>
             <p className="text-lg opacity-60 font-bold mb-12 italic">Blockers, goals, and constraints.</p>
             <div className="space-y-6 text-left">
                {['goals', 'fears', 'constraints'].map(field => (
                  <div key={field} className={`relative glass-card p-10 rounded-[40px] border-none shadow-xl transition-all ${!input[field as keyof UserInput] && error ? 'ring-2 ring-rose-400 bg-rose-50/10' : ''}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-4 block">{field}</span>
                    <textarea 
                      aria-label={`Enter your ${field}`}
                      value={input[field as keyof UserInput] as string} 
                      onChange={e => setInput(prev => ({...prev, [field]: e.target.value}))} 
                      placeholder={`What are your ${field}?`} 
                      className="w-full bg-transparent outline-none font-bold text-lg text-slate-800 resize-none h-24"
                    ></textarea>
                    
                    {field === 'constraints' && pivotImage && (
                      <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                        <img src={pivotImage} className="w-full h-full object-cover" alt="Constraint context" />
                      </div>
                    )}

                    <div className="absolute right-8 bottom-8 flex gap-3">
                      {field === 'constraints' && (
                        <button onClick={() => triggerUpload('pivot')} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center"><i className="fa-solid fa-camera"></i></button>
                      )}
                      <button onClick={() => toggleListen(field as keyof UserInput)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${recordingField === field ? 'bg-pink-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}><i className="fa-solid fa-microphone"></i></button>
                    </div>
                  </div>
                ))}
             </div>
             <div className="flex gap-4 justify-center mt-12">
                <button onClick={() => setStep(1)} className="px-10 py-5 bg-white border border-slate-200 rounded-full font-black text-[10px] uppercase tracking-widest">Back</button>
                <button onClick={handleNextToStep3} className="px-12 py-5 bg-[#0c0e2b] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Continue</button>
             </div>
          </div>
        )}

        {isStarted && step === 3 && (
          <div className="max-w-6xl mx-auto text-center animate-in fade-in duration-700">
             <Stepper current={3} />
             <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic mb-4 uppercase">Life Drivers</h2>
             <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40 mb-12">Ethical & Value-Based Anchoring</p>
             <p className="max-w-2xl mx-auto text-lg font-bold opacity-60 mb-16 italic">Select exactly 5 foundational principles that will anchor your decision and shape your future reality.</p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {CORE_VALUES.map(v => (
                <button 
                  key={v.label} 
                  onClick={() => setInput(prev => {
                    const exists = prev.values.includes(v.label);
                    if (!exists && prev.values.length >= 5) return prev;
                    return {
                      ...prev,
                      values: exists ? prev.values.filter(x => x !== v.label) : [...prev.values, v.label]
                    };
                  })} 
                  className={`p-10 rounded-[48px] border-2 text-center transition-all duration-300 flex flex-col items-center group ${input.values.includes(v.label) ? 'bg-pink-50 border-pink-400 scale-105 shadow-2xl' : 'bg-white/40 border-slate-100 hover:border-pink-200'}`}
                >
                   <i className={`fa-solid ${v.icon} mb-6 text-2xl text-pink-500`}></i>
                   <h3 className="font-black leading-tight text-xs uppercase tracking-widest mb-3 text-slate-900">{v.label}</h3>
                   <p className="text-[10px] font-bold opacity-40 leading-relaxed px-2">{v.description}</p>
                   {input.values.includes(v.label) && <div className="mt-4 px-3 py-1 bg-pink-500 text-white text-[9px] font-black uppercase rounded-full tracking-widest">Driver 0{input.values.indexOf(v.label) + 1}</div>}
                </button>
              ))}
             </div>

             <div className="flex flex-col gap-6 justify-center pb-20">
               <div className="text-center">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Drivers Locked: {input.values.length} / 5</p>
                 <div className="w-48 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
                   <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${(input.values.length / 5) * 100}%` }}></div>
                 </div>
               </div>
               <div className="flex gap-4 justify-center">
                 <button onClick={() => setStep(2)} className="px-10 py-5 bg-white border border-slate-200 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                   <i className="fa-solid fa-arrow-left"></i> Previous
                 </button>
                 <button onClick={handleSimulateCall} disabled={input.values.length !== 5} className="px-14 py-5 bg-[#0c0e2b] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50">
                   Map My Destiny <i className="fa-solid fa-wand-magic-sparkles text-pink-500"></i>
                 </button>
               </div>
             </div>
          </div>
        )}

        <div id="export-content">
            {isStarted && step === 4 && result && (
            <div className="animate-in fade-in duration-1000">
                <Stepper current={4} />
                <div className="text-center mb-16 relative">
                <button onClick={() => setStep(3)} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-[#0c0e2b] transition-all no-print">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h2 className="text-7xl md:text-9xl font-black tracking-tighter italic mb-8 uppercase leading-none">{result.outcomes.mostLikely.title}</h2>
                <p className="max-w-3xl mx-auto text-xl font-bold opacity-60 leading-relaxed italic">"{result.summary}"</p>
                </div>

                <div className="flex justify-center mb-16 p-2 rounded-2xl glass-card max-w-4xl mx-auto shadow-xl no-print">
                {(['strategy', 'ripple', 'risk', 'inaction', 'decisions', 'futureSelf'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-[#0c0e2b] text-white shadow-lg' : 'text-slate-400 hover:text-[#0c0e2b]'}`}>
                    <i className={`fa-solid ${tab === 'strategy' ? 'fa-chart-pie' : tab === 'ripple' ? 'fa-timeline' : tab === 'risk' ? 'fa-shield-halved' : tab === 'inaction' ? 'fa-hourglass-start' : tab === 'decisions' ? 'fa-code-branch' : 'fa-user-astronaut'}`}></i>
                    {tab}
                    </button>
                ))}
                </div>

                <div className="mt-8 mb-32">
                {activeTab === 'strategy' && <StrategicDashboard result={result} theme={theme} />}
                {activeTab === 'ripple' && <TrajectoryTimeline nodes={result.trajectory} theme={theme} />}
                {activeTab === 'risk' && <RegretPredictor analysis={result.regretAnalysis} />}
                {activeTab === 'inaction' && <InactionView scenario={result.inactionScenario} theme={theme} />}
                {activeTab === 'decisions' && (
                    <div>
                        <OutcomeTree crossroads={result.crossroads} onAnswer={(i, a) => setAnswers(p => ({...p, [i]: a}))} answers={answers} />
                        {Object.keys(answers).length >= result.crossroads.length && (
                        <div className="text-center mt-20 no-print">
                            <button 
                              onClick={handleSynthesize} 
                              className={`px-16 py-7 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform ${directive ? 'bg-[#0c0e2b]' : 'bg-pink-500'}`}
                            >
                              {directive ? 'Review Counsel' : 'Synthesize Advice'}
                            </button>
                        </div>
                        )}
                    </div>
                )}
                {activeTab === 'futureSelf' && <FutureReflection result={result} input={input} theme={theme} />}
                </div>
            </div>
            )}

            {isStarted && step === 5 && directive && (
            <div className="max-w-5xl mx-auto text-center animate-in fade-in duration-1000">
                <h2 className="text-7xl md:text-[100px] font-black italic tracking-tighter mb-4 uppercase leading-none">Aura's Advice</h2>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40 mb-16">Based on your junction responses & values</p>
                
                <button onClick={handlePlayAdvice} className={`w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center mx-auto mb-16 transition-all no-print ${isSpeaking ? 'scale-110 text-pink-500 ring-8 ring-pink-50' : 'text-slate-400 hover:text-pink-500'}`}>
                    <i className={`fa-solid ${isSpeaking ? 'fa-volume-high animate-pulse' : 'fa-volume-low'} text-2xl`}></i>
                </button>

                <h3 className="text-4xl md:text-6xl font-black italic tracking-tight leading-tight mb-20 px-8">
                "{directive.finalVerdict}"
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left mb-24">
                    <div className="space-y-6">
                    {directive.actionPlan.map((p, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 rounded-[32px] glass-card border-none shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-pink-500 text-white flex items-center justify-center font-black text-lg shadow-lg">{i+1}</div>
                            <p className="text-lg font-bold opacity-80 leading-snug">{p}</p>
                        </div>
                    ))}
                    </div>
                    <div className="p-12 relative text-right">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl"><i className="fa-solid fa-sparkles"></i></div>
                    <p className="text-3xl font-black italic text-pink-500 leading-tight">
                        "{directive.reassurance}"
                    </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 justify-center max-w-xl mx-auto pb-32 no-print">
                    <button onClick={handleStoreConsultation} className="px-10 py-5 rounded-full border-2 border-pink-500 text-pink-500 font-black text-[10px] uppercase tracking-widest hover:bg-pink-50 transition-colors flex-1">Store Consultation</button>
                    <button onClick={() => reset(false)} className="px-10 py-5 rounded-full bg-[#0c0e2b] text-white font-black text-[10px] uppercase tracking-widest flex-1 shadow-xl hover:bg-pink-600">New Consult</button>
                </div>
            </div>
            )}
        </div>
      </main>

      {loading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center">
          <div className="text-center animate-in zoom-in-95 duration-500">
             <div className="relative w-32 h-32 mb-12 mx-auto">
               <div className="absolute inset-0 bg-[#ff1088] rounded-[32px] shadow-[0_0_60px_rgba(255,16,136,0.6)] animate-spin-slow"></div>
               <div className="absolute inset-2 bg-white rounded-[24px] flex items-center justify-center shadow-inner">
                 <i className="fa-solid fa-feather-pointed text-[#ff1088] text-5xl"></i>
               </div>
               <div className="absolute inset-0 rounded-[32px] border-4 border-pink-100 opacity-20 scale-125 animate-ping"></div>
             </div>
             <h3 className="text-4xl font-black italic tracking-tighter text-[#0c0e2b] mb-4 uppercase">{loadingStep}</h3>
             <div className="flex justify-center items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-[#ff1088] animate-bounce"></span>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-[#ff1088] opacity-70">Syncing temporal reality...</p>
               <span className="w-2 h-2 rounded-full bg-[#ff1088] animate-bounce [animation-delay:0.2s]"></span>
             </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 bg-rose-500 text-white rounded-3xl font-black shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
           <i className="fa-solid fa-circle-exclamation"></i>
           <span className="text-sm font-bold tracking-tight">{error.message}</span>
           <button onClick={() => setError(null)} className="ml-2 hover:opacity-70"><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      {showVaults && (
        <div className="fixed inset-0 z-[150] bg-white/95 backdrop-blur-3xl p-6 overflow-y-auto animate-in fade-in">
          <div className="max-w-4xl mx-auto py-12">
            <div className="flex justify-between items-center mb-16">
              <h2 className="text-5xl font-black italic tracking-tighter uppercase">Memory Vault</h2>
              <button onClick={() => setShowVaults(false)} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-6">
              {vaults.length === 0 ? <p className="text-center py-20 opacity-30 text-xl font-bold uppercase tracking-widest">Vault is empty.</p> : 
                vaults.map((v, i) => (
                  <div key={i} className="p-10 rounded-[48px] glass-card shadow-lg flex flex-col md:flex-row gap-6 justify-between items-center group">
                    <div>
                      <h4 className="text-2xl font-black">{v.input.decision}</h4>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{new Date(v.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => { setInput(v.input); setResult(v.result); setStep(4); setShowVaults(false); setIsStarted(true); setError(null); }} className="px-8 py-4 bg-[#0c0e2b] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Restore</button>
                      <button onClick={() => { const n = vaults.filter((_, idx) => idx !== i); setVaults(n); localStorage.setItem('lifedraft_vaults', JSON.stringify(n)); }} className="w-12 h-12 rounded-full border border-rose-100 text-rose-300 hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <Chatbot currentResult={result} userInput={input} history={vaults} theme={theme} />
      <FollowUpAgent followUps={followUps} onCheckIn={(f) => setFollowUps(p => p.map(x => x.id === f.id ? {...x, completed: true} : x))} onDismiss={(id) => setFollowUps(p => p.filter(x => x.id !== id))} theme={theme} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
        }
      ` }} />
    </div>
  );
};

export default App;
