import React, { useEffect, useState, useRef } from 'react';
import { CommandArgs, LogEntry } from '../types';
import { motion } from 'framer-motion';

interface LoadingSequenceProps {
  args: CommandArgs;
  onComplete: () => void;
}

const LoadingSequence: React.FC<LoadingSequenceProps> = ({ args, onComplete }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = [
      { msg: `Initializing LINKZ GENERATIVE UI ENGINE...`, delay: 100 },
      { msg: `Authenticating with Gresham Protocol Nodes...`, delay: 300 },
      { msg: `Target Release ID: ${args.releaseId} (ZacDWatts)`, delay: 600 },
      { msg: `Connecting to Asset Source: ${args.assetSource.substring(0, 30)}...`, delay: 900 },
      { msg: `Validating DDEX Profile: ${args.ddexProfile}`, delay: 1200 },
      { msg: `> XML Schema Validation: PASS`, delay: 1500 },
      { msg: `> Media Manifest Check: PASS`, delay: 1800 },
      { msg: `Activating AP2 FinTech Protocol Layer...`, delay: 2400 },
      { msg: `[AP2] Hard-coding split: 70% Artist / 15% Liq / 15% Equity`, delay: 2800 },
      { msg: `Engaging IAED Semantic Audit (Nocturnal-Industrial Mode)...`, delay: 3200 },
      { msg: `> Analyzed 14 metadata fields.`, delay: 4000 },
      { msg: `> Sentiment Analysis: RESILIENT_POSITIVE`, delay: 4200 },
      { msg: `Committing to RDR/SRM modules...`, delay: 4800 },
      { msg: `Generating Smart Waterfall Schedule (Strategy: ${args.scheduleStrategy})...`, delay: 5500 },
      { msg: `E2E Scope: ${args.e2eScope} activated.`, delay: 6000 },
      { msg: `PIPELINE ESTABLISHED. TRANSITIONING TO DASHBOARD.`, delay: 6500, type: 'SUCCESS' },
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];
    
    sequence.forEach(({ msg, delay, type }) => {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, {
          id: Math.random().toString(36),
          timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
          level: type as any || 'INFO',
          message: msg
        }]);
      }, delay);
      timeouts.push(timeout);
    });

    const finishTimeout = setTimeout(onComplete, 7500);
    timeouts.push(finishTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [args, onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black p-4 font-mono text-sm">
      <div className="w-full max-w-3xl border border-slate-800 bg-slate-950/50 rounded p-4 h-[60vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
           <span className="text-cyan-500 animate-pulse">:: GRESHAM PROTOCOL DEPLOYMENT ::</span>
           <span className="text-slate-600">{args.releaseId}</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex space-x-3"
            >
              <span className="text-slate-500">[{log.timestamp}]</span>
              <span className={`${log.level === 'SUCCESS' ? 'text-green-400' : 'text-slate-300'}`}>
                {log.level === 'SUCCESS' ? '>>> ' : '> '}{log.message}
              </span>
            </motion.div>
          ))}
          <div className="h-4" /> {/* Spacer */}
        </div>
      </div>
    </div>
  );
};

export default LoadingSequence;