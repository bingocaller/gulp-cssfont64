const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Vinyl = require('vinyl');
const cssfont64 = require('../index');

describe('gulp-cssfont64', () => {
  describe('in buffer mode', () => {
    it('should encode fonts to base64 and generate a css file', (done) => {
      const fileName = 'myfont';
      const filePath = path.join(__dirname, `/fixtures/${fileName}.ttf`);

      const input = new Vinyl({
        base: path.dirname(filePath),
        path: filePath,
        contents: new Buffer.from(fs.readFileSync(filePath, 'utf8')),
      });

      const stream = cssfont64();

      stream.on('data', (newFile) => {
        assert.equal(String(newFile.contents), fs.readFileSync(path.join(__dirname, `/fixtures/${fileName}.css`), 'utf8').trim());
        done();
      });

      stream.write(input);
    });
  });
});
