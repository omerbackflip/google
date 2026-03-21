const express = require('express');
const {
  createOAuthClient,
  generateAuthUrl,
  exchangeCodeForTokens,
  getScopes
} = require('../auth/oauth');
const { uploadFile } = require('../drive/upload');
const { getFileMetadata } = require('../drive/file');
const { ensureFolder } = require('../drive/folder');

function createGoogleRouter(config) {
  const router = express.Router();

  const {
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    tokenStore
  } = config || {};

  if (!tokenStore || typeof tokenStore.load !== 'function' || typeof tokenStore.save !== 'function') {
    throw new Error('A valid tokenStore with load() and save() is required');
  }

  const oAuth2Client = createOAuthClient({
    clientId,
    clientSecret,
    redirectUri
  });

  const savedTokens = tokenStore.load();
  if (savedTokens) {
    oAuth2Client.setCredentials(savedTokens);
  }

  function refreshCredentialsFromStore() {
    const latestTokens = tokenStore.load();
    if (!latestTokens) {
      throw new Error('Google is not connected');
    }
    oAuth2Client.setCredentials(latestTokens);
  }

  router.get('/auth', (req, res) => {
    const url = generateAuthUrl(oAuth2Client, getScopes(scopes));
    return res.redirect(url);
  });

  router.get('/callback', async (req, res) => {
    try {
      const { code } = req.query;
      const tokens = await exchangeCodeForTokens(oAuth2Client, code);
      tokenStore.save(tokens);

      return res.json({
        success: true,
        hasRefreshToken: Boolean(tokens.refresh_token)
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return res.status(500).json({
        success: false,
        error: 'Google OAuth failed'
      });
    }
  });

  router.get('/status', (req, res) => {
    const tokens = tokenStore.load();
    return res.json({
      success: true,
      connected: Boolean(tokens),
      tokenPath: typeof tokenStore.getPath === 'function' ? tokenStore.getPath() : null
    });
  });

  router.post('/upload-text', async (req, res) => {
    try {
      refreshCredentialsFromStore();

      const {
        name,
        content,
        mimeType,
        folderName,
        parentFolderId
      } = req.body || {};

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Missing file name'
        });
      }

      if (content === undefined || content === null) {
        return res.status(400).json({
          success: false,
          error: 'Missing file content'
        });
      }

      let folderId = parentFolderId || null;

      if (folderName) {
        const folder = await ensureFolder({
          oAuth2Client,
          folderName,
          parentId: parentFolderId || undefined
        });

        folderId = folder.id;
      }

      const file = await uploadFile({
        oAuth2Client,
        name,
        mimeType: mimeType || 'text/plain',
        body: Buffer.from(String(content), 'utf8'),
        folderId
      });

      return res.json({
        success: true,
        file
      });
    } catch (error) {
      console.error('Google upload-text error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Upload failed'
      });
    }
  });

  router.get('/file/:fileId', async (req, res) => {
    try {
      refreshCredentialsFromStore();

      const file = await getFileMetadata({
        oAuth2Client,
        fileId: req.params.fileId
      });

      return res.json({
        success: true,
        file
      });
    } catch (error) {
      console.error('Google file metadata error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Could not fetch file metadata'
      });
    }
  });

  return router;
}

module.exports = {
  createGoogleRouter
};