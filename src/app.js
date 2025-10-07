import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { errorHandler, notFound } from './utils/errorHandler.js';

// Create data directory if not exists
const DATA_DIR = path.join(process.cwd(), 'data'); // __dirname not available in ES6 modules, use process.cwd()
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


// Error Handling
app.use(notFound);
app.use(errorHandler);

// Export app (if you want to import in server.js)
export default app;
