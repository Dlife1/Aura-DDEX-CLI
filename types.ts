export interface CommandArgs {
  releaseId: string;
  assetSource: string;
  ddexProfile: string;
  e2eScope: string;
  scheduleStrategy: string;
  metadataAudit: boolean;
  rdrSrmCommit: boolean;
  reportingFrequency: string;
  blockchainTag: boolean;
  preflightCheck: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR' | 'SYSTEM';
  message: string;
}

export interface AiAuditResult {
  semanticScore: number;
  complianceStatus: 'PASS' | 'WARN' | 'FAIL';
  flaggedTerms: string[];
  marketPrediction: string;
  optimizationSuggestions: string[];
}

export interface GroundingResult {
  text: string;
  source: 'MAPS' | 'SEARCH' | 'NONE';
  chunks: any[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ImageAnalysisResult {
  isCompliant: boolean;
  issues: string[];
  tags: string[];
  qualityScore: number; // 0-100
}

export interface ASDPReport {
  synergyScore: number;
  clsScore: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  activeAgents: number;
  mutationProposal?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD'
}

export enum DashboardView {
  COMMAND_CENTER = 'COMMAND_CENTER',
  DISTRIBUTION = 'DISTRIBUTION',
  ASDP = 'ASDP',
  DDEX = 'DDEX',
  BLOCKCHAIN = 'BLOCKCHAIN'
}