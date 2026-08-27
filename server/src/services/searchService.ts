import { repository } from '../db/repository.js';
export const searchService = { search: (term: string, limit = 10) => repository.run('SEARCH', { term, limit }) };
