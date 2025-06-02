<template>
  <v-container>
    <v-btn color="primary" @click="onPick">Pick from Google Drive</v-btn>
  </v-container>
</template>

<script>
import { loadGoogleApis } from '@/utils/google';

/* global gapi, google */
export default {
  name: 'GooglePicker',
  data() {
    return {
      developerKey: 'AIzaSyB7JIngRxWywC2D2Ua92lYjbO7U4igfwSk',
      clientId: '637353594442-lni84kg5hrusl50efhthp99ncdc0ufqv.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      pickerApiLoaded: false,
      tokenClient: null,
      oauthToken: null,
      requestedSilently: false,
    };
  },
  async mounted() {
    await loadGoogleApis();

    gapi.load('client', async () => {
      await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    });

    gapi.load('picker', this.onPickerApiLoad);

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scope,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          console.error(tokenResponse);
          return;
        }
        this.oauthToken = tokenResponse.access_token;
        this.createPicker();
      },
    });
  },

  methods: {
    onPickerApiLoad() {
      this.pickerApiLoaded = true;
    },

    onPick() {
      // First try: silent (no prompt), works if user previously consented
      if (!this.requestedSilently) {
        this.requestedSilently = true;
        this.tokenClient.requestAccessToken({ prompt: '' });
        return;
      }

      // Second attempt (silent failed): show consent popup
      if (!this.oauthToken) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.createPicker();
      }
    },

    createPicker() {
      if (this.pickerApiLoaded && this.oauthToken) {
        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS)
          .setOAuthToken(this.oauthToken)
          .setDeveloperKey(this.developerKey)
          .setAppId('637353594442')
          .setCallback(this.pickerCallback)
          .build();
        picker.setVisible(true);
      } else {
        console.warn('Picker not ready');
      }
    },

    pickerCallback(data) {
      if (data.action === google.picker.Action.PICKED) {
        const file = data.docs[0];
        alert(`You picked: ${file.name}`);
        console.log(file);
      }
    },
  },
};
</script>
