import { Router } from 'express'; import { searchService } from '../services/searchService.js'; import { validate, schemas } from '../utils/validation.js';
export const searchRouter = Router();
searchRouter.get('/', async (req,res,next) => { try { const input = validate(schemas.search,{q:req.query.q,limit:req.query.limit}); res.json({ query: input.q, results: await searchService.search(input.q,input.limit) }); } catch(e){ next(e); } });
