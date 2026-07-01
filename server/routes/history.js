const express = require("express");
const router = express.Router();
const { getHistory, deleteHistory, clearHistory } = require("../controllers/historyController");

router.get("/", getHistory);
router.delete("/", clearHistory);
router.delete("/:id", deleteHistory);

module.exports = router;
