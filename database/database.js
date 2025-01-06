import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool =  mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();



export async function getUsers(){
    const [rows] = await pool.query('SELECT * FROM users;');
    return rows; 
}

export async function getUser(id){
    const [rows] = await pool.query(`
    SELECT * FROM users WHERE id= ?`,[id])

    return rows[0];
}

export async function addUser(user){
    const [result] = await pool.query(`
    INSERT INTO users (name)
    VALUES(?)
    `,[user])
    const insertId = result.insertId;
    return insertId;
}

