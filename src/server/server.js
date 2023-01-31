import http from 'http';
import app from './app.js';

const port = app.get('port');
const server = http.createServer(app);

server.on('error', onError);
server.on('listening', onListening);

function onListening() {
  const addr = server.address();
  const bind =
    typeof addr === 'string'
      ? 'pipe ' + addr.address
      : 'http://localhost:' + addr.port;
  const env = process.env.NODE_ENV || 'development';
  console.log('Listening on ' + bind + ' in ' + env + ' mode 🚀');
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

export default server;
