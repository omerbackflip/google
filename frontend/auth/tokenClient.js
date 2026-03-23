let tokenClient = null;
let currentAccessToken = null;
let currentConfigKey = null;
let currentExpiryTime = null;

const CONSENT_KEY = 'google_picker_consent_granted';
const ACCESS_TOKEN_KEY = 'google_picker_access_token';
const EXPIRY_KEY = 'google_picker_access_token_expiry';

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

function loadStoredToken() {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const expiry = sessionStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  const expiryTime = Number(expiry);
  const now = Date.now();

  // small safety buffer of 60 seconds
  if (Number.isNaN(expiryTime) || now >= expiryTime - 60000) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    return null;
  }

  return {
    token,
    expiryTime
  };
}

function storeToken(accessToken, expiresInSeconds) {
  const expiryTime = Date.now() + (Number(expiresInSeconds || 3600) * 1000);

  currentAccessToken = accessToken;
  currentExpiryTime = expiryTime;

  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(EXPIRY_KEY, String(expiryTime));
  sessionStorage.setItem(CONSENT_KEY, 'true');
}

async function requestAccessToken(config) {
  const configKey = buildConfigKey(config);

  if (!tokenClient || currentConfigKey !== configKey) {
    tokenClient = createTokenClient(config);
    currentConfigKey = configKey;
    currentAccessToken = null;
    currentExpiryTime = null;
  }

  // 1. reuse in-memory token if still valid
  if (currentAccessToken && currentExpiryTime && Date.now() < currentExpiryTime - 60000) {
    return currentAccessToken;
  }

  // 2. reuse session token if still valid
  const stored = loadStoredToken();
  if (stored) {
    currentAccessToken = stored.token;
    currentExpiryTime = stored.expiryTime;
    return currentAccessToken;
  }

  const hasGrantedConsent = sessionStorage.getItem(CONSENT_KEY) === 'true';

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response && response.error) {
        reject(new Error(response.error));
        return;
      }

      storeToken(response.access_token, response.expires_in);
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
  currentExpiryTime = null;
  sessionStorage.removeItem(CONSENT_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(EXPIRY_KEY);
}

export {
  requestAccessToken,
  getAccessToken,
  clearAccessToken
};