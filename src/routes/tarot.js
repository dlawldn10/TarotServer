const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readTarot, readMatchTarot } = require("../services/claude");
const { save, findByIds } = require("../store/memory");
const rooms = require("../store/rooms");
const { TOPIC_IDS, TOPIC_QUESTIONS } = require("../data/cards");

const router = express.Router();

// POST /tarot/my  — 저장된 결과 목록 조회
router.post("/my", (req, res) => {
  const { tarotIds } = req.body;

  if (!Array.isArray(tarotIds)) {
    return res.status(400).json({ error: "tarotIds 배열 필요" });
  }

  res.json(findByIds(tarotIds));
});

// 성별은 소켓 join 때 방에 저장된 값을 쓴다 (요청자는 상대 성별을 모름)
function findGenders(roomId, firstUser, secondUser) {
  const users = rooms.get(roomId)?.users ?? [];
  const first = users.find(u => u.nickname === firstUser);
  const second = users.find(u => u !== first && u.nickname === secondUser);
  return [first?.gender ?? null, second?.gender ?? null];
}

// POST /tarot/match  — 궁합 리딩
router.post("/match", async (req, res) => {
  const { firstUser, secondUser, roomId, cards } = req.body;

  if (!firstUser || !secondUser || !roomId || !Array.isArray(cards) || cards.length !== 6) {
    return res.status(400).json({ error: "firstUser, secondUser, roomId, cards(6개) 필요" });
  }

  try {
    const [firstGender, secondGender] = findGenders(roomId, firstUser, secondUser);
    const reading = await readMatchTarot({ firstUser, secondUser, firstGender, secondGender, cards });

    const result = {
      tarotId: uuidv4(),
      tarotType: 5,
      cards,
      createdAt: new Date().toISOString(),
      cardResults: reading.cardResults,
      overallResult: {
        ...reading.overallResult,
        firstUser,
        secondUser,
        roomId,
      },
    };

    save(result);
    // 앱은 HTTP 응답이 아니라 이 소켓 이벤트를 받아 두 사람 모두 결과 화면으로 넘어간다
    req.app.get("io").to(roomId).emit("resultPrepared", { tarotId: result.tarotId });
    res.json(result);
  } catch (err) {
    console.error("match reading error:", err.message);
    res.status(500).json({ error: "궁합 리딩 중 오류가 발생했습니다." });
  }
});

// POST /tarot/:topic  (love | study | dream | job | today)
// 와일드카드 라우트라 /my, /match 보다 뒤에 등록해야 한다
router.post("/:topic", async (req, res) => {
  const { topic } = req.params;
  const { firstAnswer, secondAnswer, thirdAnswer, cards } = req.body;

  if (!(topic in TOPIC_IDS)) {
    return res.status(404).json({ error: "알 수 없는 주제입니다." });
  }

  if (!Array.isArray(cards) || cards.length !== 3) {
    return res.status(400).json({ error: "cards(3개) 필요" });
  }

  // today처럼 질문이 없는 주제는 답변 없이 리딩한다
  const needsAnswers = TOPIC_QUESTIONS[topic].length > 0;
  if (needsAnswers && (!firstAnswer?.trim() || !secondAnswer?.trim() || !thirdAnswer?.trim())) {
    return res.status(400).json({ error: "firstAnswer, secondAnswer, thirdAnswer 필요" });
  }

  try {
    const reading = await readTarot({ topic, cards, firstAnswer, secondAnswer, thirdAnswer });

    const result = {
      tarotId: uuidv4(),
      tarotType: TOPIC_IDS[topic],
      cards,
      createdAt: new Date().toISOString(),
      cardResults: reading.cardResults,
      overallResult: reading.overallResult,
    };

    save(result);
    res.json(result);
  } catch (err) {
    console.error("tarot reading error:", err.message);
    res.status(500).json({ error: "리딩 중 오류가 발생했습니다." });
  }
});

module.exports = router;
