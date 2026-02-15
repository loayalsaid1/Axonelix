
import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_QUESTIONS } from '../constants.tsx';
// import { askMedicalTutor } from '../services/gemini.ts';

export const QBank: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [struckOptions, setStruckOptions] = useState<Set<string>>(new Set());
  const [isMarked, setIsMarked] = useState(false);
  const [aiTutorResponse, setAiTutorResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isSIUnits, setIsSIUnits] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentIdx] || MOCK_QUESTIONS[0];

  useEffect(() => {
    setSelectedOption(null);
    setStruckOptions(new Set());
    setAiTutorResponse(null);
    setIsMarked(false);
  }, [currentIdx]);

  const toggleStrike = (id: string) => {
    setStruckOptions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = useCallback(() => {
    if (selectedOption) {
      setAnsweredQuestions(prev => new Set(prev).add(currentIdx));
    }
    if (currentIdx < MOCK_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentIdx, selectedOption]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  }, [currentIdx]);

  // Keyboard Shortcuts Implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigation
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      
      // Marking
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMarked(prev => !prev);
      }

      // Selection (1-4 for A-D)
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= 4) {
        const optionId = String.fromCharCode(96 + numKey); // 1->a, 2->b...
        if (!struckOptions.has(optionId)) {
          setSelectedOption(optionId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, struckOptions]);

  const handleAskAi = async () => {
    setIsAiLoading(true);
    // setAiTutorResponse(null);
    // const resp = await askMedicalTutor(currentQuestion.stem, "Explain the logic for the correct answer and why others are wrong.");
    // setAiTutorResponse(resp || null);
    // setIsAiLoading(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-background-dark">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between glass p-4 rounded-2xl border border-white/10 shadow-lg sticky top-0 z-30">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Question</span>
                <span className="font-bold text-xl">{currentIdx + 1} / {MOCK_QUESTIONS.length}</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Time</span>
                <span className="font-mono text-xl font-medium">48:22</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setIsMarked(!isMarked)}
                title="Alt + M"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isMarked ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20' : 'border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'}`}
               >
                <span className="material-icons-round text-lg">{isMarked ? 'flag' : 'outlined_flag'}</span>
                {isMarked ? 'Marked' : 'Mark'}
              </button>
              <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-all">End Test</button>
            </div>
          </div>

          {/* Question Card */}
          <article className="bg-white dark:bg-[#16222e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Clinical Scenario #{currentQuestion.id}</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {29402 + currentIdx}</span>
                  </div>
                </div>
                <p className="text-lg leading-relaxed font-medium text-slate-800 dark:text-slate-100">
                  {currentQuestion.stem}
                </p>
              </div>

              {/* Lab Values Table */}
              {currentQuestion.labData && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                   <div className="px-4 py-3 bg-slate-100/50 dark:bg-primary/5 border-b border-slate-200 dark:border-primary/10 flex items-center justify-between">
                     <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Laboratory Data</h4>
                     <button 
                        onClick={() => setIsSIUnits(!isSIUnits)}
                        className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                      >
                       <span className="material-icons-round text-sm">swap_horiz</span>
                       {isSIUnits ? 'Switch to Conventional' : 'Switch to SI Units'}
                     </button>
                   </div>
                   <table className="w-full text-sm">
                     <tbody className="divide-y divide-slate-200 dark:divide-primary/5">
                       {currentQuestion.labData.map((lab, idx) => (
                         <tr key={idx} className="hover:bg-primary/5 transition-colors">
                           <td className="p-4 text-slate-600 dark:text-slate-400">{lab.parameter}</td>
                           <td className={`p-4 font-bold ${lab.isAbnormal ? 'text-red-500' : ''}`}>{lab.result}</td>
                           <td className="p-4 text-slate-400 dark:text-slate-500 italic text-xs">{lab.referenceRange}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {currentQuestion.leadIn}
                </h3>
              </div>
            </div>

            {/* Options */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-8 pt-0 space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={option.id} className="flex gap-3 group">
                  <button 
                    onClick={() => !struckOptions.has(option.id) && setSelectedOption(option.id)}
                    className={`flex-1 flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${
                      selectedOption === option.id 
                      ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-md' 
                      : struckOptions.has(option.id) 
                        ? 'opacity-40 border-slate-200 dark:border-slate-800 grayscale cursor-not-allowed scale-[0.98]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16222e] hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                      selectedOption === option.id ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}>
                      {option.label}
                    </div>
                    <span className={`flex-1 font-medium text-slate-700 dark:text-slate-200 ${struckOptions.has(option.id) ? 'line-through' : ''}`}>
                      {option.text}
                    </span>
                  </button>
                  <button 
                    onClick={() => toggleStrike(option.id)}
                    title="Alt + S"
                    className={`w-12 h-auto flex items-center justify-center rounded-xl border transition-colors ${
                      struckOptions.has(option.id) ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-500'
                    }`}
                  >
                    <span className="material-icons-round text-lg">strikethrough_s</span>
                  </button>
                </div>
              ))}
            </div>

            {/* AI Tutor Toggle */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <button 
                onClick={handleAskAi}
                disabled={isAiLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {isAiLoading ? (
                  <span className="animate-spin material-icons-round">settings</span>
                ) : (
                  <span className="material-icons-round animate-pulse">auto_awesome</span>
                )}
                {isAiLoading ? 'Synthesizing Clinical Knowledge...' : 'Ask AI Tutor for High-Yield Explanation'}
              </button>

              {aiTutorResponse && (
                <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-[#1a2a3a] border border-primary/20 shadow-inner animate-in slide-in-from-bottom-2 duration-500">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                       <span className="material-icons-round text-primary text-sm">psychology</span>
                     </div>
                     <span className="text-xs font-bold text-primary uppercase tracking-widest">Tutor Insight</span>
                   </div>
                   <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium whitespace-pre-wrap">{aiTutorResponse}</p>
                </div>
              )}
            </div>
          </article>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between py-6">
            <button 
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="group flex items-center gap-2 px-8 py-3 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-30"
            >
              <span className="material-icons-round group-hover:-translate-x-1 transition-transform">arrow_back</span> Previous
            </button>
            <div className="hidden md:flex gap-4">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">Alt</kbd>
                  <span>+</span>
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">S</kbd>
                  <span className="ml-1">Strike</span>
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">1-4</kbd>
                  <span className="ml-1">Select</span>
               </div>
            </div>
            <button 
                onClick={handleNext}
                className="group flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {currentIdx === MOCK_QUESTIONS.length - 1 ? 'Complete Block' : 'Next Question'} 
              <span className="material-icons-round group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Side Map */}
      <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16222e]/50 hidden xl:flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-6 flex items-center justify-between text-slate-500">
            Block Progress
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Math.round((answeredQuestions.size / MOCK_QUESTIONS.length) * 100)}%</span>
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {MOCK_QUESTIONS.map((q, i) => {
              const num = i + 1;
              const isActive = i === currentIdx;
              const isAnswered = answeredQuestions.has(i);
              return (
                <button 
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    isActive ? 'bg-primary text-white scale-110 shadow-lg ring-4 ring-primary/20' :
                    isAnswered ? 'bg-primary/10 border-2 border-primary/40 text-primary' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-end gap-4">
           <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase mb-1">Session Tip</p>
              <p className="text-xs text-slate-500 leading-relaxed italic">"Always read the last sentence (the lead-in) first to orient your clinical reasoning."</p>
           </div>
           <button className="w-full py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
             Save and Exit
           </button>
        </div>
      </aside>
    </div>
  );
};
