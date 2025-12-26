import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Play, AlertCircle, UploadCloud, MessageSquare, Sparkles, Mic, Activity, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatResponse, transcribeAudio, createLiveSession } from '../services/geminiService';
import { ChatMessage } from '../types';

interface TerminalProps {
  value: string;
  onChange: (val: string) => void;
  onExecute: (command: string) => void;
  onStageAssets: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ value, onChange, onExecute, onStageAssets }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<'CLI' | 'CHAT'>('CLI');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveSessionRef = useRef<{ disconnect: () => void } | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, mode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (mode === 'CLI') {
        onExecute(value);
      } else {
        await handleChatSubmit();
      }
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    const apiHistory = chatHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getChatResponse(userMsg.text, apiHistory);
    
    setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    setIsChatting(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const text = await transcribeAudio(audioBlob);
          if (mode === 'CLI') {
            onChange(text || value); // Replace or append logic
          } else {
            setChatInput(text);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic access denied", err);
      }
    }
  };

  const toggleLive = async () => {
    if (isLive) {
      liveSessionRef.current?.disconnect();
      setIsLive(false);
    } else {
      try {
        const session = await createLiveSession((buffer) => {
            // Visualize volume roughly
            const data = buffer.getChannelData(0);
            let sum = 0;
            for(let i=0; i<data.length; i+=100) sum += Math.abs(data[i]);
            setLiveVolume(Math.min(100, (sum / (data.length/100)) * 500));
        });
        liveSessionRef.current = session;
        setIsLive(true);
      } catch (e) {
        console.error("Failed to start Live API", e);
        setIsLive(false);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm relative transition-colors duration-500 ${isLive ? 'bg-indigo-950/80 border-indigo-500' : 'bg-black/80 border-slate-700'}`}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
            <TerminalIcon size={12} />
            <span>LinkZ-Core — v4.3.1-beta</span>
          </div>
          <div className="flex items-center space-x-2">
             <button 
               onClick={() => { setMode('CLI'); if(isLive) toggleLive(); }}
               className={`text-[10px] px-2 py-0.5 rounded ${mode === 'CLI' && !isLive ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
             >
               BASH
             </button>
             <button 
               onClick={() => { setMode('CHAT'); if(isLive) toggleLive(); }}
               className={`text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 ${mode === 'CHAT' && !isLive ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <Sparkles size={10} />
               <span>AI_ASSIST</span>
             </button>
             <button 
               onClick={toggleLive}
               className={`text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 transition-all ${isLive ? 'bg-red-900 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <Radio size={10} />
               <span>{isLive ? 'LINKZ_UPLINK_ACTIVE' : 'CONNECT_LINKZ'}</span>
             </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          className="p-6 font-mono text-sm md:text-base relative min-h-[400px]"
          onClick={() => mode === 'CLI' && !isLive && textareaRef.current?.focus()}
        >
           {isLive ? (
              <div className="h-[400px] flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
                    />
                    <Activity size={64} className="text-white relative z-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-widest">LINKZ LIVE INTERFACE</h2>
                    <p className="text-indigo-300 text-xs">VOICE MODALITY: CONNECTED</p>
                    <div className="h-1 w-64 bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full bg-indigo-400"
                         animate={{ width: `${liveVolume}%` }}
                       />
                    </div>
                  </div>
              </div>
           ) : mode === 'CLI' ? (
             <>
               <div className="text-slate-400 mb-4">
                 <span className="text-green-400">gresham@linkz-core</span>:<span className="text-blue-400">~/protocols/deploy</span>$
               </div>
               
               <div className="relative">
                 <textarea
                   ref={textareaRef}
                   value={value}
                   onChange={(e) => onChange(e.target.value)}
                   onKeyDown={handleKeyDown}
                   onFocus={() => setIsFocused(true)}
                   onBlur={() => setIsFocused(false)}
                   className="w-full bg-transparent border-none outline-none resize-none text-cyan-300 placeholder-slate-600 font-mono leading-relaxed pr-8"
                   spellCheck={false}
                 />
                 <button 
                   onClick={toggleRecording}
                   className={`absolute right-0 top-0 p-1 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-600 hover:text-slate-400'}`}
                 >
                   <Mic size={16} />
                 </button>
               </div>
               
               {isFocused && (
                 <motion.div 
                   animate={{ opacity: [1, 0] }}
                   transition={{ repeat: Infinity, duration: 0.8 }}
                   className="inline-block w-2.5 h-5 bg-cyan-400 ml-1 align-middle"
                 />
               )}
             </>
           ) : (
             <div className="h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide pr-2">
                  {chatHistory.length === 0 && (
                    <div className="text-slate-500 text-center mt-10 italic">
                      Initialize LinkZ Chat... Ask about Equity Protocol or Smart Waterfalls.
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded text-xs ${msg.role === 'user' ? 'bg-slate-800 text-slate-200' : 'bg-cyan-900/20 border border-cyan-500/30 text-cyan-100'}`}>
                         <span className="block text-[9px] opacity-50 mb-1 font-bold uppercase">{msg.role === 'user' ? 'USER' : 'LINKZ_CORE'}</span>
                         {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                       <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded text-xs text-cyan-200 animate-pulse">
                         LINKZ_CORE IS TYPING...
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="relative flex items-center space-x-2">
                   <input 
                     type="text" 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder="Query the Gresham Knowledge Base..."
                     className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                     autoFocus
                   />
                   <button 
                     onClick={toggleRecording}
                     className={`p-2 rounded border border-slate-700 ${isRecording ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                   >
                     <Mic size={16} />
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
           <div className="flex items-center space-x-4">
              <span className="flex items-center"><AlertCircle size={12} className="mr-1 text-yellow-500"/> AP2 Protocol: READY</span>
              <span className="flex items-center"><AlertCircle size={12} className="mr-1 text-green-500"/> Network: ENCRYPTED</span>
           </div>
           
           <div className="flex space-x-3">
             <button 
               onClick={onStageAssets}
               className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors border border-slate-600"
             >
               <UploadCloud size={14} />
               <span>STAGE_ASSETS</span>
             </button>
             {mode === 'CLI' && !isLive && (
               <button 
                 onClick={() => onExecute(value)}
                 className="flex items-center space-x-2 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 px-3 py-1 rounded transition-colors border border-cyan-800"
               >
                 <span>EXECUTE_PIPELINE</span>
                 <Play size={14} />
               </button>
             )}
             {mode === 'CHAT' && !isLive && (
                <button 
                 onClick={handleChatSubmit}
                 className="flex items-center space-x-2 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 px-3 py-1 rounded transition-colors border border-cyan-800"
               >
                 <span>SEND_QUERY</span>
                 <MessageSquare size={14} />
               </button>
             )}
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Terminal;