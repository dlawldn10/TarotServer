const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/tarot.db");

// data 디렉토리 없으면 자동 생성
const fs = require("fs");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS tarot_results (
    tarot_id   TEXT PRIMARY KEY,
    tarot_type INTEGER NOT NULL,
    cards      TEXT NOT NULL,
    created_at TEXT NOT NULL,
    result_json TEXT NOT NULL
  )
`);

function save(result) {
  db.prepare(`
    INSERT OR REPLACE INTO tarot_results
      (tarot_id, tarot_type, cards, created_at, result_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    result.tarotId,
    result.tarotType,
    JSON.stringify(result.cards),
    result.createdAt,
    JSON.stringify(result)
  );
}

function findById(tarotId) {
  const row = db.prepare("SELECT result_json FROM tarot_results WHERE tarot_id = ?").get(tarotId);
  return row ? JSON.parse(row.result_json) : null;
}

function findByIds(tarotIds) {
  if (tarotIds.length === 0) return [];
  const placeholders = tarotIds.map(() => "?").join(",");
  const rows = db.prepare(`SELECT result_json FROM tarot_results WHERE tarot_id IN (${placeholders})`).all(...tarotIds);
  return rows.map(r => JSON.parse(r.result_json));
}

module.exports = { save, findById, findByIds };
