const fs = require('fs');
const path = require('path');

function getFileContent(filePath) {
  const fullPath = path.join(__dirname, filePath);
  return fs.readFileSync(fullPath, 'utf8');
}

module.exports = getFileContent;
