import mysql from 'mysql2';
import dotenv from 'dotenv';
import moment from 'moment';
dotenv.config();

const pool =  mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function addOrderHdr(body){
    const {mode, area, areaFee, subTotal, grandTotal, discount, payMode, status, paidAmount} = body
    const dttmOrder = moment().format()
    const [result] = await pool.query(`
        INSERT INTO order_hdr (mode, area, area_fee, sub_total, grand_total, discount, pay_mode, status, dttm_order, paid_amount)
        VALUES(?,?,?,?,?,?,?,?,?,?)
    `, [mode, area, areaFee,subTotal,grandTotal,discount,payMode,status,dttmOrder,paidAmount]);

    const insertId = result.insertId;
    
    return {
        dttmOrder: dttmOrder,
        ...body,
        id: insertId,
        
    }
}

export async function addOrderDtl(body){
    const {itemId, itemName, itemSize, quantity, price, total, status, orderHdrId} = body;
    const [result] = await pool.query(`
        INSERT INTO order_dtl (item_id, item_name, item_size, quantity, price, total, status, order_hdr_id)
        VALUES(?,?,?,?,?,?,?,?)
    `,[itemId, itemName,itemSize,quantity,price,total,status,orderHdrId])

    const insertId = result.insertId;

    return {
        ...body,
        id: insertId
    }
}

export async function addOrder(body){
    const hdrResult = await addOrderHdr(body);
    console.log('headerres', hdrResult,body)
    const dtlResult = await Promise.all(body.details.map((det)=>addOrderDtl({...det, orderHdrId: hdrResult.id})));

    return {
        ...hdrResult,
        details: [...dtlResult]
    }
}

export async function getOrders(){
    const [result] = await pool.query(`
        SELECT hdr.id id, 
            hdr.mode, 
            hdr.area, 
            hdr.area_fee, 
            hdr.sub_total, 
            hdr.grand_total, 
            hdr.discount, 
            hdr.pay_mode, 
            hdr.status hdr_status, 
            hdr.dttm_order, 
            hdr.paid_amount, 
            dtl.id dtl_id, 
            dtl.item_id, 
            dtl.item_name, 
            dtl.item_size, 
            dtl.quantity, 
            dtl.price, 
            dtl.total, 
            dtl.status dtl_status,
            dtl.order_hdr_id
        FROM order_hdr hdr LEFT OUTER JOIN order_dtl dtl ON (hdr.id = dtl.order_hdr_id)
    `);

    let parsedOrders = [];

    result.forEach(res=>{
        const parsedOrder = parsedOrders.find(parsed=>parsed.id === res.id);
        if(parsedOrder){
            parsedOrder.details.push({
                id: res.dtl_id, 
                itemId: res.item_id, 
                itemName: res.item_name,
                itemSize: res.item_size,
                quantity: res.quantity,
                price: res.price,
                total: res.total,
                status: res.dtl_status,
                orderHdrId: res.order_hdr_id
            })
        } else {
            parsedOrders.push({
                id: res.id,
                mode: res.mode,
                area: res.area,
                areaFee: res.area_fee,
                subTotal: res.sub_total,
                grandTotal: res.grand_total,
                discount: res.discount,
                payMode: res.pay_mode,
                status: res.hdr_status,
                dttmOrder: res.dttm_order,
                paidAmount: res.paid_amount,
                details: [{
                    id: res.dtl_id, 
                    itemId: res.item_id, 
                    itemName: res.item_name,
                    itemSize: res.item_size,
                    quantity: res.quantity,
                    price: res.price,
                    total: res.total,
                    status: res.dtl_status,
                    orderHdrId: res.order_hdr_id
                }]
            })
        }
    })

    return parsedOrders;
}

export async function updateOrderDtlStatus(body){
    const {id, status,orderHdrId } = body;
    const [result] = await pool.query(`
        UPDATE order_dtl
        SET status = ?
        WHERE id = ?
    `,[status,id]);

    const [resultCount] = await pool.query(`
        SELECT COUNT(*) count,
            SUM(status='Served') status_served
        FROM order_dtl
        WHERE order_hdr_id = ?
    `,[orderHdrId]);

    const {count, status_served} = resultCount[0];
    let isHeaderServed = false;
    console.log('count', count, status_served,Number(count) === Number(status_served))
    if(Number(count) === Number(status_served)){
        const updateResult= await updateOrderHdrStatus({id: orderHdrId, status:'Served'});        
        isHeaderServed = true;
    }
    

    return {
        ...body,
        isHeaderServed
    }
}

export async function updateOrderHdrStatus(body){
    const {id, status} = body;
    const [result] = await pool.query(`
        UPDATE order_hdr
        SET status = ?
        WHERE id = ?
    `, [status,id]);

    return {
        ...body
    }
}

export async function getSales(){
    const [result] = await pool.query(`
        SELECT hdr.id hdrId,
            hdr.mode,
            hdr.area,
            hdr.area_fee areaFee,
            hdr.sub_total subTotal,
            hdr.grand_total grandTotal,
            hdr.pay_mode payMode,
            hdr.status hdrStatus,
            hdr.dttm_order dttmOrder,
            hdr.dttm_pay dttmPay,
            hdr.paid_amount paidAmount,
            dtl.id dtlId, 
            dtl.item_id itemId,
            dtl.item_name itemName,
            dtl.item_size itemSize,
            dtl.quantity,
            dtl.price,
            dtl.total,
            dtl.status dtl_status,
            item.name item_name ,
            item.description item_description,
            cat.name categoryName,
            cat.id categoryId,
            sub.id subcategoryId,
            sub.name subcategoryName
        FROM order_hdr hdr LEFT OUTER JOIN order_dtl dtl 
                ON (hdr.id=dtl.order_hdr_id) 
            LEFT OUTER JOIN items item 
                ON (item.id=dtl.item_id) 
            LEFT OUTER JOIN categories cat 
                ON (cat.id=item.category_id)
            LEFT OUTER JOIN subcategories sub
                ON (sub.id=item.subcategory_id)
        ORDER BY hdr.dttm_order DESC`);
    return result;
}

