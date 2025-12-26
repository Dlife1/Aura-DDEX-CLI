import React, { useEffect, useState } from 'react';
import { CommandArgs, AiAuditResult, GroundingResult, DashboardView, ASDPReport } from '../types';
import { performSemanticAudit, performGroundingQuery, analyzeASDPStatus } from '../services/geminiService';
import {
  Activity, Globe, Server, ShieldCheck, Database, FileJson,
  Layers, Cpu, DollarSign, Calendar, MapPin, Search, Layout, GitBranch, Lock, BarChart3, Radio, PieChart as PieChartIcon, Zap, ScanLine, Edit3
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, Sector
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  args: CommandArgs;
}

// Initial Mock Data
const INITIAL_EQUITY_DATA = [
  { name: 'Artist Share', value: 70, fill: '#10b981' }, // Green
  { name: 'Liquidity Pool', value: 15, fill: '#3b82f6' }, // Blue
  { name: 'Equity Holders', value: 15, fill: '#f59e0b' }, // Amber
];

const INITIAL_WATERFALL_DATA = [
  { name: 'T-72H', event: 'Scarcity Drop', impact: 30, color: '#f59e0b' },
  { name: 'Release', event: 'Concrete Jungle', impact: 100, color: '#10b981' },
  { name: 'T+1W', event: 'Kinetic Loops', impact: 85, color: '#06b6d4' },
  { name: 'T+4W', event: 'Long-Tail', impact: 60, color: '#6366f1' },
  { name: 'T+12W', event: 'Sync Licensing', impact: 45, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-cyan-900/50 p-3 rounded-md shadow-2xl backdrop-blur-md min-w-[160px] z-50">
        <div className="text-[10px] text-cyan-400 font-mono mb-2 border-b border-cyan-900/30 pb-1 uppercase tracking-wider flex items-center">
           <ScanLine size={10} className="mr-1" />
           {label ? label : 'DATA_NODE'}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1 last:mb-0">
            <span className="text-[10px] text-slate-400 font-mono flex items-center">
               <div className="w-1.5 h-1.5 rounded-sm mr-2" style={{ backgroundColor: entry.color || entry.payload.fill }} />
               {entry.name}
            </span>
            <span className="text-[10px] font-bold text-white font-mono ml-3">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EditableInput = ({ value, onChange, className = "", type = "text" }: { value: string | number, onChange: (val: any) => void, className?: string, type?: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleCommit = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
        className={`bg-slate-800 text-white border border-cyan-500 rounded px-1 outline-none min-w-[40px] w-full font-mono text-xs ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      className={`cursor-pointer hover:bg-slate-800/50 hover:text-cyan-400 border-b border-dotted border-slate-700 hover:border-cyan-500 transition-all relative group/edit ${className}`}
    >
      {value}
    </span>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ args }) => {
  const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.COMMAND_CENTER);
  const [auditResult, setAuditResult] = useState<AiAuditResult | null>(null);
  const [asdpReport, setAsdpReport] = useState<ASDPReport | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [mapsData, setMapsData] = useState<GroundingResult | null>(null);
  const [searchData, setSearchData] = useState<GroundingResult | null>(null);
  
  // Editable State
  const [equityData, setEquityData] = useState(INITIAL_EQUITY_DATA);
  const [waterfallData, setWaterfallData] = useState(INITIAL_WATERFALL_DATA);
  const [releaseInfo, setReleaseInfo] = useState({
    artist: "ZacDWatts",
    title: "Concrete Jungle",
    scope: args.e2eScope
  });
  const [systemStatus, setSystemStatus] = useState({
    status: "ACTIVE",
    financial: "AP2: READY",
    shards: 1000
  });

  // Simulated data stream effect
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Audit
      if (args.metadataAudit) {
        const result = await performSemanticAudit(args.releaseId, args.ddexProfile);
        setAuditResult(result);
      }
      setLoadingAudit(false);

      // 2. Intelligence (Grounding)
      const mapRes = await performGroundingQuery("Industrial aesthetic venues in Berlin and Tokyo suitable for launch events.", "MAPS");
      setMapsData(mapRes);
      const searchRes = await performGroundingQuery("Trends in 'Nocturnal-Industrial' music consumption 2025", "SEARCH");
      setSearchData(searchRes);

      // 3. ASDP Analysis
      const asdpRes = await analyzeASDPStatus({ synergy: 9.2, agents: 12 }); // Positive synergy for Gresham Protocol
      setAsdpReport(asdpRes);
    };

    fetchData();
  }, [args]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const updateEquityData = (index: number, key: 'name' | 'value', val: any) => {
    const newData = [...equityData];
    // @ts-ignore
    newData[index][key] = val;
    setEquityData(newData);
  };

  // --- SUB-COMPONENTS ---

  const SidebarItem = ({ view, icon: Icon, label }: any) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-3 w-full p-3 rounded-md transition-all ${currentView === view ? 'bg-cyan-900/40 text-cyan-400 border-r-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/20'}`}
    >
      <Icon size={18} />
      <span className="text-xs font-bold tracking-wider">{label}</span>
    </button>
  );

  const GridItem = ({ title, children, className = "", icon: Icon }: any) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-slate-900/40 border border-slate-800 p-4 rounded-md backdrop-blur-sm flex flex-col ${className}`}
    >
      <div className="flex items-center space-x-2 mb-4 border-b border-slate-800 pb-2">
        {Icon && <Icon size={16} className="text-cyan-500" />}
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">{title}</h3>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {children}
      </div>
    </motion.div>
  );

  // --- VIEWS ---

  const CommandCenterView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      <GridItem title="AP2 Equity Distribution" icon={PieChartIcon} className="min-h-[250px]">
        <div className="flex flex-col h-full items-center justify-center relative">
           <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={(props: any) => {
                  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                  return (
                    <g>
                      <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius + 5}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                      />
                      <Sector
                        cx={cx}
                        cy={cy}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        innerRadius={outerRadius + 8}
                        outerRadius={outerRadius + 10}
                        fill={fill}
                      />
                    </g>
                  );
                }}
                onMouseEnter={onPieEnter}
                data={equityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {equityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
           </ResponsiveContainer>
           <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <motion.span 
                key={activeIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white"
              >
                {equityData[activeIndex].value}%
              </motion.span>
              <motion.span 
                 key={`label-${activeIndex}`}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-[10px] text-slate-500 uppercase tracking-widest"
              >
                {equityData[activeIndex].name}
              </motion.span>
           </div>
           <div className="w-full mt-4 space-y-2">
              {equityData.map((d, i) => (
                <div key={i} className="flex justify-between text-xs cursor-default" onMouseEnter={() => setActiveIndex(i)}>
                   <span className="flex items-center text-slate-400 group hover:text-white transition-colors">
                     <div className={`w-2 h-2 rounded-full mr-2 transition-transform ${activeIndex === i ? 'scale-125' : ''}`} style={{backgroundColor: d.fill}}/>
                     <EditableInput value={d.name} onChange={(v) => updateEquityData(i, 'name', v)} />
                   </span>
                   <span className={`font-bold font-mono ${activeIndex === i ? 'text-cyan-400' : 'text-slate-500'}`}>
                     <EditableInput value={d.value} type="number" onChange={(v) => updateEquityData(i, 'value', v)} />%
                   </span>
                </div>
              ))}
           </div>
        </div>
      </GridItem>

      <GridItem title="LinkZ Strategic Intelligence" icon={Search} className="lg:col-span-2 min-h-[250px]">
        <AnimatePresence mode="wait">
          {!searchData ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="text-xs text-slate-500 flex items-center h-full justify-center"
             >
               <ScanLine className="animate-spin mr-2" size={16}/> Scanning Gresham Global Indices...
             </motion.div>
          ) : (
            <motion.div 
               key="content"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5 }}
               className="text-xs space-y-4"
            >
              <div className="text-purple-400 font-bold border-b border-purple-900/30 pb-1 flex justify-between">
                <span>MARKET SENTIMENT: "{releaseInfo.title.toUpperCase()}"</span>
                <span className="text-slate-600 text-[10px]">SOURCE: LINKZ_AI</span>
              </div>
              <div className="text-slate-300 leading-relaxed font-mono p-2 bg-slate-950/50 rounded border border-slate-800">
                <EditableInput value={searchData.text} onChange={(v: string) => setSearchData({...searchData, text: v})} />
              </div>
              <div className="flex flex-wrap gap-2">
                {searchData.chunks?.slice(0, 3).map((c: any, i: number) => (
                  <motion.a 
                    href={c.web?.uri} 
                    target="_blank" 
                    key={i} 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-2 py-1 bg-slate-800 rounded text-[10px] text-purple-400 border border-slate-700 hover:bg-slate-700 flex items-center"
                  >
                    <Globe size={10} className="mr-1"/>
                    {c.web?.title || 'Data Node'}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GridItem>

       <GridItem title="Targeted Nodes (Geo-Fencing)" icon={MapPin} className="lg:col-span-1 h-40">
           <AnimatePresence mode="wait">
             {!mapsData ? (
               <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-xs text-slate-500 h-full flex items-center justify-center">
                 Querying Industrial Hubs...
               </motion.div>
             ) : (
                 <motion.div 
                   key="content"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-xs space-y-2"
                 >
                     <div className="text-green-400 font-bold mb-1 flex items-center justify-between">
                       <span>OPTIMAL LAUNCH ZONES</span>
                       <Activity size={10} className="animate-pulse"/>
                     </div>
                     <div className="line-clamp-2 text-slate-300 font-mono text-[10px] leading-relaxed">
                       {mapsData.text}
                     </div>
                     <div className="flex space-x-2 mt-2">
                         {mapsData.chunks?.slice(0, 2).map((c: any, i: number) => (
                             <span key={i} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-cyan-500 border border-slate-700 truncate max-w-[120px] flex items-center">
                                 <MapPin size={8} className="mr-1"/>
                                 {c.web?.title || 'Sector'}
                             </span>
                         ))}
                     </div>
                 </motion.div>
             )}
           </AnimatePresence>
       </GridItem>

       <GridItem title="Gresham Protocol Status" icon={Zap} className="lg:col-span-2 h-40">
          <div className="grid grid-cols-3 gap-4 text-center h-full items-center">
             <motion.div 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
               className="p-3 bg-green-900/10 rounded border border-green-900/30 hover:bg-green-900/20 transition-colors"
             >
               <div className="text-[10px] text-slate-400 mb-1">STATUS</div>
               <div className="text-xl text-green-400 font-bold font-mono">
                 <EditableInput value={systemStatus.status} onChange={(v: string) => setSystemStatus(s => ({...s, status: v}))} />
               </div>
               <div className="text-[9px] text-slate-500">High-Equity Potential</div>
             </motion.div>
             <motion.div 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
               className="p-3 bg-blue-900/10 rounded border border-blue-900/30 hover:bg-blue-900/20 transition-colors"
             >
               <div className="text-[10px] text-slate-400 mb-1">FINANCIAL LAYER</div>
               <div className="text-xl text-blue-400 font-bold font-mono">
                  <EditableInput value={systemStatus.financial} onChange={(v: string) => setSystemStatus(s => ({...s, financial: v}))} />
               </div>
               <div className="text-[9px] text-slate-500">Real-Time Settlement</div>
             </motion.div>
             <motion.div 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
               className="p-3 bg-amber-900/10 rounded border border-amber-900/30 hover:bg-amber-900/20 transition-colors"
             >
               <div className="text-[10px] text-slate-400 mb-1">EQUITY SHARDS</div>
               <div className="text-xl text-amber-400 font-bold font-mono">
                 <EditableInput value={systemStatus.shards} type="number" onChange={(v: number) => setSystemStatus(s => ({...s, shards: v}))} />
               </div>
               <div className="text-[9px] text-slate-500">Available</div>
             </motion.div>
          </div>
       </GridItem>
    </div>
  );

  const DistributionView = () => (
    <div className="h-full flex flex-col gap-4">
      <GridItem title="Smart Waterfall Sequence" icon={Calendar} className="flex-grow min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={waterfallData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{fontSize: 10, fill: '#64748b', fontFamily: 'monospace'}} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="impact" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorImpact)"
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </GridItem>
      <div className="grid grid-cols-3 gap-4 h-32">
         {[
            { phase: 'PHASE I', title: 'Scarcity Drop', desc: 'Private Nodes / Token-Gated' },
            { phase: 'PHASE II', title: 'Expansion', desc: 'Mass Market / Kinetic Montage' },
            { phase: 'PHASE III', title: 'Long-Tail', desc: 'Sync Libraries / Persistence' }
         ].map((p, i) => (
           <motion.div 
             key={i} 
             whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
             className="bg-slate-900/30 border border-slate-800 p-3 rounded flex flex-col justify-center items-center cursor-pointer group"
           >
              <div className="text-[10px] text-cyan-500 font-bold mb-1 font-mono">{p.phase}</div>
              <div className="text-slate-200 text-xs font-bold group-hover:text-green-400 transition-colors">{p.title}</div>
              <div className="text-slate-500 text-[10px] text-center mt-1">{p.desc}</div>
           </motion.div>
         ))}
      </div>
    </div>
  );

  const ASDPView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
       <GridItem title="LinkZ Synergy Radar" icon={GitBranch} className="h-full">
          {!asdpReport ? <div className="text-xs text-slate-500">Querying Agent Mesh...</div> : (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="text-xs text-slate-400">SYNERGY SCORE</div>
                   <motion.div 
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className={`text-4xl font-bold font-mono ${asdpReport.synergyScore < 0 ? 'text-red-500' : 'text-green-500'}`}
                   >
                     {asdpReport.synergyScore.toFixed(1)}
                   </motion.div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                   <motion.div
                     initial={{ width: '0%' }}
                     animate={{ width: `${Math.max(0, 50 + asdpReport.synergyScore * 5)}%` }}
                     transition={{ duration: 1.5, ease: "circOut" }}
                     className={`h-full relative ${asdpReport.synergyScore < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                   >
                     <motion.div 
                        className="absolute right-0 top-0 bottom-0 w-2 bg-white/50"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                     />
                   </motion.div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1">ACTIVE AGENTS</div>
                      <div className="text-xl text-white font-mono">{asdpReport.activeAgents}</div>
                   </div>
                   <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 mb-1">CLS SCORE</div>
                      <div className="text-xl text-green-500 font-mono">0.02</div>
                   </div>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-900/10 border border-green-900/30 p-4 rounded"
                >
                   <div className="text-xs text-green-400 font-bold mb-2 flex items-center">
                     <ShieldCheck size={12} className="mr-2"/> PROTOCOL: OPTIMAL
                   </div>
                   <div className="text-[10px] text-green-300/70">
                     Autonomous agents are operating at peak efficiency. No mutations required.
                   </div>
                </motion.div>
             </div>
          )}
       </GridItem>
       <GridItem title="Agent Activity Log" icon={Cpu} className="h-full">
          {!asdpReport ? <div className="text-xs text-slate-500">Waiting for LinkZ Engine...</div> : (
             <div className="flex flex-col h-full">
                <div className="bg-black p-4 rounded font-mono text-[10px] text-cyan-400 overflow-y-auto flex-grow border border-slate-800 relative">
                   {`// LINKZ AGENT LOG
// TIMESTAMP: 2025-12-21T04:20:00Z
// STATUS: SYNERGISTIC_LOCK

[INFO] Agent-01: Detected asset "Concrete Jungle".
[INFO] Agent-04: Initialized Scarcity Drop protocols.
[INFO] Agent-09: AP2 Financial Layer handshake complete.
[INFO] Agent-12: "Nocturnal" audience segment locked.
[SUCCESS] Mutation skipped. System integrity 100%.
`}
                  <motion.div 
                    className="absolute bottom-4 left-4 w-2 h-4 bg-cyan-400"
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                </div>
             </div>
          )}
       </GridItem>
    </div>
  );

  const DDEXView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
       <GridItem title="Packet Structure" icon={FileJson} className="md:col-span-2 h-full">
          <div className="bg-black/50 p-4 rounded h-full font-mono text-[10px] text-slate-400 overflow-y-auto border border-slate-800">
            <span className="text-blue-400">{`<ERN-43 xmlns:ern="http://ddex.net...">`}</span>
            <br/>&nbsp;&nbsp;<span className="text-purple-400">{`<ReleaseId>`}</span>{args.releaseId}<span className="text-purple-400">{`</ReleaseId>`}</span>
            <br/>&nbsp;&nbsp;<span className="text-purple-400">{`<ReferenceTitle>`}</span>
              <EditableInput value={releaseInfo.title} onChange={(v: string) => setReleaseInfo(r => ({...r, title: v}))} className="text-slate-300 inline-block" />
            <span className="text-purple-400">{`</ReferenceTitle>`}</span>
             <br/>&nbsp;&nbsp;<span className="text-purple-400">{`<DisplayArtistName>`}</span>
              <EditableInput value={releaseInfo.artist} onChange={(v: string) => setReleaseInfo(r => ({...r, artist: v}))} className="text-slate-300 inline-block" />
             <span className="text-purple-400">{`</DisplayArtistName>`}</span>
            <br/>&nbsp;&nbsp;<span className="text-purple-400">{`<Profile>`}</span>{args.ddexProfile}<span className="text-purple-400">{`</Profile>`}</span>
            <br/>&nbsp;&nbsp;<span className="text-purple-400">{`<ResourceList>`}</span>
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">{`<SoundRecording>`}</span>
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<Duration>03:45</Duration>`}
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<Genre>Industrial Soul</Genre>`}
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<GenreSecondary>Urban Experimental</GenreSecondary>`}
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">{`</SoundRecording>`}</span>
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">{`<Image>`}</span>
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<Type>CoverArt</Type>`}
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<HashSum>${args.blockchainTag ? '0x7f83b1...' : 'PENDING'}</HashSum>`}
            <br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">{`</Image>`}</span>
            <br/>&nbsp;&nbsp;<span className="text-purple-400">{`</ResourceList>`}</span>
            <br/><span className="text-blue-400">{`</ERN-43>`}</span>
          </div>
       </GridItem>
       <GridItem title="IAED Analysis Report" icon={ShieldCheck} className="h-full">
          <AnimatePresence mode="wait">
            {loadingAudit ? (
               <motion.div key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-xs animate-pulse text-cyan-500 flex items-center h-full justify-center">
                 <ScanLine className="animate-spin mr-2"/> RUNNING VALIDATION...
               </motion.div>
            ) : auditResult ? (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-4"
               >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                     <span className="text-xs text-slate-400">QUALITY SCORE</span>
                     <span className="text-2xl font-bold text-white font-mono">{auditResult.semanticScore}</span>
                  </div>
                  <div className="space-y-2">
                     <div className="text-xs text-slate-500 uppercase">Flags</div>
                     {auditResult.flaggedTerms.length > 0 ? (
                        auditResult.flaggedTerms.map((flag, i) => (
                          <div key={i} className="text-xs text-green-500 bg-green-900/10 px-2 py-1 rounded border border-green-900/30 font-mono">
                             {flag}
                          </div>
                        ))
                     ) : <div className="text-xs text-green-500">None</div>}
                  </div>
                  <div className="space-y-2 mt-4">
                     <div className="text-xs text-slate-500 uppercase">Strategy</div>
                     {auditResult.optimizationSuggestions.map((s, i) => (
                        <div key={i} className="text-[10px] text-slate-300 flex items-start">
                           <span className="text-cyan-500 mr-2">•</span> {s}
                        </div>
                     ))}
                  </div>
               </motion.div>
            ) : <div className="text-xs text-red-500">Audit Failed</div>}
          </AnimatePresence>
       </GridItem>
    </div>
  );

  const BlockchainView = () => (
     <div className="flex flex-col gap-4 h-full">
        <GridItem title="LinkZ Provenance Chain" icon={Database} className="h-40">
           <div className="flex items-center space-x-4 h-full">
              <motion.div 
                animate={{ boxShadow: ['0 0 0px #a855f7', '0 0 20px #a855f7', '0 0 0px #a855f7'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 bg-purple-900/20 border border-purple-500 rounded flex items-center justify-center"
              >
                 <Lock className="text-purple-500" />
              </motion.div>
              <div className="space-y-1">
                 <div className="text-[10px] text-slate-500">CONTRACT ADDRESS</div>
                 <div className="text-sm font-mono text-purple-300">0xGRESHAM...2025</div>
                 <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">MINTED</span>
                    <span className="text-[10px] text-slate-500">Token ID #1817995</span>
                 </div>
              </div>
           </div>
        </GridItem>
        <div className="grid grid-cols-3 gap-4 flex-grow">
           {['Smart Contract Init', 'Rights Tokenization', 'AP2 Payment Channel'].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-slate-900/20 border border-slate-800 p-4 rounded flex flex-col items-center justify-center overflow-hidden"
              >
                 {i > 0 && <div className="absolute left-0 top-1/2 -ml-2 w-4 h-px bg-slate-700" />}
                 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mb-2 text-xs text-slate-300 font-bold">{i+1}</div>
                 <div className="text-xs text-slate-400">{step}</div>
                 <div className="text-[10px] text-green-500 mt-1">CONFIRMED</div>
                 <motion.div 
                   className="absolute inset-0 bg-green-500/5"
                   initial={{ scaleY: 0 }}
                   animate={{ scaleY: 1 }}
                   transition={{ delay: i * 0.2 + 0.5, duration: 0.5 }}
                   style={{ transformOrigin: 'bottom' }}
                 />
              </motion.div>
           ))}
        </div>
     </div>
  );

  // --- MAIN LAYOUT ---

  return (
    <div className="h-screen bg-black text-slate-300 flex overflow-hidden font-mono">
       {/* Sidebar */}
       <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4">
          <div className="mb-8">
             <div className="text-xl font-bold text-white tracking-tighter">
               GRESHAM<span className="text-cyan-500">::</span>LINKZ
             </div>
             <div className="text-[10px] text-slate-500 mt-1">
               Generative UI Engine<br/>Deployment v4.3
             </div>
          </div>
          
          <div className="space-y-2 flex-grow">
             <SidebarItem view={DashboardView.COMMAND_CENTER} icon={Layout} label="COMMAND CENTER" />
             <SidebarItem view={DashboardView.DISTRIBUTION} icon={BarChart3} label="SMART WATERFALL" />
             <SidebarItem view={DashboardView.ASDP} icon={GitBranch} label="SYNERGY RADAR" />
             <SidebarItem view={DashboardView.DDEX} icon={FileJson} label="DDEX METADATA" />
             <SidebarItem view={DashboardView.BLOCKCHAIN} icon={Database} label="BLOCKCHAIN" />
          </div>

          <div className="mt-auto pt-4 border-t border-slate-900">
             <div className="flex items-center space-x-2 text-[10px] text-slate-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>GRESHAM PROTOCOL: ACTIVE</span>
             </div>
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0 bg-black/80">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm">
             <h2 className="text-sm font-bold text-slate-200 tracking-widest flex items-center">
                <Activity size={14} className="mr-2 text-cyan-500"/>
                {currentView.replace('_', ' ')}
             </h2>
             <div className="flex items-center space-x-4 text-xs">
                <span className="text-slate-500">RELEASE: <span className="text-slate-300">
                  <EditableInput value={`${releaseInfo.artist} - ${releaseInfo.title}`} onChange={(v: string) => {
                    const [a, t] = v.split(' - ');
                    if(a && t) setReleaseInfo({ ...releaseInfo, artist: a, title: t });
                  }} />
                </span></span>
                <span className="text-slate-500">SCOPE: <span className="text-cyan-400">
                  <EditableInput value={releaseInfo.scope} onChange={(v: string) => setReleaseInfo({...releaseInfo, scope: v})} />
                </span></span>
             </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
             <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                   {currentView === DashboardView.COMMAND_CENTER && <CommandCenterView />}
                   {currentView === DashboardView.DISTRIBUTION && <DistributionView />}
                   {currentView === DashboardView.ASDP && <ASDPView />}
                   {currentView === DashboardView.DDEX && <DDEXView />}
                   {currentView === DashboardView.BLOCKCHAIN && <BlockchainView />}
                </motion.div>
             </AnimatePresence>
          </main>
       </div>
    </div>
  );
};

export default Dashboard;