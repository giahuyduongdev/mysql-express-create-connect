const mysql = require('mysql2/promise');

const poolConnection = mysql.createPool({
  host: 'localhost',
  user: 'testuser',
  port: '3308',
  password: 'testpass',
  database: 'aliconcon',
  connectionLimit: 10,
});





module.exports = poolConnection;