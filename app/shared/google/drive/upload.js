const { google } = require('googleapis');
const { Readable } = require('stream');

function normalizeBody(body) {
  if (!body) {
    throw new Error('Missing file body');
  }

  if (typeof body === 'string') {
    return Readable.from(body);
  }

  if (Buffer.isBuffer(body)) {
    return Readable.from(body);
  }

  if (typeof body.pipe === 'function') {
    return body;
  }

  throw new Error(`Unsupported file body type: ${typeof body}`);
}

async function uploadFile({
  oAuth2Client,
  name,
  mimeType,
  body,
  folderId
}) {
  if (!oAuth2Client) throw new Error('Missing oAuth2Client');
  if (!name) throw new Error('Missing file name');

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const requestBody = { name };

  if (folderId) {
    requestBody.parents = [folderId];
  }

  const normalizedBody = normalizeBody(body);

  console.log('uploadFile body info:', {
    bodyType: typeof body,
    isBuffer: Buffer.isBuffer(body),
    hasPipe: typeof normalizedBody.pipe === 'function'
  });

  const response = await drive.files.create({
    requestBody,
    media: {
      mimeType: mimeType || 'text/plain',
      body: normalizedBody
    },
    fields: 'id,name,mimeType,webViewLink,webContentLink'
  });

  return response.data;
}

module.exports = {
  uploadFile
};