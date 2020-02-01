/* eslint-disable no-console */
const { promisify } = require('util');
const fs = require('fs');
const Jimp = require('jimp');
const decode = require('../');

const readStdin = () => new Promise(resolve => {
  const result = [];

  process.stdin.on('readable', () => {
    let chunk;

    while ((chunk = process.stdin.read())) {
      result.push(chunk);
    }
  });

  process.stdin.on('end', () => {
    resolve(Buffer.concat(result));
  });
});

const createImage = promisify(({ data, width, height }, callback) => {
  try {
    new Jimp({ data: Buffer.from(data), width, height }, callback);
  } catch (e) {
    callback(e);
  }
});

const toJpeg = async ({ data, width, height }) => {
  const image = await createImage({ data, width, height });
  return image.quality(100).getBufferAsync(Jimp.MIME_JPEG);
};

(async () => {
  const buffer = await readStdin();
  const images = await decode.all({ buffer });

  console.log('found %s images', images.length);

  for (let i in images) {
    console.log('decoding image', +i + 1);
    const image = images[i];
    fs.writeFileSync(`./result-${+i + 1}.jpg`, await toJpeg(await image.decode()));
  }
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
