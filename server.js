// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initWebSocket } = require('./lib/WebSocketServer');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare the Next.js app then start the server
app.prepare().then(() => {
  // Create the HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  // Initialize WebSocket server
  initWebSocket(server);
  
  // Set up cleanup handlers for graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  function gracefulShutdown() {
    console.log('Received kill signal, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
  
  // Start the server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
