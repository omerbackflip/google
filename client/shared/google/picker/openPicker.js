import { loadGoogleApis } from '../sdk/loadGoogleApis';
import { requestAccessToken } from '../auth/tokenClient';

function normalizePickedFile(doc) {
  return {
    fileId: doc.id,
    name: doc.name,
    mimeType: doc.mimeType,
    url: doc.url || null
  };
}

async function openPicker(config = {}) {
  const {
    clientId,
    apiKey,
    appId,
    scope,
    viewMimeTypes,
    multiselect = false
  } = config;

  if (!clientId) throw new Error('Missing Google clientId');
  if (!apiKey) throw new Error('Missing Google apiKey');
  if (!appId) throw new Error('Missing Google appId');
  if (!scope) throw new Error('Missing Google scope');

  await loadGoogleApis();
  const accessToken = await requestAccessToken({ clientId, scope });

  return new Promise((resolve, reject) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);

    if (viewMimeTypes) {
      view.setMimeTypes(viewMimeTypes);
    }

    const pickerBuilder = new window.google.picker.PickerBuilder()
      .setAppId(appId)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .addView(view)
      .setCallback((data) => {
        const action = data[window.google.picker.Response.ACTION];

        if (action === window.google.picker.Action.PICKED) {
          const docs = data[window.google.picker.Response.DOCUMENTS] || [];
          const files = docs.map(normalizePickedFile);

          resolve(multiselect ? files : files[0] || null);
          return;
        }

        if (action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      });

    if (multiselect) {
      pickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }

    try {
      const picker = pickerBuilder.build();
      picker.setVisible(true);
    } catch (error) {
      reject(error);
    }
  });
}

export { openPicker };