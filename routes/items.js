import express from 'express';
import { addCategory, updateCategory,getCategory, getCategories, newCategory, updateCategoryNow, removeCategory, addItem, getItems, updateItem, removeItem, addPrices } from '../controller/items.js';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/items/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileExtension = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension)
}
})
  
const upload = multer({ storage})

const router = express.Router();

router.post('/category', async(req,res)=>{
    const result = await newCategory(req.body);
    res.status(201).send(result);
})

router.put('/category',async(req,res) =>{
    const {id, name} = req.body;
    const result = await updateCategoryNow(req.body);
    res.status(201).send(result)
})

router.get('/category/:id',async(req,res)=>{
    const id = req.params.id;
    console.log(id)
    const result = await getCategory(id);
    if(result){
        res.status(200).json(result)
    } else {
        res.status(500)
    }
    
})

router.delete('/category/:id', async(req,res)=>{
    const id = req.params.id;
    const result = await removeCategory(id);
    
    if(result){
        res.status(200).json(result)
    } else {
        res.status(500);
    }
})

router.get('/categories', async(req,res)=>{
    const result = await getCategories();
   
    res.status(200).json(result)
    
});

router.post('/', upload.single('image'),async(req,res)=>{
    const body = {imagePath: req.file?.path, ...req.body}
    const insertId = await addItem(body);

    console.log('file', req.file)

    const result = {
        imagePath: req.file?.path || '',
        ...req.body,
        id:insertId
    };

    res.status(200).json(result);
})

router.get('/all',async(req,res)=>{
    const result = await getItems();
    
    res.json(result);
})

router.put('/',upload.single('image'),async(req,res)=>{
    const body = {imagePath: req.file?.path, ...req.body}
    const result = await updateItem(body);

    res.status(200).json(result);
});

router.delete('/:id',async(req,res)=>{
    const id = req.params.id;
    const result = await removeItem(id);

    if(result){
        res.status(200).json(result)
    } else {
        res.status(500).json()
    }
});

router.post('/price',async(req,res)=>{
    const result = await addPrices(req.body);

    res.json(result);
})

export default router;