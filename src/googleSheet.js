import { google } from 'googleapis';

const auth =
  new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  });

const sheets =
  google.sheets({
    version: 'v4',
    auth
  });

const SHEET_ID =
  '1kaqVB5UMfJRYo7jDHQojCphPAmeujgLtVQttT4AwKe8';

export async function findPart(
  keyword
) {

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,

      // เปลี่ยนชื่อ tab ให้ตรง
      range: "'Actual Box'!A:E"
    });

  const rows =
    response.data.values || [];

  for (
    let i = 1;
    i < rows.length;
    i++
  ) {

    const row = rows[i];

    const boxNo =
      row[0];

    if (
      boxNo &&
      boxNo
        .toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
    ) {

      return {
        found: true,

        boxNo:
          row[0] || '-',

        tpBox:
          row[1] || '-',

        totalBox:
          row[2] || '-',

        supplier:
          row[3] || '-',

        customer:
          row[4] || '-'
      };
    }
  }

  return {
    found: false
  };
}