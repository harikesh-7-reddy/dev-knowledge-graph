import { Router } from 'express'; import { statsService } from '../services/statsService.js';
export const statsRouter = Router();
statsRouter.get('/', async(_req,res,next)=>{try{const [stats,recentActivity,topTechnologies]=await Promise.all([statsService.get(),statsService.activity(),statsService.topTech()]);res.json({stats,recentActivity,topTechnologies});}catch(e){next(e);}});
