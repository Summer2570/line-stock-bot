import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const credentials = JSON.parse(
    readFileSync(join(__dirname, 'service-account.json'), 'utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = '1kaqVB5UmfJRYo7jDHQojCphPAmeujgLtVQttT4AwKe8';

function normalize(text = '') {
  return text.toString().trim().toUpperCase().replace(/[-\s]/g, '');
}

export async function findPart(keyword) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Actual Box!A:C'
    });

    const rows = response.data.values || [];
    const normalizedKeyword = normalize(keyword);
    const result = rows.find(row => normalize(row[0]) === normalizedKeyword);

    if (!result) return { found: false };

    return {
      found: true,
      code: result[0] || '-',
      name: result[1] || '-',
      stock: result[2] || '0'
    };

  } catch (error) {
    console.error('GOOGLE SHEET ERROR:', error.message);
    return { found: false };
  }
}