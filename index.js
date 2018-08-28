const PluginError = require('plugin-error');
const replaceExt = require('replace-ext');
const through = require('through2');
const mime = require('mime');

// MIME type overrides
mime.define({
  'application/x-font-ttf': ['ttf'],
  'application/x-font-opentype': ['otf'],
  'application/font-woff2': ['woff2'],
}, true);

// Map MIME types to formats
const formats = {
  'application/vnd.ms-fontobject': 'embedded-opentype',
  'application/x-font-opentype': 'opentype',
  'application/x-font-ttf': 'truetype',
  'application/font-woff': 'woff',
  'application/font-woff2': 'woff2',
  'image/svg+xml': 'svg',
};

// Set default options for generated @font-face rule
const defaultOptions = {
  fileFormat: 'css',
  fontName: 'myfont',
  fontWeight: 400,
  fontStyle: 'normal',
  fontStretch: 'normal',
};

module.exports = (options = defaultOptions) => {
  // create a stream through which each file will pass
  return through.obj((file, enc, callback) => {
    if (file.isBuffer()) {
      const { fontName } = options || defaultOptions.fontName;
      const { fontWeight } = options || defaultOptions.fontWeight;
      const { fontStyle } = options || defaultOptions.fontStyle;
      const { fontStretch } = options || defaultOptions.fontStretch;
      const mimeType = mime.getType(file.path);
      const format = formats[mimeType];
      const file64 = new Buffer.from(file.contents).toString('base64');
      const output = `@font-face {font-family: '${fontName}'; font-weight: ${fontWeight}; font-style: ${fontStyle}; font-stretch: ${fontStretch}; src: url(data:${mimeType};base64,${file64}) format('${format}');}`;

      file.contents = new Buffer.from(output);
      file.path = replaceExt(file.path, `.${options.fileFormat}`);
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-cssfont64', 'Streaming not supported'));
    }

    if (file.isNull()) {
      this.push(file);
      // do nothing if no contents
    }

    return callback();
  });
};
