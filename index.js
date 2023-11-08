const libheif = require('libheif-js/wasm-bundle');

const { one, all } = require('./lib.js')(libheif);

module.exports = one;
module.exports.all = all;
