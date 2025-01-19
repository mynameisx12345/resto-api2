import mysql from 'mysql2';
import dotenv, { parse } from 'dotenv';
import multer from 'multer';
dotenv.config();

const pool =  mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function updateUser(body){
    const {id, name, username, password} = body;
    const [result] =  await pool.query(`
        UPDATE users 
        SET name = ?,
            username= ?,
            password = ?
        WHERE id = ?
    `,[name, username, password, id])

    return {
        ...body
    };
}

export async function newUser(body){
    const {id,name, username, password} = body;
    const [result] =  await pool.query(`
        INSERT INTO users (name,username, password)
        VALUES (?,?,?)
    `,[name,username, password])

    return {
        ...body,
        id: result.insertId
    };
}

export async function savePageAccess(body){
    const {id,pageAccess} = body;
    const [deleteResult] = await pool.query(`
        DELETE FROM page_access
        WHERE user_id = ?
    `,[id]);

    const addNewPage = async (access) =>{
        const [result] = await pool.query(`
            INSERT INTO page_access (user_id, page_id)
            VALUES(?,?)
        `,[id, access])

        return {
            id: result.insertId,
            userId: id,
            pageId: access
        }
    }

    const  addedPages = await Promise.all(pageAccess.map(access=>addNewPage(access)));

    return addedPages;
}

export async function saveCategoryAccess(body){
    const {id, categoryAccess} = body;
    const [deleteResult] = await pool.query(`
        DELETE FROM category_access
        WHERE user_id = ?
    `,[id]);

    const addNewCategory = async (access)=>{
        const [result] = await pool.query(`
            INSERT INTO category_access (user_id, category_id)
            VALUES (?,?)
        `,[id,access]);

        return {
            id: result.insertId,
            userId: id,
            categoryId: access
        }
    }

    const addedCategories = await Promise.all(categoryAccess.map(access=>addNewCategory(access)));

    return addedCategories;
}

export async function saveSubcategoryAccess(body){
    const {id, subcategoryAccess} = body;
    const [deleteResult] = await pool.query(`
        DELETE FROM subcategory_access
        WHERE user_id = ?
    `,[id]);

    const addNewSubctegory = async (access)=>{
        const [result] = await pool.query(`
            INSERT INTO subcategory_access (user_id, subcategory_id)
            VALUES(?,?)
        `,[id, access])

        return {
            id: result.insertId,
            userId:id,
            subcategoryId: access
        }
    }

    const addSubcategories = await Promise.all(subcategoryAccess.map(access=>addNewSubctegory(access)));
    return addSubcategories;
}



export async function saveUser(body){
    const {id, name, pageAccess, categoryAccess, username} = body;

    if(!id){
        const [checkUsername] = await pool.query(`
        SELECT count(*) count_exist FROM users
        WHERE username = ? AND
            isDeleted IS NULL
    `,[username.toLowerCase()])

    console.log('check',checkUsername)

        if(checkUsername[0].count_exist > 0){
            return {
                hasError: true,
                message: 'Username Exists'
            }
        }

    }
    

    let userRes = null;
    if(id){
       userRes =  await updateUser(body);
    } else {
        userRes = await newUser(body);
    }

    const newPageAccess = await savePageAccess({...body,id:userRes.id});
    const newCategoryAccess = await saveCategoryAccess({...body,id:userRes.id});
    const newSubcategoryAccess = await saveSubcategoryAccess({...body, id:userRes.id})
    return {
        ...userRes,
        pageAccess: newPageAccess,
        categoryAccess: newCategoryAccess,
        subcategoryAccess: newSubcategoryAccess,
        hasError:false
    }   
}

export async function removeUser(id){
    const [res] = await pool.query(`
        UPDATE users
        SET isDeleted = true
        WHERE id = ?
    `,[id])

    return res;
}


function parseUser(result){
    let parsedResult = [];

    result.forEach(res=>{
        const parsedResultF = parsedResult.find(parse=>parse.id === res.id);
        if(parsedResultF){
            const _pageAccess = parsedResultF?.pageAccess.find(access=>access === res.page_id);
            if(!_pageAccess){
                parsedResultF.pageAccess.push(res.page_id)
            }

            const _categoryAccess = parsedResultF?.categoryAccess.find(access=>access === res.category_id);
            if(!_categoryAccess){
                parsedResultF.categoryAccess.push(res.category_id)
            }

            const _subcategoryAccess = parsedResultF?.subcategoryAccess.find(access=>access === res.subcategory_id);
            if(!_subcategoryAccess){
                parsedResultF.subcategoryAccess.push(res.subcategory_id)
            }
        } else {
            parsedResult.push({
                id:res.id, 
                username: res.username, 
                password:res.password,
                name: res.name,
                pageAccess: [res.page_id],
                categoryAccess: [res.category_id],
                subcategoryAccess:[res.subcategory_id]
            })
        }
    });

    return parsedResult;
}


export async function getUsers(){
    const [result] = await pool.query(`
        SELECT users.id,
            users.username,
            users.password,
            users.name,
            page_access.page_id,
            category_access.category_id,
            subcategory_access.subcategory_id
        FROM users LEFT OUTER JOIN page_access ON (users.id = page_access.user_id)
            LEFT OUTER JOIN category_access ON (users.id = category_access.user_id)
            LEFT OUTER JOIN subcategory_access ON (users.id = subcategory_access.user_id)
        WHERE users.isDeleted IS NULL
        ORDER BY users.id DESC
    `);

    let parsedResult = parseUser(result);



    return parsedResult
}

export async function login(body){
    const {username, password} = body
   

    const [result] = await pool.query(`
        SELECT users.id,
            users.username,
            users.password,
            users.name,
            page_access.page_id,
            category_access.category_id,
            subcategory_access.subcategory_id
        FROM users LEFT OUTER JOIN page_access ON (users.id = page_access.user_id)
            LEFT OUTER JOIN category_access ON (users.id = category_access.user_id)
            LEFT OUTER JOIN subcategory_access ON (users.id = subcategory_access.user_id)
        WHERE users.isDeleted IS NULL AND
            username = ? AND
            password = ?
    `,[username,password]);

    return parseUser(result);
}