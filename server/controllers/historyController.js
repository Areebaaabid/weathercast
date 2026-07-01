const Search = require("../models/Search");

// GET /api/history
const getHistory = async (req, res) => {
  const history = await Search.findAll({
    order: [["searchedAt", "DESC"]],
    limit: 10,
    attributes: ["id", "city", "country", "temperature", "description", "weatherCode", "searchedAt"],
  });
  res.json(history);
};

// DELETE /api/history/:id
const deleteHistory = async (req, res) => {
  const { id } = req.params;
  const deleted = await Search.destroy({ where: { id } });
  if (!deleted) return res.status(404).json({ error: "Entry not found" });
  res.json({ message: "Deleted successfully" });
};

// DELETE /api/history
const clearHistory = async (req, res) => {
  await Search.destroy({ where: {}, truncate: true });
  res.json({ message: "History cleared" });
};

module.exports = { getHistory, deleteHistory, clearHistory };
