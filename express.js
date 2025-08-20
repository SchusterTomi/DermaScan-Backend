app.get("/api/historial/:perfil_id", async (req, res) => {
  const { perfil_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, url_imagen, fecha FROM historial WHERE perfil_id = $1 ORDER BY fecha DESC",
      [perfil_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});
