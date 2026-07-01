let app;

const loadApp = () => {
  if (!app) {
    app = require("../server/server");
    const { connectDB } = require("../server/config/db");
    connectDB()
      .then(() => console.log("DB connected"))
      .catch((err) => console.error("DB unavailable:", err.message));
  }
  return app;
};

module.exports = (req, res) => {
  try {
    loadApp()(req, res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message || "Server error" }));
  }
};