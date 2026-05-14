import { google } from 'googleapis';
import serviceAccount from '../service-account.json' with { type: 'json' };

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets'
  ]
});

const sheets = google.sheets({
  version: 'v4',
  auth
});

const SHEET_ID =
  '1kaqVB5UmfJRYo7jDHQojCphPAmeujgLtVQttT4AwKe8';

function normalize(text = '') {

  return text
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[-\s]/g, '');
}

export async function findPart(keyword) {

  try {

    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Actual Box!A2:C'
      });

    const rows =
      response.data.values || [];

    console.log(rows);

    const normalizedKeyword =
      normalize(keyword);

    console.log(
      'SEARCH:',
      normalizedKeyword
    );

    const result = rows.find((row) => {

      const code =
        normalize(row[0]);

      console.log(
        'COMPARE:',
        code,
        normalizedKeyword
      );

      return (
        code.includes(normalizedKeyword)
      );
    });

    if (!result) {

      return {
        found: false
      };
    }

    return {
      found: true,
      code: result[0] || '-',
      name: result[1] || '-',
      stock: result[2] || '0'
    };

  } catch (error) {

    console.error(
      'GOOGLE SHEET ERROR:',
      error
    );

    return {
      found: false
    };
  }
}