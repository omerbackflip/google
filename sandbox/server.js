require('dotenv').config();

const express = require('express');
const path = require('path');

const {
  createGoogleRouter,
  createFileTokenStore
} = require('../app/shared/google');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/sandbox', express.static(path.join(__dirname, 'client')));

const tokenStore = createFileTokenStore(
  path.join(__dirname, 'google_token.json')
);

app.use('/api/google', createGoogleRouter({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  scopes: process.env.GOOGLE_SCOPES,
  tokenStore
}));

app.get('/', (req, res) => {
  res.json({
    message: 'Google sandbox backend is running'
  });
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Google sandbox server is running on port ${PORT}`);
});