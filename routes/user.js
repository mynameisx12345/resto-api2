import express from 'express';
import { addUser, getUser } from '../database/database.js';
import { saveUser,getUsers, removeUser, login } from '../controller/users.js';
const router = express.Router();

// router.get('/',async (req,res)=>{
//     const users = await getUsers();
//     res.send(users);
// })

// router.get('/:id', async (req,res)=>{
//     const id = req.params.id;
//     const user = await getUser(id);
//     res.send(user)
// })

// router.post('/', async(req,res)=>{
//     const {name} = req.body;
//     const result = await addUser(name);
//     res.status(201).send({id:result});
// })

router.post('/', async(req,res)=>{
    const user = await saveUser(req.body);
    res.status(201).send(user);
});

router.get('/', async(req,res)=>{
    const users = await getUsers();
    res.status(201).send(users);
});

router.delete('/:id', async(req,res)=>{



    const user = await removeUser(req.params.id)
    res.status(201).send(user);
})

router.post('/login', async(req,res)=>{
    const user = await login(req.body)
    res.status(201).send(user);
})

export default router;