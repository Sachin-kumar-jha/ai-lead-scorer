// Import Node's HTTP module
import http from 'http';

// Import the Express app instance
import app from './app.js';

// Define the port from environment variable or default to 8787
const PORT = process.env.PORT || 8787;

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Start the server and log the listening port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Optional: handle server errors gracefully
server.on('error', (err) => {
  console.error('Server error:', err);
});
