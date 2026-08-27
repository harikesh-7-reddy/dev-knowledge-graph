import { getDriver } from './driver.js';

export interface HealthStatus {
  status: 'ok' | 'down';
  database: 'connected' | 'disconnected';
  timestamp: string;
  details?: string;
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const d = getDriver();
    await d.verifyConnectivity();
    const s = d.session();
    try { await s.run('RETURN 1 AS ping'); } finally { await s.close(); }
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  } catch (err) {
    return { status: 'down', database: 'disconnected', timestamp: new Date().toISOString(), details: err instanceof Error ? err.message : 'Unknown database error' };
  }
}
