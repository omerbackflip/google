const { google } = require('googleapis');

function createOAuthClient({
  clientId,
  clientSecret,
  redirectUri
}) {
  if (!clientId) throw new Error('Missing Google clientId');
  if (!clientSecret) throw new Error('Missing Google clientSecret');
  if (!redirectUri) throw new Error('Missing Google redirectUri');

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getScopes(scopes) {
  if (Array.isArray(scopes) && scopes.length) return scopes;
  if (typeof scopes === 'string' && scopes.trim()) {
    return scopes.split(',').map(s => s.trim()).filter(Boolean);
  }

  return ['https://www.googleapis.com/auth/drive.file'];
}

function generateAuthUrl(oAuth2Client, scopes) {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: getScopes(scopes)
  });
}

async function exchangeCodeForTokens(oAuth2Client, code) {
  if (!code) throw new Error('Missing authorization code');

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

module.exports = {
  createOAuthClient,
  generateAuthUrl,
  exchangeCodeForTokens,
  getScopes
};