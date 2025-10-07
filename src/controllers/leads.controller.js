import csvParser from 'csv-parser';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const leads = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(csvParser({ skipLines: 0, mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => leads.push(row))
      .on('end', () => resolve(leads))
      .on('error', (err) => reject(err));
  });
}

const uploadCsv = async (req, res, next) => {
  try {
    if (!req.file) throw { status: 400, message: 'CSV file is required under field name "file"' };

    const raw = req.file.buffer;
    const sample = raw.slice(0, 1000).toString('utf-8');
    if (!/[,\\n]/.test(sample)) throw { status: 400, message: 'Uploaded file does not appear to be CSV' };

    const leads = await parseCsvBuffer(raw);

    const normalized = leads.map((r) => {
      const keys = Object.keys(r);
      const out = {};
      keys.forEach((k) => {
        const val = r[k] === undefined ? '' : String(r[k]).trim();
        out[k.trim().toLowerCase()] = val;
      });
      return {
        name: out['name'] || '',
        role: out['role'] || '',
        company: out['company'] || '',
        industry: out['industry'] || '',
        location: out['location'] || '',
        linkedin_bio: out['linkedin_bio'] || out['linkedin bio'] || ''
      };
    });

    await fs.writeFile(LEADS_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    res.status(201).json({ ok: true, count: normalized.length, leads_file: 'data/leads.json' });
  } catch (err) {
    next(err);
  }
};

export default { uploadCsv };
