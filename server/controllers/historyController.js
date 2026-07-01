const Search = require("../models/Search");

// GET /api/history
const getHistory = async (req, res) => {
  try {
    const history = await Search.findAll({
      order: [["searchedAt", "DESC"]],
      limit: 10,
      attributes: ["id", "city", "country", "temperature", "description", "weatherCode", "searchedAt"],
    });
    return res.json(history);
  } catch {
    return res.json([]);
  }
};

// DELETE /api/history/:id
const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Search.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    return res.json({ message: "Deleted successfully" });
  } catch {
    return res.json({ message: "History unavailable" });
  }
};

// DELETE /api/history
const clearHistory = async (req, res) => {
  try {
    await Search.destroy({ where: {}, truncate: true });
    return res.json({ message: "History cleared" });
  } catch {
    return res.json({ message: "History unavailable" });
  }
};

module.exports = { getHistory, deleteHistory, clearHistory };
