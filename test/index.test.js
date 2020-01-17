/* eslint-env mocha */
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = require('rootrequire');
const { expect } = require('chai');

const decoder = require('../');

const readFile = promisify(fs.readFile);

describe('heic-decode', () => {
  it('exports a function', () => {
    expect(decoder).to.be.a('function');
  });

  it('can decode a known image', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));
    const { width, height, data } = await decoder({ buffer });

    expect(width).to.equal(1440);
    expect(height).to.equal(960);

    const hash = crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');

    expect(hash).to.equal('fe4585b4d72109d470c01acf74b7301b88bf2df4b865daadc3e35d3413d1228f');
  });
});
