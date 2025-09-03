const mysql = require('mysql2/promise');

const getConnection = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'testuser',
    port: '3308',
    password: 'testpass',
    database: 'aliconcon',
    insecureAuth: true
  });
};

module.exports = getConnection;