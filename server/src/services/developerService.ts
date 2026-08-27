import { repository } from '../db/repository.js';
import { NotFoundError } from '../utils/errors.js';
export const developerService = {
  getAll: (limit = 20) => repository.run('ALL_DEVELOPERS', { limit }),
  async getById(id: string) { const rows = await repository.run('DEVELOPER_BY_ID', { id }); if (!rows[0]?.d) throw new NotFoundError('Developer', id); return rows[0]; },
  getTechnologies: (id: string) => repository.run('DEVELOPER_TECHNOLOGIES', { id }),
  getCollaborators: (id: string, limit = 10) => repository.run('COLLABORATORS', { id, limit })
};
