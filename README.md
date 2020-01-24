# heic-decode

> Decode HEIC images to extract raw pixel data.

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

_Note that while the decoder returns a Promise, it does the majority of the work synchronously, so you should consider using a worker thread in order to not block the main thread in highly concurrent production environments._

## Related

* [heic-cli](https://github.com/catdad-experiments/heic-cli) - convert heic/heif images to jpeg or png from the command line
* [heic-convert](https://github.com/catdad-experiments/heic-convert) - convert heic/heif images to jpeg and png
* [libheif-js](https://github.com/catdad-experiments/libheif-js) - libheif as a pure-javascript npm module
