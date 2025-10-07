// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Custom middleware for error handling
import { errorHandler, notFound } from './utils/errorHandler.js';

// Route modules
import offerRoutes from "./routes/offer.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import scoreRoutes from "./routes/score.routes.js";

// ------------------------------
// 1. Ensure data storage directory exists
// ------------------------------
const DATA_DIR = path.join(process.cwd(), 'data'); // Use process.cwd() since __dirname is not available in ES modules
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ------------------------------
// 2. Initialize Express app
// ------------------------------
const app = express();

// ------------------------------
// 3. Middleware setup
// ------------------------------
app.use(cors()); // Enable Cross-Origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger for development

// ------------------------------
// 4. API Routes
// ------------------------------
// Offer routes: POST /offer, GET /offer
app.use('/offer', offerRoutes);

// Leads routes: POST /leads/upload
app.use('/leads', leadsRoutes);

// Scoring and results routes: POST /score, GET /results, GET /export
app.use('/', scoreRoutes);

// ------------------------------
// 5. Error handling middleware
// ------------------------------
// Handle 404 not found
app.use(notFound);

// Handle all other errors
app.use(errorHandler);

// ------------------------------
// 6. Export the app instance
// ------------------------------
export default app;
