const isHeic = require('is-heic');
const libheif = require('libheif-js');

const decodeBuffer = async inputBuffer => {
  const decoder = new libheif.HeifDecoder();
  const data = decoder.decode(inputBuffer);

  if (!data.length) {
    throw new Error('HEIF image not found');
  }

  const image = data[0];
  const width = image.get_width();
  const height = image.get_height();

  const arrayBuffer = await new Promise((resolve, reject) => {
    image.display({ data: new Uint8ClampedArray(width*height*4), width, height }, (displayData) => {
      if (!displayData) {
        return reject(new Error('HEIF processing error'));
      }

      // get the ArrayBuffer from the Uint8Array
      resolve(displayData.data.buffer);
    });
  });

  return { width, height, data: arrayBuffer };
};

module.exports = async ({ buffer }) => {
  if (!isHeic(buffer)) {
    throw new TypeError('input buffer is not a HEIC image');
  }

  return await decodeBuffer(buffer);
};
