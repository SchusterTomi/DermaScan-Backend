const { subirImagenACloudinary } = require("../utils/cdnFunctions");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen." });
    }

    console.log("Archivo recibido:", req.file); // 👈 Debug: Ver qué llega

    const imageUrl = await subirImagenACloudinary(req.file.buffer);

    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Error al subir la imagen:", error); // 👈 Mostrá el error exacto
    res.status(500).json({ error: "Error al subir la imagen", detalle: error.message });
  }
};

module.exports = { uploadImage };
