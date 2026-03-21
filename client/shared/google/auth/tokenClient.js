let tokenClient = null;
let currentAccessToken = null;
let currentConfigKey = null;

const CONSENT_KEY = 'google_picker_consent_granted';

function buildConfigKey(config) {
  return JSON.stringify({
    clientId: config.clientId,
    scope: config.scope
  });
}

function createTokenClient(config) {
  const { clientId, scope } = config || {};

  if (!clientId) throw new Error('Missing Google clientId');
  if (!scope) throw new Error('Missing Google scope');

  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    throw new Error('Google Identity Services is not loaded');
  }

  return window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope,
    callback: () => {}
  });
}

async function requestAccessToken(config) {
  const configKey = buildConfigKey(config);

  if (!tokenClient || currentConfigKey !== configKey) {
    tokenClient = createTokenClient(config);
    currentConfigKey = configKey;
    currentAccessToken = null;
  }

  const hasGrantedConsent = sessionStorage.getItem(CONSENT_KEY) === 'true';

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response && response.error) {
        reject(new Error(response.error));
        return;
      }

      currentAccessToken = response.access_token;
      sessionStorage.setItem(CONSENT_KEY, 'true');
      resolve(currentAccessToken);
    };

    tokenClient.requestAccessToken({
      prompt: hasGrantedConsent ? '' : 'consent'
    });
  });
}

function getAccessToken() {
  return currentAccessToken;
}

function clearAccessToken() {
  currentAccessToken = null;
  sessionStorage.removeItem(CONSENT_KEY);
}

export {
  requestAccessToken,
  getAccessToken,
  clearAccessToken
};