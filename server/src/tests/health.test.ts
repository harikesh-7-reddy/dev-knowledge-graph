import {describe,it,expect} from 'vitest'; import {checkHealth} from '../db/health.js';
describe('health',()=>{it('returns a structured status when database is unavailable',async()=>{const h=await checkHealth();expect(['ok','down']).toContain(h.status);expect(['connected','disconnected']).toContain(h.database);expect(h.timestamp).toBeTruthy();});});
