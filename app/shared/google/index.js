const { createGoogleRouter } = require('./routes/google.routes');
const { createFileTokenStore } = require('./auth/fileTokenStore');
const { createOAuthClient } = require('./auth/oauth');
const { uploadFile } = require('./drive/upload');
const { getFileMetadata } = require('./drive/file');
const { ensureFolder } = require('./drive/folder');

module.exports = {
  createGoogleRouter,
  createFileTokenStore,
  createOAuthClient,
  uploadFile,
  getFileMetadata,
  ensureFolder
};