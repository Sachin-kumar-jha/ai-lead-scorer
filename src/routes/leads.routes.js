// leads.routes.js
import express from 'express';
import multer from 'multer';
import LeadsController from "../controllers/leads.controller.js";

// Create a router instance
const router = express.Router();

// Configure Multer for file uploads
// Memory storage is used since we process the file directly in memory
// File size limit is set to 2 MB
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 2 * 1024 * 1024 } 
});

/**
 * POST /upload
 * Upload a CSV file containing leads.
 * - Field name in the form-data: 'file'
 * - Processes the CSV, normalizes field names, and saves as JSON
 * - Returns JSON with:
 *   - ok: true
 *   - count: number of leads uploaded
 *   - leads_file: path to saved JSON file
 */
router.post('/upload', upload.single('file'), LeadsController.uploadCsv);

export default router;
