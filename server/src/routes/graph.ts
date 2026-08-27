import { Router } from 'express'; import { graphService } from '../services/graphService.js'; import { validate, schemas } from '../utils/validation.js';
export const graphRouter = Router();
graphRouter.get('/neighbors', async(req,res,next)=>{try{const {id,limit}=validate(schemas.graphNeighbors,{id:req.query.id,limit:req.query.limit??20});res.json(await graphService.neighbors(id,limit));}catch(e){next(e);}});
graphRouter.get('/path', async(req,res,next)=>{try{const {fromId,toId}=validate(schemas.devPath,{fromId:req.query.fromId,toId:req.query.toId});const path=await graphService.findPath(fromId,toId);if(!path)return res.status(404).json({error:'No connection path found.'});res.json(path);}catch(e){next(e);}});
