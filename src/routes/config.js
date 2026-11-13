const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const DEMO_PATH = path.join(__dirname, "../config/demo.json");
const NOTICE_PATH = path.join(__dirname, "../config/notice.json");

function readConfig(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeConfig(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// 관리자 전용 (헤더: x-admin-secret)
function requireAdmin(req, res, next) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "인증 실패" });
  }
  next();
}

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// GET /config/demo — 앱 시작 시 호출
router.get("/demo", (_, res) => {
  try {
    res.json(readConfig(DEMO_PATH));
  } catch (err) {
    console.error("config read error:", err.message);
    res.status(500).json({ error: "설정을 읽을 수 없습니다." });
  }
});

// POST /config/demo — 관리자 전용
router.post("/demo", requireAdmin, (req, res) => {
  try {
    const current = readConfig(DEMO_PATH);
    const updated = { ...current, ...req.body };
    writeConfig(DEMO_PATH, updated);
    res.json(updated);
  } catch (err) {
    console.error("config write error:", err.message);
    res.status(500).json({ error: "설정을 저장할 수 없습니다." });
  }
});

// GET /config/notice — 앱 시작 시 호출 (점검 안내, 강제 업데이트)
router.get("/notice", (_, res) => {
  try {
    res.json(readConfig(NOTICE_PATH));
  } catch (err) {
    console.error("notice read error:", err.message);
    res.status(500).json({ error: "공지를 읽을 수 없습니다." });
  }
});

// POST /config/notice — 관리자 전용
// 항목(maintenance, forceUpdate)별로 보낸 필드만 덮어쓴다.
// 예: {"maintenance": {"enabled": true}} 는 문구는 그대로 두고 점검만 켠다.
router.post("/notice", requireAdmin, (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "JSON 객체 필요" });
  }

  try {
    const updated = readConfig(NOTICE_PATH);
    for (const section of ["maintenance", "forceUpdate"]) {
      if (!(section in req.body)) continue;
      if (!isPlainObject(req.body[section])) {
        return res.status(400).json({ error: `${section}은 객체여야 합니다.` });
      }
      updated[section] = { ...updated[section], ...req.body[section] };
    }
    writeConfig(NOTICE_PATH, updated);
    res.json(updated);
  } catch (err) {
    console.error("notice write error:", err.message);
    res.status(500).json({ error: "공지를 저장할 수 없습니다." });
  }
});

module.exports = router;
