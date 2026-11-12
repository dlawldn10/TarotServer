const express = require("express");
const { findById } = require("../store/memory");

const router = express.Router();

const TOPIC_LABELS = {
  0: "연애운", 1: "학업운", 2: "꿈/진로", 3: "직업/취업", 4: "오늘의 운세", 5: "궁합",
};

const TOPIC_EMOJIS = {
  0: "💜", 1: "📚", 2: "🌙", 3: "💼", 4: "🔮", 5: "✨",
};

function cardImageUrl(cardNumber, baseUrl) {
  const idx = cardNumber + 1;
  const filename = idx <= 22 ? `tarot_${idx}.png` : "tarot_front.png";
  return `${baseUrl}/images/${filename}`;
}

function renderPage(result, baseUrl) {
  const topic = TOPIC_LABELS[result.tarotType] ?? "타로";
  const emoji = TOPIC_EMOJIS[result.tarotType] ?? "🔮";
  const summary = result.overallResult?.summary ?? "";
  const full = result.overallResult?.full ?? "";
  const cards = result.cards ?? [];
  const cardResults = result.cardResults ?? [];
  const isHarmony = result.tarotType === 5;

  const cardSections = cards.map((cardNum, i) => {
    const info = cardResults[i];
    const keywords = info?.keywords?.join("  ·  ") ?? "";
    const desc = info?.description ?? "";
    const imgUrl = cardImageUrl(cardNum, baseUrl);
    const label = isHarmony
      ? (i < 3 ? `${result.overallResult?.firstUser ?? "첫번째"} ${i + 1}번째 카드` : `${result.overallResult?.secondUser ?? "두번째"} ${i - 2}번째 카드`)
      : `${i + 1}번째 카드`;

    return `
      <div class="card-section">
        <img src="${imgUrl}" alt="타로카드 ${i + 1}" class="card-img" onerror="this.src='${baseUrl}/images/tarot_front.png'">
        <div class="card-info">
          <p class="card-label">${label}</p>
          <p class="keywords">${keywords}</p>
          <p class="desc">${desc}</p>
        </div>
      </div>`;
  }).join("");

  const harmonyUsers = isHarmony && result.overallResult?.firstUser
    ? `<p class="harmony-users">${result.overallResult.firstUser} &amp; ${result.overallResult.secondUser}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emoji} ${topic} 타로 결과 | TarotForU</title>
  <meta property="og:title" content="${emoji} ${topic} 타로 결과">
  <meta property="og:description" content="${summary}">
  <meta property="og:image" content="${cardImageUrl(cards[0] ?? 0, baseUrl)}">
  <meta property="og:url" content="${baseUrl}/share?tarotId=${result.tarotId}">
  <meta property="og:type" content="website">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
      background: #0f0a1e;
      color: #e8e0f0;
      min-height: 100vh;
    }
    .container { max-width: 480px; margin: 0 auto; padding: 24px 16px 48px; }

    .header { text-align: center; padding: 32px 0 24px; }
    .header .emoji { font-size: 36px; }
    .header .topic { font-size: 13px; color: #9b7fc7; letter-spacing: 2px; margin-top: 8px; }
    .header .date { font-size: 12px; color: #6b5a8a; margin-top: 4px; }

    .harmony-users { text-align: center; font-size: 15px; color: #c4a8f0; margin-bottom: 24px; }

    .summary-box {
      background: linear-gradient(135deg, #2a1f4a, #1e1535);
      border: 1px solid #4a3270;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .summary-box p { font-size: 15px; line-height: 1.7; color: #d4c0f0; }

    .card-section {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      background: #1a1030;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .card-img { width: 72px; min-width: 72px; border-radius: 8px; object-fit: cover; }
    .card-info { flex: 1; }
    .card-label { font-size: 11px; color: #9b7fc7; letter-spacing: 1px; margin-bottom: 6px; }
    .keywords { font-size: 13px; color: #c4a8f0; font-weight: 600; margin-bottom: 8px; }
    .desc { font-size: 13px; color: #a090c0; line-height: 1.6; }

    .full-result {
      background: #1a1030;
      border-radius: 16px;
      padding: 20px;
      margin-top: 24px;
    }
    .full-result h3 { font-size: 13px; color: #9b7fc7; letter-spacing: 1px; margin-bottom: 12px; }
    .full-result p { font-size: 14px; color: #c0b0d8; line-height: 1.8; }

    .cta {
      margin-top: 32px;
      text-align: center;
    }
    .cta a {
      display: inline-block;
      background: linear-gradient(135deg, #7c4dba, #5b2d9e);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
    }
    .cta p { font-size: 12px; color: #6b5a8a; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">${emoji}</div>
      <div class="topic">${topic.toUpperCase()}</div>
      <div class="date">${result.createdAt ?? ""}</div>
    </div>

    ${harmonyUsers}

    <div class="summary-box">
      <p>${summary}</p>
    </div>

    ${cardSections}

    <div class="full-result">
      <h3>✦ 종합 리딩</h3>
      <p>${full}</p>
    </div>

    <div class="cta">
      <a href="https://play.google.com/store/apps/details?id=com.fourleafclover.tarot">
        앱에서 나만의 타로 보기
      </a>
      <p>TarotForU — AI 타로 리딩</p>
    </div>
  </div>
</body>
</html>`;
}

// GET /share?tarotId=XXX
router.get("/", (req, res) => {
  const { tarotId } = req.query;

  if (!tarotId) {
    return res.status(400).send("tarotId가 필요합니다.");
  }

  const result = findById(tarotId);
  if (!result) {
    return res.status(404).send("결과를 찾을 수 없습니다. 앱에서 다시 확인해 주세요.");
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPage(result, baseUrl));
});

module.exports = router;
