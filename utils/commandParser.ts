import { CommandArgs } from "../types";

export const DEFAULT_COMMAND = `AURA-DDEX-CLI distribute --release-id "_1_001817995" \\
--asset-source "sftp://gresham.io/vault/zacdwatts_concrete" \\
--ddex-profile ERN_4.3:GRESHAM_PROTOCOL:HIGH_EQUITY \\
--e2e-scope GLOBAL_SMART_WATERFALL \\
--schedule-strategy SCARCITY_DROP_T72H \\
--metadata-audit ENABLE:IAED_SEMANTIC_CHECK \\
--rdr-srm-commit TRUE \\
--reporting-frequency REALTIME_AP2 \\
--blockchain-tag ENABLE:LINKZ_PROVENANCE \\
--preflight-check INDUSTRIAL_RESILIENCE_MODE`;

export const parseCommandString = (cmd: string): CommandArgs => {
  // Remove backslashes and newlines for cleaner parsing
  const cleanCmd = cmd.replace(/\\\n/g, ' ').replace(/\\/g, '').replace(/\s+/g, ' ').trim();

  const getArg = (flag: string): string => {
    const regex = new RegExp(`${flag}\\s+("([^"]+)"|([^\\s]+))`);
    const match = cleanCmd.match(regex);
    if (match) {
      return match[2] || match[3] || '';
    }
    return '';
  };

  return {
    releaseId: getArg('--release-id'),
    assetSource: getArg('--asset-source'),
    ddexProfile: getArg('--ddex-profile'),
    e2eScope: getArg('--e2e-scope'),
    scheduleStrategy: getArg('--schedule-strategy'),
    metadataAudit: cleanCmd.includes('--metadata-audit'),
    rdrSrmCommit: cleanCmd.includes('--rdr-srm-commit TRUE'),
    reportingFrequency: getArg('--reporting-frequency'),
    blockchainTag: cleanCmd.includes('--blockchain-tag'),
    preflightCheck: cleanCmd.includes('--preflight-check'),
  };
};