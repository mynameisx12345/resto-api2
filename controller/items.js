import mysql from 'mysql2';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

const pool =  mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, '/uploads')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
//   })
  
//   const upload = multer({ storage: storage })
//   app.post('/profile', upload.single('avatar'), function (req, res, next) {
//     // req.file is the `avatar` file
//     // req.body will hold the text fields, if there were any
//   })

export async function addUser(user){
    const [result] = await pool.query(`
    INSERT INTO users (name)
    VALUES(?)
    `,[user])
    const insertId = result.insertId;
    return insertId;
}

export async function addCategory(category){
    const [result] = await pool.query(`
    INSERT INTO categories (name)
    VALUES(?)
    `,[category])

    const insertId = result.insertId;
    return insertId;
}

export async function addSubcategory(name, categoryId){
    const [result] = await pool.query(`
        INSERT INTO subcategories (name, category_id)
        VALUES(?,?)
    `,[name, categoryId])

    const insertId = result.insertId;
    return insertId;
}

export async function removeSubcategories(categoryId){
    // const [result] = await pool.query(`
    //     DELETE FROM subcategories
    //     WHERE category_id = ?
    // `,[categoryId])

    const [result] = await pool.query(`
        UPDATE subcategories
        SET isDeleted = true
        WHERE category_id = ?
    `,[categoryId])

    return result;
}

export async function newCategory(body){
    const {id, category,subcategories} = body;
    
    const categoryId = await addCategory(category);
   // const deleteSubcatRes = await removeSubcategories(id);
  
   const subcatIds = await Promise.all(subcategories.map( (subcategory)=> addSubcategory(subcategory.subcategory, categoryId)));

    const result = {
        id: categoryId, 
        category: category, 
        subcategories:subcategories.map((subcategory,index)=> ({id:subcatIds[index], subcategory: subcategory.subcategory}))
    }
   
    return result
}

export async function updateCategory(id,category){
    const [result] = await pool.query(`
        UPDATE categories
        SET name = ?
        WHERE id = ?
    `,[category,id]);

    return id;
}

export async function updateCategoryNow(body){
    const {id, category,subcategories} = body;

    const categoryId = await updateCategory(id, category);
    const deleteSubcatRes = await removeSubcategories(id);
   const subcatIds = await Promise.all(subcategories.map( (subcategory)=> addSubcategory(subcategory.subcategory, categoryId)));

   const result = {
        id: categoryId, 
        category: category, 
        subcategories:subcategories.map((subcategory,index)=> ({id:subcatIds[index], subcategory: subcategory.subcategory}))
    }
    return result;
}



export async function getCategory(id){
    const [result] = await pool.query(`
        SELECT cat.id, cat.name category, subcat.id subcat_id, subcat.name subcategory FROM categories cat LEFT JOIN subcategories subcat
            ON (cat.id = subcat.category_id)
        WHERE cat.id = ? AND
            cat.isDeleted IS NULL AND
            subcat.isDeleted IS NULL
    `,[id]);
    let parsed = []
    result.forEach((res)=>{
        let onParsed = parsed.find((parse)=>parse.id ===res.id)
        if(onParsed){
            onParsed.subcategories.push({id:res.subcat_id, subcategory:res.subcategory})
        } else {
            const subcategories = res.subcat_id ? [{id:res.subcat_id,subcategory:res.subcategory}] : []
            parsed.push({id:res.id, category: res.category, subcategories:subcategories})
        }
    })
    console.log(parsed)
    return parsed
}

