import { repository } from '../db/repository.js';
import { NotFoundError } from '../utils/errors.js';
export const technologyService = {
  getAll: (limit = 30) => repository.run('ALL_TECHNOLOGIES', { limit }),
  async getById(id: string) { const rows = await repository.run('TECHNOLOGY_BY_ID', { id }); if (!rows[0]?.t) throw new NotFoundError('Technology', id); return rows[0]; },
  getDependencies: (id: string, limit = 20) => repository.run('TECHNOLOGY_DEPENDENCY_TREE', { id, limit }),
  getDependents: (id: string, limit = 20) => repository.run('TECHNOLOGY_REVERSE_DEPENDENTS', { id, limit }),
  getDevelopers: (id: string) => repository.run('TECHNOLOGY_DEVELOPERS', { id })
};
