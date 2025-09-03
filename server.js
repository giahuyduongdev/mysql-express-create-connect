const PORT = 8080;

const app = require('./src/app');

const server = app.listen(PORT, () => {
  console.log(`Backend server start with port ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => console.log(`Exit Server Express`));
  // notify.send(ping ...)
});