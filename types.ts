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

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD'
}