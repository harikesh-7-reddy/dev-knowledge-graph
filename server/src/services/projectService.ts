import { repository } from '../db/repository.js';
import { NotFoundError } from '../utils/errors.js';
export const projectService = {
  getAll: (limit = 30) => repository.run('ALL_PROJECTS', { limit }),
  async getById(id: string) { const rows = await repository.run('PROJECT_BY_ID', { id }); if (!rows[0]?.p) throw new NotFoundError('Project', id); return rows[0]; }
};
