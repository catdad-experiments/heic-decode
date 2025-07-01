/* eslint-env mocha */
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const root = require('rootrequire');
const { expect } = require('chai');
const { PNG } = require('pngjs');
const toUint8 = require('buffer-to-uint8array');
const pixelmatch = require('pixelmatch');

const readFile = promisify(fs.readFile);

describe('heic-decode (default wasm bundle)', () => {
  runTests(require(root));
});

describe('heic-decode (js)', () => {
  const libheif = require('libheif-js');
  const { one, all } = require('../lib')(libheif);
  const decode = one;
  decode.all = all;

  runTests(decode);
});

function runTests(decode) {
  const readControl = async name => {
    const buffer = await readFile(path.resolve(root, `temp/${name}`));
    const { data, width, height } = PNG.sync.read(buffer);

    return { data, width, height };
  };

  const compare = (expected, actual, width, height, errString = 'actual image did not match control image') => {
    const result = pixelmatch(toUint8(Buffer.from(expected)), toUint8(Buffer.from(actual)), null, width, height, {
      threshold: 0.1
    });

    // allow 5% of pixels to be different
    expect(result).to.be.below(width * height * 0.05, errString);
  };

  it('exports a function', () => {
    expect(decode).to.be.a('function');
    expect(decode).to.have.property('all').and.to.be.a('function');
  });

  it('can decode a known image', async () => {
    const control = await readControl('0002-control.png');
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));
    const { width, height, data } = await decode({ buffer });

    expect(width).to.equal(control.width);
    expect(height).to.equal(control.height);
    expect(data).to.be.instanceof(Uint8ClampedArray);

    compare(control.data, data, control.width, control.height);
  });

  it('can decode multiple images inside a single file', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0003.heic'));
    const images = await decode.all({ buffer });

    expect(images).to.have.lengthOf(3);
    expect(images).to.have.property('free').and.to.be.a('function');

    const controls = await Promise.all([
      readControl('0003-0-control.png'),
      readControl('0003-1-control.png')
    ]);

    for (let { i, control } of [
      { i: 0, control: controls[0] },
      { i: 1, control: controls[1] },
      { i: 2, control: controls[1] },
    ]) {
      expect(images[i]).to.have.property('decode').and.to.be.a('function');
      expect(images[i]).to.have.property('width').and.to.equal(control.width);
      expect(images[i]).to.have.property('height').and.to.equal(control.height);

      const image = await images[i].decode();

      expect(image).to.have.property('width', control.width);
      expect(image).to.have.property('height', control.height);
      expect(image).to.have.property('data').and.to.be.instanceOf(Uint8ClampedArray);

      compare(control.data, image.data, control.width, control.height, `actual image at index ${i} did not match control`);
    }

    images.free();
  });

  it('throws if data other than a HEIC image is passed in', async () => {
    const buffer = Buffer.from(Math.random().toString() + Math.random().toString());

    try {
      await decode({ buffer });
      throw new Error('decoding succeeded when it was expected to fail');
    } catch (e) {
      expect(e).to.be.instanceof(TypeError)
        .and.to.have.property('message', 'input buffer is not a HEIC image');
    }
  });
}
