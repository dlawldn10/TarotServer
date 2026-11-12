const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readTarot, readMatchTarot } = require("../services/claude");
const { save, findByIds } = require("../store/memory");
const { TOPIC_IDS } = require("../data/cards");

const router = express.Router();

// POST /tarot/:topic  (love | study | dream | job | today)
router.post("/:topic", async (req, res) => {
  const { topic } = req.params;
  const { firstAnswer, secondAnswer, thirdAnswer, cards } = req.body;

  if (!firstAnswer || !secondAnswer || !thirdAnswer || !Array.isArray(cards) || cards.length !== 3) {
    return res.status(400).json({ error: "firstAnswer, secondAnswer, thirdAnswer, cards(3개) 필요" });
  }

  try {
    const reading = await readTarot({ topic, cards, firstAnswer, secondAnswer, thirdAnswer });

    const result = {
      tarotId: uuidv4(),
      tarotType: TOPIC_IDS[topic] ?? 0,
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

// POST /tarot/my  — 저장된 결과 목록 조회
router.post("/my", (req, res) => {
  const { tarotIds } = req.body;

  if (!Array.isArray(tarotIds)) {
    return res.status(400).json({ error: "tarotIds 배열 필요" });
  }

  res.json(findByIds(tarotIds));
});

// POST /tarot/match  — 궁합 리딩
router.post("/match", async (req, res) => {
  const { firstUser, secondUser, roomId, cards } = req.body;

  if (!firstUser || !secondUser || !roomId || !Array.isArray(cards) || cards.length !== 6) {
    return res.status(400).json({ error: "firstUser, secondUser, roomId, cards(6개) 필요" });
  }

  try {
    const reading = await readMatchTarot({ firstUser, secondUser, cards });

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
    res.json(result);
  } catch (err) {
    console.error("match reading error:", err.message);
    res.status(500).json({ error: "궁합 리딩 중 오류가 발생했습니다." });
  }
});

module.exports = router;
