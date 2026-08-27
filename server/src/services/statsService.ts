import { repository } from '../db/repository.js';
export const statsService = {
  get: async () => (await repository.run('STATS'))[0] ?? {},
  activity: (limit = 8) => repository.run('RECENT_ACTIVITY', { limit }),
  topTech: (limit = 8) => repository.run('TOP_TECHNOLOGIES', { limit })
};
