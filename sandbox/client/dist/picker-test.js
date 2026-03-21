(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // frontend/sdk/loadGoogleApis.js
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  function loadGisScript() {
    if (!gisScriptPromise) {
      gisScriptPromise = loadScript("https://accounts.google.com/gsi/client");
    }
    return gisScriptPromise;
  }
  function loadGapiScript() {
    if (!gapiScriptPromise) {
      gapiScriptPromise = loadScript("https://apis.google.com/js/api.js");
    }
    return gapiScriptPromise;
  }
  async function loadPickerApi() {
    if (!pickerApiPromise) {
      pickerApiPromise = (async () => {
        await loadGapiScript();
        await new Promise((resolve, reject) => {
          window.gapi.load("picker", {
            callback: resolve,
            onerror: () => reject(new Error("Failed to load Google Picker API"))
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
  var gisScriptPromise, gapiScriptPromise, pickerApiPromise;
  var init_loadGoogleApis = __esm({
    "frontend/sdk/loadGoogleApis.js"() {
      gisScriptPromise = null;
      gapiScriptPromise = null;
      pickerApiPromise = null;
    }
  });

  // frontend/auth/tokenClient.js
  function buildConfigKey(config) {
    return JSON.stringify({
      clientId: config.clientId,
      scope: config.scope
    });
  }
  function createTokenClient(config) {
    const { clientId, scope } = config || {};
    if (!clientId) throw new Error("Missing Google clientId");
    if (!scope) throw new Error("Missing Google scope");
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error("Google Identity Services is not loaded");
    }
    return window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: () => {
      }
    });
  }
  async function requestAccessToken(config) {
    const configKey = buildConfigKey(config);
    if (!tokenClient || currentConfigKey !== configKey) {
      tokenClient = createTokenClient(config);
      currentConfigKey = configKey;
      currentAccessToken = null;
    }
    const hasGrantedConsent = sessionStorage.getItem(CONSENT_KEY) === "true";
    return new Promise((resolve, reject) => {
      tokenClient.callback = (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
          return;
        }
        currentAccessToken = response.access_token;
        sessionStorage.setItem(CONSENT_KEY, "true");
        resolve(currentAccessToken);
      };
      tokenClient.requestAccessToken({
        prompt: hasGrantedConsent ? "" : "consent"
      });
    });
  }
  var tokenClient, currentAccessToken, currentConfigKey, CONSENT_KEY;
  var init_tokenClient = __esm({
    "frontend/auth/tokenClient.js"() {
      tokenClient = null;
      currentAccessToken = null;
      currentConfigKey = null;
      CONSENT_KEY = "google_picker_consent_granted";
    }
  });

  // frontend/picker/openPicker.js
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
    if (!clientId) throw new Error("Missing Google clientId");
    if (!apiKey) throw new Error("Missing Google apiKey");
    if (!appId) throw new Error("Missing Google appId");
    if (!scope) throw new Error("Missing Google scope");
    await loadGoogleApis();
    const accessToken = await requestAccessToken({ clientId, scope });
    return new Promise((resolve, reject) => {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
      if (viewMimeTypes) {
        view.setMimeTypes(viewMimeTypes);
      }
      const pickerBuilder = new window.google.picker.PickerBuilder().setAppId(appId).setOAuthToken(accessToken).setDeveloperKey(apiKey).addView(view).setCallback((data) => {
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
  var init_openPicker = __esm({
    "frontend/picker/openPicker.js"() {
      init_loadGoogleApis();
      init_tokenClient();
    }
  });

  // frontend/index.js
  var init_google = __esm({
    "frontend/index.js"() {
      init_openPicker();
    }
  });

  // sandbox/client/picker-test.js
  var require_picker_test = __commonJS({
    "sandbox/client/picker-test.js"() {
      init_google();
      var resultEl = document.getElementById("result");
      var button = document.getElementById("pick-file-btn");
      button.addEventListener("click", async () => {
        resultEl.textContent = "Opening picker...";
        try {
          const file = await openPicker({
            clientId: window.SANDBOX_GOOGLE_CONFIG.clientId,
            apiKey: window.SANDBOX_GOOGLE_CONFIG.apiKey,
            appId: window.SANDBOX_GOOGLE_CONFIG.appId,
            scope: window.SANDBOX_GOOGLE_CONFIG.scope
          });
          resultEl.textContent = JSON.stringify(file, null, 2);
        } catch (error) {
          resultEl.textContent = `Error: ${error.message}`;
          console.error(error);
        }
      });
    }
  });
  require_picker_test();
})();
