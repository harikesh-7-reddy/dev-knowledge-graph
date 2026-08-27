import {describe,it,expect} from 'vitest'; import request from 'supertest'; import {createApp} from '../app.js';
const app=createApp(); describe('API',()=>{it('root responds',async()=>{const r=await request(app).get('/');expect(r.status).toBe(200);});it('search without q is 400',async()=>{const r=await request(app).get('/api/search');expect(r.status).toBe(400);});});
