// leads.controller.js
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';

// Path to store uploaded leads in JSON format
const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

/**
 * Parse a CSV buffer into an array of objects.
 * Uses a readable stream to process the CSV in memory.
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array<Object>>} - Parsed CSV rows
 */
function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const leads = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(
        csvParser({
          skipLines: 0,
          mapHeaders: ({ header }) => header.trim(), // trim whitespace from headers
        })
      )
      .on('data', (row) => leads.push(row)) // Collect each row
      .on('end', () => resolve(leads))      // Resolve promise when done
      .on('error', (err) => reject(err));   // Reject on any parse error
  });
}

/**
 * Controller for uploading leads CSV.
 * Normalizes keys to lowercase, trims values, and writes to JSON file.
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
const uploadCsv = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw { status: 400, message: 'CSV file is required under field name "file"' };
    }

    const raw = req.file.buffer;

    // Basic sanity check: first 1KB should contain commas or newlines
    const sample = raw.slice(0, 1000).toString('utf-8');
    if (!/[,\\n]/.test(sample)) {
      throw { status: 400, message: 'Uploaded file does not appear to be CSV' };
    }

    // Parse CSV buffer into array of objects
    const leads = await parseCsvBuffer(raw);

    // Normalize keys: lowercase headers and trim all values
    const normalized = leads.map((row) => {
      const normalizedRow = {};
      Object.keys(row).forEach((key) => {
        const val = row[key] === undefined ? '' : String(row[key]).trim();
        normalizedRow[key.trim().toLowerCase()] = val;
      });

      // Return consistent object structure for each lead
      return {
        name: normalizedRow['name'] || '',
        role: normalizedRow['role'] || '',
        company: normalizedRow['company'] || '',
        industry: normalizedRow['industry'] || '',
        location: normalizedRow['location'] || '',
        linkedin_bio: normalizedRow['linkedin_bio'] || normalizedRow['linkedin bio'] || '',
      };
    });

    // Write normalized leads to JSON file
    await fs.writeFile(LEADS_FILE, JSON.stringify(normalized, null, 2), 'utf-8');

    // Respond with success and number of leads
    res.status(201).json({ ok: true, count: normalized.length, leads_file: 'data/leads.json' });
  } catch (err) {
    // Pass error to centralized error handler
    next(err);
  }
};

// Export controller as default
export default { uploadCsv };
