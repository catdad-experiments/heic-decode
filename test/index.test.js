/* eslint-env mocha */
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = require('rootrequire');
const { expect } = require('chai');

const decode = require('../');

const readFile = promisify(fs.readFile);
const hash = data => crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');

describe('heic-decode', () => {
  it('exports a function', () => {
    expect(decode).to.be.a('function');
  });

  it('can decode a known image', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));
    const { width, height, data } = await decode({ buffer });

    expect(width).to.equal(1440);
    expect(height).to.equal(960);
    expect(data).to.be.instanceof(ArrayBuffer);

    expect(hash(data)).to.equal('fe4585b4d72109d470c01acf74b7301b88bf2df4b865daadc3e35d3413d1228f');
  });

  it('can decode multiple images inside a single file', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0003.heic'));
    const images = await decode({ buffer, all: true });

    expect(images).to.have.lengthOf(3);

    for (let { i, hash: expectedHash } of [
      { i: 0, hash: '612299de20d15ac3f35728f271dd5b2bcd73ad8d451538c94989eb1a0674ac56' },
      { i: 1, hash: '60b683e07517883df35a14ca9db7f76c427bcbbaa11f84ad52e806699839574e' },
      { i: 2, hash: '60b683e07517883df35a14ca9db7f76c427bcbbaa11f84ad52e806699839574e' },
    ]) {
      expect(images[i]).to.have.a.property('decode').and.to.be.a('function');

      const image = await images[i].decode();

      expect(image).to.have.property('width', 4500);
      expect(image).to.have.property('height', 3000);

      expect(
        hash(image.data),
        `image ${i} hash does not match`
      ).to.equal(expectedHash);
    }
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
});
