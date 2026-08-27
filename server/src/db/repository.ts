import { getDriver } from './driver.js';
import { QUERIES } from '../queries/index.js';
import { logger } from '../utils/logger.js';

function serializeValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value !== 'object') return value;

  // Neo4j Integer (v5 driver) -> normal JSON number.
  if (typeof value.toNumber === 'function' && 'low' in value && 'high' in value) {
    return value.toNumber();
  }

  // Neo4j Node -> expose its properties directly to the API.
  if (Array.isArray(value.labels) && value.properties && typeof value.properties === 'object') {
    return serializeValue(value.properties);
  }

  if (Array.isArray(value)) return value.map(serializeValue);

  const out: Record<string, any> = {};
  for (const [key, child] of Object.entries(value)) out[key] = serializeValue(child);
  return out;
}

export class Repository {
  async run<T = Record<string, unknown>>(
    key: keyof typeof QUERIES,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const query = QUERIES[key];
    if (typeof query !== 'string') throw new Error(`Query ${String(key)} is a batch definition`);
    const session = getDriver().session();
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => serializeValue(record.toObject()) as T);
    } catch (err) {
      logger.error(`Query failed: ${String(key)}`, err);
      throw err;
    } finally {
      await session.close();
    }
  }

  async runRaw<T = Record<string, unknown>>(
    query: string,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const session = getDriver().session();
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => serializeValue(record.toObject()) as T);
    } finally {
      await session.close();
    }
  }
}

export const repository = new Repository();
