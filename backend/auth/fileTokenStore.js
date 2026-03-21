const fs = require('fs');
const path = require('path');

function createFileTokenStore(tokenFilePath) {
  if (!tokenFilePath) {
    throw new Error('Missing token file path');
  }

  const absolutePath = path.resolve(tokenFilePath);

  return {
    save(tokens) {
      fs.writeFileSync(absolutePath, JSON.stringify(tokens, null, 2), 'utf8');
      return tokens;
    },

    load() {
      if (!fs.existsSync(absolutePath)) return null;
      return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    },

    clear() {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    },

    getPath() {
      return absolutePath;
    }
  };
}

module.exports = {
  createFileTokenStore
};