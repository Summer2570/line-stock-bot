```js
import { google } from 'googleapis';

const serviceAccount = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT
);

// แก้ปัญหา private key บน Render
serviceAccount.private_key =
  serviceAccount.private_key.replace(
    /\\n/g,
    '\n'
  );

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

    const rows = response.data.values || [];

    const result = rows.find((row) =>
      row[0]?.toLowerCase().includes(
        keyword.toLowerCase()
      )
    );

    if (!result) {
      return null;
    }

    return {
      code: result[0],
      name: result[1],
      stock: result[2]
    };

  } catch (error) {

    console.error(error);

    return null;
  }
}
```
