const fs = require('fs');

module.exports = {
  copy: function (oldPath,newPath, callback) {
    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    readStream.pipe(writeStream);
  }
}

