import { Router } from 'express'; import { repository } from '../db/repository.js';
export const organizationsRouter = Router();
organizationsRouter.get('/', async(_req,res,next)=>{try{res.json({organizations:await repository.run('ALL_ORGANIZATIONS')});}catch(e){next(e);}});
