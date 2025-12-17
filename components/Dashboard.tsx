import React, { useEffect, useState } from 'react';
import { CommandArgs, AiAuditResult } from '../types';
import { performSemanticAudit } from '../services/geminiService';
import { 
  Activity, Globe, Server, ShieldCheck, Database, FileJson, 
  Layers, Cpu, DollarSign, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

interface DashboardProps {
  args: CommandArgs;
}

// Mock Data
const REACH_DATA = [
  { region: 'NA', streams: 4500, revenue: 2400 },
  { region: 'EU', streams: 3000, revenue: 1800 },
  { region: 'LATAM', streams: 5200, revenue: 1200 },
  { region: 'APAC', streams: 2800, revenue: 1500 },
  { region: 'AFR', streams: 1200, revenue: 400 },
];

const WATERFALL_DATA = [
  { name: 'T-8W', event: 'Teaser 1', impact: 20 },
  { name: 'T-6W', event: 'Reveal', impact: 45 },
  { name: 'T-4W', event: 'Single 1', impact: 80 },
  { name: 'T-2W', event: 'Single 2', impact: 65 },
  { name: 'Release', event: 'Full Album', impact: 100 },
  { name: 'T+2W', event: 'Remix', impact: 50 },
];

const Dashboard: React.FC<DashboardProps> = ({ args }) => {
  const [auditResult, setAuditResult] = useState<AiAuditResult | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      if (args.metadataAudit) {
        const result = await performSemanticAudit(args.releaseId, args.ddexProfile);
        setAuditResult(result);
        setLoadingAudit(false);
      } else {
        setLoadingAudit(false);
      }
    };
    fetchAudit();
  }, [args]);

  const GridItem = ({ title, children, className = "", icon: Icon }: any) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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

  return (
    <div className="min-h-screen bg-black text-slate-300 p-2 md:p-6 font-mono overflow-x-hidden">
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tighter flex items-center">
            AURA<span className="text-cyan-500">::</span>DASHBOARD
            <span className="ml-3 text-xs bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            REL_ID: <span className="text-slate-300">{args.releaseId}</span> | 
            SCOPE: <span className="text-slate-300">{args.e2eScope}</span>
          </p>
        </div>
        <div className="flex items-center space-x-6 mt-4 md:mt-0 text-xs">
          <div className="flex flex-col items-end">
             <span className="text-slate-500">RDR STATUS</span>
             <span className="text-green-400 font-bold flex items-center"><Database size={12} className="mr-1"/> SYNCHRONIZED</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-slate-500">BLOCKCHAIN</span>
             <span className="text-purple-400 font-bold flex items-center"><ShieldCheck size={12} className="mr-1"/> {args.blockchainTag ? 'VERIFIED' : 'OFF'}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
        
        {/* ROW 1: AI Audit & Compliance (Left) - 4 Cols */}
        <div className="md:col-span-4 flex flex-col gap-4">
           <GridItem title="AI Semantic Audit" icon={Cpu} className="flex-grow">
              {loadingAudit ? (
                <div className="animate-pulse text-cyan-500 text-xs">ANALYZING METADATA VECTORS...</div>
              ) : auditResult ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="text-5xl font-bold text-white">{auditResult.semanticScore}</div>
                    <div className={`text-sm px-2 py-1 rounded ${auditResult.complianceStatus === 'PASS' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                      {auditResult.complianceStatus}
                    </div>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${auditResult.semanticScore}%` }} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">MARKET PREDICTION:</p>
                    <p className="text-sm text-cyan-100 border-l-2 border-cyan-500 pl-2">
                      "{auditResult.marketPrediction}"
                    </p>
                  </div>
                  {auditResult.flaggedTerms.length > 0 && (
                     <div className="text-xs text-yellow-500/80 mt-2">
                       Flags: {auditResult.flaggedTerms.join(", ")}
                     </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-red-500">AUDIT DISABLED</div>
              )}
           </GridItem>

           <GridItem title="DDEX Packet Structure" icon={FileJson} className="h-48">
              <div className="text-[10px] text-slate-500 overflow-hidden font-mono leading-tight opacity-70">
                {`<ERN-43 xmlns:ern="http://ddex.net...">`}
                <br/>&nbsp;&nbsp;{`<ReleaseId>${args.releaseId}</ReleaseId>`}
                <br/>&nbsp;&nbsp;{`<Profile>${args.ddexProfile}</Profile>`}
                <br/>&nbsp;&nbsp;{`<ResourceList>`}
                <br/>&nbsp;&nbsp;&nbsp;&nbsp;{`<SoundRecording>`}
                <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<Duration>03:45</Duration>`}
                <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{`<ISRC>US-AURA-25-001</ISRC>`}
                <br/>&nbsp;&nbsp;&nbsp;&nbsp;{`</SoundRecording>`}
                <br/>&nbsp;&nbsp;{`</ResourceList>`}
                <br/>&nbsp;&nbsp;{`<DealList>...</DealList>`}
                <br/>{`</ERN-43>`}
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-green-500 font-bold">VALIDATED</div>
           </GridItem>
        </div>

        {/* ROW 1: Central Vis (Waterwall Schedule) - 5 Cols */}
        <div className="md:col-span-5 flex flex-col gap-4">
           <GridItem title="Smart Waterfall Schedule (Projected)" icon={Calendar} className="h-full min-h-[300px]">
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WATERFALL_DATA}>
                    <defs>
                      <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                      itemStyle={{ color: '#22d3ee' }}
                    />
                    <Area type="monotone" dataKey="impact" stroke="#22d3ee" fillOpacity={1} fill="url(#colorImpact)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </GridItem>
        </div>

        {/* ROW 1: Financial & Reach - 3 Cols */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <GridItem title="Global Reach (Tier 1)" icon={Globe} className="h-full">
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={REACH_DATA} margin={{ left: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="region" type="category" width={40} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }} />
                    <Bar dataKey="streams" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15}>
                       {REACH_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </GridItem>
        </div>

        {/* ROW 2: System Logs & RDR (Bottom) */}
        <div className="md:col-span-8">
           <GridItem title="E2E Delivery Pipeline Status" icon={Server} className="h-48">
              <div className="grid grid-cols-4 gap-4 text-center h-full items-center">
                 {['SPOTIFY', 'APPLE MUSIC', 'AMAZON', 'YOUTUBE'].map((dsp, i) => (
                   <div key={dsp} className="flex flex-col items-center space-y-2 p-2 bg-slate-950/30 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">{dsp}</div>
                      <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                        <motion.div 
                          className="h-full bg-cyan-500" 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: 1 + i * 0.2, duration: 1 }}
                        />
                      </div>
                      <div className="text-[10px] text-green-500">DELIVERED</div>
                   </div>
                 ))}
              </div>
           </GridItem>
        </div>

        <div className="md:col-span-4">
           <GridItem title="SRM / RDR Commitment" icon={DollarSign} className="h-48">
              <div className="flex flex-col h-full justify-between">
                 <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-500">CONTRACT</span>
                    <span className="text-white">SMART_REV_SHARE_V2</span>
                 </div>
                 <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-500">REPORTING</span>
                    <span className="text-white">{args.reportingFrequency}</span>
                 </div>
                 <div className="mt-2 p-2 bg-green-900/10 border border-green-900/50 rounded text-green-400 text-xs text-center">
                    BLOCKCHAIN PROVENANCE HASH LOCKED
                 </div>
              </div>
           </GridItem>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;