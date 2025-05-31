<template>
  <v-container>
    <v-btn color="primary" @click="onPick">Pick from Google Drive</v-btn>
    <v-btn color="primary" @click="logout">logout</v-btn>
  </v-container>
</template>

<script>
/* global gapi, google */
export default {
  name: 'GooglePicker',
  data() {
    return {
      developerKey: 'AIzaSyB7JIngRxWywC2D2Ua92lYjbO7U4igfwSk',
      clientId: '637353594442-lni84kg5hrusl50efhthp99ncdc0ufqv.apps.googleusercontent.com',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
      pickerApiLoaded: false,
      oauthToken: null,
    };
  },
  mounted() {
    gapi.load('picker', this.onPickerApiLoad);
  },
  methods: {
    onPickerApiLoad() {
      this.pickerApiLoaded = true;
    },
    onPick() {
      // Check if token exists and hasn't expired (optional: implement expiry check)
      const cachedToken = localStorage.getItem('google_oauth_token');
      if (cachedToken) {
        this.oauthToken = cachedToken;
        this.createPicker();
        return;
      }
      // Otherwise, request a new token
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scope.join(' '),
        callback: (response) => {
          if (response.access_token) {
            this.oauthToken = response.access_token;
            localStorage.setItem('google_oauth_token', response.access_token); // Cache token
            this.createPicker();
          } else {
            console.error('Token error:', response);
          }
        }
      });
      tokenClient.requestAccessToken();
    },

    createPicker() {
      if (this.pickerApiLoaded && this.oauthToken) {
        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS)
          .setOAuthToken(this.oauthToken)
          .setDeveloperKey(this.developerKey)
          .setAppId('637353594442') // Your project number (not client ID)
          .setCallback(this.pickerCallback)
          .build();
        picker.setVisible(true);
      } else {
        console.warn('Picker not ready:', {
          pickerApiLoaded: this.pickerApiLoaded,
          oauthToken: this.oauthToken,
        });
      }
    },

    pickerCallback(data) {
      if (data.action === google.picker.Action.PICKED) {
        const file = data.docs[0];
        alert(`You picked: ${file.name}`);
        console.log(file);
      }
    },

    logout() {
      localStorage.removeItem('google_oauth_token');
      this.oauthToken = null;
      alert('Logged out from Google Picker integration.');
    },

  },
};
</script>
