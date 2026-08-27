type LogLevel = 'info' | 'warn' | 'error' | 'debug';
function log(level: LogLevel, message: string, meta?: unknown) {
  const extra = meta ? ` ${JSON.stringify(meta, (_k, v) => v instanceof Error ? v.message : v)}` : '';
  console[level === 'debug' ? 'log' : level](`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${extra}`);
}
export const logger = {
  info: (m: string, x?: unknown) => log('info', m, x),
  warn: (m: string, x?: unknown) => log('warn', m, x),
  error: (m: string, x?: unknown) => log('error', m, x),
  debug: (m: string, x?: unknown) => log('debug', m, x)
};
