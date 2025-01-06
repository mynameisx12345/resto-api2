import express from 'express';
import { addOrder, getOrders, getSales, updateOrderDtlStatus, updateOrderHdrStatus } from '../controller/orders.js';


const router = express.Router();

router.post('/', async(req,res)=>{
    const result = await addOrder(req.body);
    res.status(201).send(result);
})

router.get('/all',async(req,res)=>{
    const result = await getOrders();
    res.status(201).send(result)
});

router.put('/detail', async(req,res)=>{
    const result = await updateOrderDtlStatus(req.body);
    res.status(201).send(result);
});

router.put('/header', async(req,res)=>{
    const result = await updateOrderHdrStatus(req.body);
    res.status(201).send(result);
});

router.get('/sales', async(req,res)=>{
    const result = await getSales();
    res.status(201).send(result);
})

export default router;