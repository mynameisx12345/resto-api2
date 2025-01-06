import express from 'express';
import { addUser, getUser, getUsers } from '../database/database.js';
const router = express.Router();

router.get('/',async (req,res)=>{
    const users = await getUsers();
    res.send(users);
})

router.get('/:id', async (req,res)=>{
    const id = req.params.id;
    const user = await getUser(id);
    res.send(user)
})

router.post('/', async(req,res)=>{
    const {name} = req.body;
    const result = await addUser(name);
    res.status(201).send({id:result});
})

export default router;