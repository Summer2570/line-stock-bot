import { google } from 'googleapis';
// import serviceAccount from './line-stock-bot-496106-65a1c9bdedeb.json' with { type: 'json' };
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

export async function findPart(keyword) {

  try {

    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A2:C'
      });

    const rows =
      response.data.values || [];

    const result = rows.find((row) =>
      row[0]
        ?.toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
    );

    if (!result) {
      return null;
    }

    return {
      found: true,
      code: result[0],
      name: result[1],
      stock: result[2]
    };

  } catch (error) {

    console.error(error);

    return null;
  }
}