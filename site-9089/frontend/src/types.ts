export type EscrowSnapshot = {
  network: string;
  blockHeight: number;
  lockedValue: number;
  pendingApprovals: number;
  anomalyCount: number;
  signers: string[];
  ledger: string[];
  generatedAt: string;
};

export type BrowserLog = {
  id: string;
  level: 'info' | 'warn' | 'error';
  source: string;
  message: string;
  time: string;
};
