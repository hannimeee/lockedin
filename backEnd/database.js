import mysql from 'mysql2';

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'mypassword',
    database: 'notes_app'
}).promise();

const result = await pool.query("SELECT * FROM notes");
console.log(result);