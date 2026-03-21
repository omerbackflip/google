const { google } = require('googleapis');

async function ensureFolder({
  oAuth2Client,
  folderName,
  parentId
}) {
  if (!oAuth2Client) throw new Error('Missing oAuth2Client');
  if (!folderName) throw new Error('Missing folderName');

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  let query = [
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `name = '${String(folderName).replace(/'/g, "\\'")}'`
  ];

  if (parentId) {
    query.push(`'${parentId}' in parents`);
  }

  const existing = await drive.files.list({
    q: query.join(' and '),
    fields: 'files(id,name)',
    pageSize: 1
  });

  if (existing.data.files && existing.data.files.length) {
    return existing.data.files[0];
  }

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {})
    },
    fields: 'id,name'
  });

  return created.data;
}

module.exports = {
  ensureFolder
};