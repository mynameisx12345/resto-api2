
import express from 'express';
import userRouter from './routes/user.js';
import itemsRouter from './routes/items.js';
import ordersRouter from './routes/orders.js';
import bodyParser from 'body-parser';
import formidable from 'express-formidable'
import cors from 'cors';

const app = express();

// app.all('*',(req,res)=>{
//     res.header("Access-Control-Allow-Origin","*");
//     res.header("Access-Control-Allow-Headers","Content-Type, Content-Length, Authorization, Accept, X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
// })

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(cors());
//app.options('*', cors());

app.get('/', (req, res) => {
    throw new Error('Something went wrong!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


//app.use(formidable());

app.use('/images', express.static('uploads'));

app.use('/users',userRouter);

app.use('/items', itemsRouter);
app.use('/orders', ordersRouter);


// app.use((err,req,res,ext)=>{
//     console.err(err.stack);
//     res.status(500).send('Something is wrong. Check with your administrator')
// })

app.listen(3000)