const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const CONFIG_PATH = path.join(__dirname, "../config/demo.json");

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function writeConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET /config/demo — 앱 시작 시 호출
router.get("/demo", (_, res) => {
  try {
    res.json(readConfig());
  } catch (err) {
    console.error("config read error:", err.message);
    res.status(500).json({ error: "설정을 읽을 수 없습니다." });
  }
});

// POST /config/demo — 관리자 전용 (헤더: x-admin-secret)
router.post("/demo", (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "인증 실패" });
  }

  try {
    const current = readConfig();
    const updated = { ...current, ...req.body };
    writeConfig(updated);
    res.json(updated);
  } catch (err) {
    console.error("config write error:", err.message);
    res.status(500).json({ error: "설정을 저장할 수 없습니다." });
  }
});

module.exports = router;
