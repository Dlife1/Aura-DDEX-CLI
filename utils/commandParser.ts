import { CommandArgs } from "../types";

export const DEFAULT_COMMAND = `AURA-DDEX-CLI distribute --release-id "R_2025_ZDW_NGR" \\
--asset-source "sftp://secure.aura-supply.com/releases/next_rapgod_v4" \\
--ddex-profile ERN_4.3:AMAZON_PREMIUM:CUSTOM_V1 \\
--e2e-scope GLOBAL_TIER1 \\
--schedule-strategy SMART_WATERFALL:T8W \\
--metadata-audit ENABLE:AI_SEMANTIC_CHECK \\
--rdr-srm-commit TRUE \\
--reporting-frequency DAILY_SYNCHRONOUS \\
--blockchain-tag ENABLE:PROVENANCE_V2 \\
--preflight-check FULL_DSP_COMPLIANCE`;

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
    metadataAudit: cleanCmd.includes('--metadata-audit ENABLE'),
    rdrSrmCommit: cleanCmd.includes('--rdr-srm-commit TRUE'),
    reportingFrequency: getArg('--reporting-frequency'),
    blockchainTag: cleanCmd.includes('--blockchain-tag ENABLE'),
    preflightCheck: cleanCmd.includes('--preflight-check FULL_DSP_COMPLIANCE'),
  };
};