let googleConfig = null;

function setGoogleConfig(config) {
  googleConfig = config;
}

function getGoogleConfig() {
  if (!googleConfig) {
    throw new Error('Google config is not set. Call setGoogleConfig() first.');
  }
  return googleConfig;
}

export {
  setGoogleConfig,
  getGoogleConfig
};