// 간단한 인메모리 저장소 (서버 재시작 시 초기화됨)
// 추후 SQLite나 파일 기반 저장소로 교체 가능

const tarotResults = new Map(); // tarotId → TarotOutputDto

function save(result) {
  tarotResults.set(result.tarotId, result);
}

function findById(tarotId) {
  return tarotResults.get(tarotId) ?? null;
}

function findByIds(tarotIds) {
  return tarotIds.map(id => tarotResults.get(id)).filter(Boolean);
}

module.exports = { save, findById, findByIds };
