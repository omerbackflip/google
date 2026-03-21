const { google } = require('googleapis');

async function getFileMetadata({ oAuth2Client, fileId }) {
  if (!oAuth2Client) throw new Error('Missing oAuth2Client');
  if (!fileId) throw new Error('Missing fileId');

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const response = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,webViewLink,webContentLink,parents'
  });

  return response.data;
}

module.exports = {
  getFileMetadata
};