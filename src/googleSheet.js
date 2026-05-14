import { google } from 'googleapis';

const sheets = google.sheets({
  version: 'v4'
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
        range: 'Actual Box!A:C'
      });

    const rows =
      response.data.values || [];

    console.log('ROWS:', rows);

    const normalizedKeyword =
      normalize(keyword);

    const result = rows.find((row) => {

      const code =
        normalize(row[0]);

      return code === normalizedKeyword;
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