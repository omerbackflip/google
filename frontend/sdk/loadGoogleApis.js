let gisScriptPromise = null;
let gapiScriptPromise = null;
let pickerApiPromise = null;

function loadScript(src, isReady) {
  if (isReady()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      const checkReady = () => {
        if (isReady()) {
          resolve();
          return true;
        }
        return false;
      };

      if (checkReady()) {
        return;
      }

      existing.addEventListener('load', () => {
        if (checkReady()) return;
        resolve();
      }, { once: true });

      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadGisScript() {
  if (!gisScriptPromise) {
    gisScriptPromise = loadScript(
      'https://accounts.google.com/gsi/client',
      () => !!(window.google && window.google.accounts && window.google.accounts.oauth2)
    );
  }
  return gisScriptPromise;
}

function loadGapiScript() {
  if (!gapiScriptPromise) {
    gapiScriptPromise = loadScript(
      'https://apis.google.com/js/api.js',
      () => !!window.gapi
    );
  }
  return gapiScriptPromise;
}

async function loadPickerApi() {
  if (!pickerApiPromise) {
    pickerApiPromise = (async () => {
      await loadGapiScript();

      if (window.google && window.google.picker) {
        return;
      }

      await new Promise((resolve, reject) => {
        window.gapi.load('picker', {
          callback: resolve,
          onerror: () => reject(new Error('Failed to load Google Picker API'))
        });
      });
    })();
  }

  return pickerApiPromise;
}

async function loadGoogleApis() {
  await Promise.all([
    loadGisScript(),
    loadPickerApi()
  ]);
}

export {
  loadGoogleApis
};