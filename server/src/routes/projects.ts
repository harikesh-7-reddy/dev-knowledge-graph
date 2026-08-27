import { Router } from 'express'; import { projectService } from '../services/projectService.js'; import { validate, schemas } from '../utils/validation.js';
export const projectsRouter = Router();
projectsRouter.get('/', async(req,res,next)=>{try{const {limit}=validate(schemas.limit,{limit:req.query.limit??30});res.json({projects:await projectService.getAll(limit)});}catch(e){next(e);}});
projectsRouter.get('/:id', async(req,res,next)=>{try{const {id}=validate(schemas.idParam,{id:req.params.id});res.json(await projectService.getById(id));}catch(e){next(e);}});