export async function getCategories(){
    const [result] = await pool.query(`
    SELECT cat.id, cat.name category, subcat.id subcat_id, subcat.name subcategory FROM categories cat LEFT JOIN subcategories subcat
    ON (cat.id = subcat.category_id)
    WHERE cat.isDeleted IS NULL AND
        subcat.isDeleted IS NULL
    `);
   
    let parsed = []
    result.forEach((res)=>{
        let onParsed = parsed.find((parse)=>parse.id ===res.id)
        if(onParsed){
            onParsed.subcategories.unshift({id:res.subcat_id, subcategory:res.subcategory})
        } else {
            const subcategories = res.subcat_id ? [{id:res.subcat_id,subcategory:res.subcategory}] : []
            parsed.push({id:res.id, category: res.category, subcategories:subcategories})
        }
    })
    return parsed
}

export async function removeCategory(id){

    const deleteSubcatRes = await removeSubcategories(id);
    // const [result] = await pool.query(`
    //     DELETE FROM categories WHERE
    //     id = ?
    // `,[id]);

    const [result] = await pool.query(`
        UPDATE categories
        SET isDeleted = true
        WHERE id = ?
    `,[id])

    return result;
}

export async function addItem(body){
    const {id, name, description, imagePath, categoryId, subcategoryId } = body;
    const subcategorySql = subcategoryId ? ',subcategory_id' : '';
    const subcategorySqlA = subcategoryId ? ',?' : ''
    let data = [name,description,imagePath,categoryId];
    if(subcategoryId){
        data.push(subcategoryId)
    }
    const [result] = await pool.query(`
        INSERT INTO items (name, description, image_path, category_id${subcategorySql})
        VALUES(?,?,?,?${subcategorySqlA})
    `,[name,description,imagePath,categoryId,subcategoryId]);

    const insertId = result.insertId;
    return insertId;
}

export async function getItems(){
    const [result] = await pool.query(`
    SELECT items.id, 
        items.name, 
        items.description,
        items.category_id categoryId,
        categories.name categoryName, 
        items.subcategory_id subcategoryId, 
        subcat.name subcategoryName, 
        items.image_path imagePath,
        (SELECT json_objectagg(size,price) FROM prices WHERE item_id=items.id) as prices
    FROM items 
    LEFT OUTER JOIN categories ON (items.category_id=categories.id) 
    LEFT OUTER JOIN subcategories subcat ON (items.subcategory_id=subcat.id)
    WHERE items.isDeleted IS NULL
    ORDER BY items.id DESC;
    `)


    return result;
}

export async function updateItem(body){
    const {id, name, description, categoryId, subcategoryId, imagePath} = body;
    const subcategorySql = subcategoryId ? 'subcategory_id=?,' : '';
    let data = [name,description, categoryId, subcategoryId,imagePath,id];
    let subcategoryIdRe = subcategoryId;
    if(subcategoryId===''){
        subcategoryIdRe = null;
    }
    console.log('data', data)
    const [result] = await pool.query(`
        UPDATE items
        SET name=?,
            description=?,
            category_id=?,
            subcategory_id=?,
            image_path=?
        WHERE id=?
    `,[name,description, categoryId, subcategoryIdRe,imagePath,id])

    return {
      ...body
    }
}

export async function removeItem(id){
    // const [result] = await pool.query(`
    //     DELETE FROM items 
    //     WHERE id=?
    // `,[id]);

    const [result] = await pool.query(`
        UPDATE items
        SET isDeleted = true
        WHERE id = ?
    `,[id])

    return result;
}

export async function addPrice(itemId,size,price){
    const [result] = await pool.query(`
        INSERT INTO prices (item_id, size, price)
        VALUES(?,?,?)
    `,[itemId,size,price]);

    return {
        id:result.insertId,
        size,
        price
    }
}

export async function removePriceAll(itemId){
    const [result] = await pool.query(`
        DELETE FROM prices
        WHERE item_id=?
    `,[itemId])

    return result;
}

export async function addPrices(body){
    const {itemId, prices} =body;

    const deleteRes = await removePriceAll(itemId);

   const pricesIds =  await Promise.all(
    prices.map((price)=>addPrice(itemId,price.size,price.price))
   );

   return {
    itemId: itemId,
    prices: [pricesIds]
   }
}