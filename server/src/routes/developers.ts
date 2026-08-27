import { Router } from 'express'; import { developerService } from '../services/developerService.js'; import { validate, schemas } from '../utils/validation.js';
export const developersRouter = Router();
developersRouter.get('/', async (req,res,next)=>{try{const {limit}=validate(schemas.limit,{limit:req.query.limit??20});res.json({developers:await developerService.getAll(limit)});}catch(e){next(e);}});
developersRouter.get('/:id', async (req,res,next)=>{try{const {id}=validate(schemas.idParam,{id:req.params.id});res.json(await developerService.getById(id));}catch(e){next(e);}});
developersRouter.get('/:id/technologies', async(req,res,next)=>{try{const {id}=validate(schemas.idParam,{id:req.params.id});res.json({developerId:id,technologies:await developerService.getTechnologies(id)});}catch(e){next(e);}});
developersRouter.get('/:id/collaborators', async(req,res,next)=>{try{const {id}=validate(schemas.idParam,{id:req.params.id});const {limit}=validate(schemas.limit,{limit:req.query.limit??10});res.json({developerId:id,collaborators:await developerService.getCollaborators(id,limit)});}catch(e){next(e);}});
