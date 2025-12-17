import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Play, AlertCircle, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

interface TerminalProps {
  value: string;
  onChange: (val: string) => void;
  onExecute: (command: string) => void;
  onStageAssets: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ value, onChange, onExecute, onStageAssets }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onExecute(value);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 border border-slate-700 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm relative"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
            <TerminalIcon size={12} />
            <span>aura-ddex-cli — v4.3.1-beta</span>
          </div>
          <div className="text-xs text-slate-500">BASH</div>
        </div>

        {/* Terminal Body */}
        <div 
          className="p-6 font-mono text-sm md:text-base relative min-h-[400px]"
          onClick={() => textareaRef.current?.focus()}
        >
           <div className="text-slate-400 mb-4">
             <span className="text-green-400">user@aura-sys</span>:<span className="text-blue-400">~/workspace/distribution</span>$
           </div>
           
           <textarea
             ref={textareaRef}
             value={value}
             onChange={(e) => onChange(e.target.value)}
             onKeyDown={handleKeyDown}
             onFocus={() => setIsFocused(true)}
             onBlur={() => setIsFocused(false)}
             className="w-full bg-transparent border-none outline-none resize-none text-cyan-300 placeholder-slate-600 font-mono leading-relaxed"
             spellCheck={false}
           />
           
           {/* Blinking Cursor */}
           {isFocused && (
             <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ repeat: Infinity, duration: 0.8 }}
               className="inline-block w-2.5 h-5 bg-cyan-400 ml-1 align-middle"
             />
           )}
        </div>

        {/* Footer / Hints */}
        <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
           <div className="flex items-center space-x-4">
              <span className="flex items-center"><AlertCircle size={12} className="mr-1 text-yellow-500"/> DDEX Profile Check: OK</span>
              <span className="flex items-center"><AlertCircle size={12} className="mr-1 text-green-500"/> Network: SECURE</span>
           </div>
           
           <div className="flex space-x-3">
             <button 
               onClick={onStageAssets}
               className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors border border-slate-600"
             >
               <UploadCloud size={14} />
               <span>STAGE_ASSETS</span>
             </button>
             <button 
               onClick={() => onExecute(value)}
               className="flex items-center space-x-2 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 px-3 py-1 rounded transition-colors border border-cyan-800"
             >
               <span>EXECUTE_PIPELINE</span>
               <Play size={14} />
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Terminal;