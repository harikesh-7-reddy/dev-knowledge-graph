import neo4j, { type Driver } from 'neo4j-driver';
import { config } from '../config/env.js';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    if (!config.cognodb.uri || !config.cognodb.password) {
      throw new Error('CognoDB is not configured. Set COGNODB_URI, COGNODB_USERNAME and COGNODB_PASSWORD.');
    }
    driver = neo4j.driver(
      config.cognodb.uri,
      neo4j.auth.basic(config.cognodb.username, config.cognodb.password),
      { maxConnectionLifetime: 3 * 60 * 60 * 1000, maxConnectionPoolSize: 50, connectionAcquisitionTimeout: 30_000 }
    );
  }
  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
