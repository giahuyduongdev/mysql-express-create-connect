const express = require('express');
const app = express();
const morgan = require('morgan');
const responseTime = require('response-time');
const { createRateLimiter } = require('./middlewares/ratelimit');
const getConnection = require('./dbs/normal');
const poolConnection = require('./dbs/pool2');

// init middlewares
app.use(morgan('dev'));
app.use(responseTime());
app.use(createRateLimiter(20));


app.get('/normal', async (req, res) => {
  try {
    const conn = await getConnection();
    const [results, fields] = await conn.execute('Select * from user');
    res.json(results);
    conn.end();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to load user due to database error.',
      details: error.message
    });
  };
})


app.get('/pool', async (req, res) => {
  let connection;
  try {
    connection = await poolConnection.getConnection();
    const [results, fields] = await connection.execute('SELECT * FROM user');
    res.json(results);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to load users due to database error.',
      details: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/pool2', async (req, res) => {
  try {
    const [results, fields] = await poolConnection.execute('Select * from user');
    res.json(results);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to load user due to database error.',
      details: error.message
    });
  };
})






module.exports = app;