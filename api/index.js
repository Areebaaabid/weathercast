module.exports = async (req, res) => {
  try {
    const app = require("../server/server");
    const { connectDB } = require("../server/config/db");
    try {
      await connectDB();
    } catch (e) {
      console.error("DB unavailable:", e.message);
    }
    app(req, res);
  } catch (err) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).end(JSON.stringify({ error: err.message || "Server error" }));
  }
};
