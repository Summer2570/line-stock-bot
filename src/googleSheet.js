import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
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
