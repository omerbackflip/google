import axios from 'axios';
import { openPicker } from './openPicker';
import { getGoogleConfig } from '../config';

async function pickGoogleDriveFile(options = {}) {
  const {
    viewMimeTypes,
    multiselect = false,
    folderId = null,
    includeFolders = true,
  } = options;

  const {
    pickerTokenUrl,
    clientId,
    apiKey,
    appId,
    scope
  } = getGoogleConfig();

  const response = await axios.get(pickerTokenUrl);

  if (!response.data || !response.data.success || !response.data.access_token) {
    if (response.data && response.data.authUrl) {
      window.open(response.data.authUrl, '_self');
      return null;
    }

    throw new Error('Could not get Google Picker token');
  }

  return await openPicker({
    clientId,
    apiKey,
    appId,
    scope,
    accessToken: response.data.access_token,
    viewMimeTypes,
    multiselect,
    folderId,
    includeFolders,
  });
}

export { pickGoogleDriveFile };