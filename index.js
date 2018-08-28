'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');
var mime = require('mime');

module.exports = function(options) {
  options.fileFormat = options.fileFormat || 'css';
  // create a stream through which each file will pass
  return through.obj(function(file, enc, callback) {

    var formats = {
      '.eot': 'embedded-opentype',
      '.svg': 'svg',
      '.ttf': 'truetype',
      '.woff': 'woff',
      '.woff2': 'woff2',
    };

    if (file.isNull()) {
      this.push(file);
      // do nothing if no contents
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-cssfont64', 'Streaming not supported'));
      return callback();
    }

    if (file.isBuffer()) {
      var
        file64 = new Buffer(file.contents).toString('base64'),
        mimeType =  mime.lookup(file.path),
        fileExt = path.extname(file.path);

      var fileName = path.basename(file.path, fileExt);

      var
        format = formats[fileExt],
        fontName = typeof fileName.split('-')[0] == 'undefined' ? fileName : fileName.split('-')[0],
        fontWeight = typeof fileName.split('-')[1] == 'undefined' ? 'normal' : fileName.split('-')[1].toLowerCase(),
        fontStyle = typeof fileName.split('-')[2] == 'undefined' ? 'normal' : fileName.split('-')[2].toLowerCase();

      var output = '@font-face {font-family: \''+fontName+'\'; font-weight: '+fontWeight+'; font-style: '+fontStyle+'; src: url(data:'+mimeType+';base64,'+file64+') format("'+ format +'");}';

      file.contents = new Buffer(output);
      file.path = gutil.replaceExtension(file.path, '.' + options.fileFormat);
      return callback(null, file);
    }
  });
};
