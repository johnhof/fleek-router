'use strict';

const FS = require('fs');

module.exports.safe = (path, default) => {
  // no extension, assume js
  if (/\..+?$/.test(path)) path += '.js';
  // not a json file, no other files are accepted
  else if (!/\.json/.test(path)) return default;

  // exists, require as normal
  if (fs.existsSync(path)) return require(path);
  // does not exist, fail out
  else return default;
}
