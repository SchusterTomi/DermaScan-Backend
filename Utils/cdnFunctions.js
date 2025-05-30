const cloudinary = require("../cloudinary"); // importamos la config

function subirImagenACloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mi_proyecto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { subirImagenACloudinary,};
