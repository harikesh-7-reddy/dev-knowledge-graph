import {describe,it,expect} from 'vitest'; import {schemas,validate} from '../utils/validation.js';
describe('validation',()=>{it('accepts valid id',()=>expect(validate(schemas.idParam,{id:'dev-1'}).id).toBe('dev-1'));it('rejects bad id',()=>expect(()=>validate(schemas.idParam,{id:'bad id!'})).toThrow());});
