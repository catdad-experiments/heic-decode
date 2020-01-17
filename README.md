# heic-decode

Decodes HEIC images and extracts the raw pixel data.

[![travis][travis.svg]][travis.link]
[![npm-downloads][npm-downloads.svg]][npm.link]
[![npm-version][npm-version.svg]][npm.link]

[travis.svg]: https://travis-ci.com/catdad-experiments/heic-decode.svg?branch=master
[travis.link]: https://travis-ci.com/catdad-experiments/heic-decode
[npm-downloads.svg]: https://img.shields.io/npm/dm/heic-decode.svg
[npm.link]: https://www.npmjs.com/package/heic-decode
[npm-version.svg]: https://img.shields.io/npm/v/heic-decode.svg

## Install

```bash
npm install heic-decode
```

## Usage

```javascript
const fs = require('fs');
const decode = require('heic-decode');

(async () => {
  const buffer = await promisify(fs.readFile)('/path/to/my/image.heic');
  const {
    width,  // integer width of the image
    height, // integer height of the image
    data    // ArrayBuffer containing decoded raw image data
  } = await decode({ buffer });
})();
```

You can use this data to integrate with other imaging libraries for processing.
