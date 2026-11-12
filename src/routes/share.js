const express = require("express");
const { findById } = require("../store/memory");

const router = express.Router();

const TOPIC_LABELS = {
  0: "연애운", 1: "학업운", 2: "꿈/진로", 3: "직업/취업", 4: "오늘의 운세", 5: "궁합",
};

const TOPIC_EMOJIS = {
  0: "💜", 1: "📚", 2: "🌙", 3: "💼", 4: "🔮", 5: "✨",
};

const PACKAGE_NAME = "com.fourleafclover.tarot";
const STORE_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`;

// 닉네임과 리딩 본문은 사용자·모델이 만든 문자열이라 HTML에 넣기 전에 이스케이프한다
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

function cardImageUrl(cardNumber, baseUrl) {
  const idx = cardNumber + 1;
  const filename = idx <= 22 ? `tarot_${idx}.png` : "tarot_front.png";
  return `${baseUrl}/images/${filename}`;
}

function renderPage(result, baseUrl) {
  const topic = TOPIC_LABELS[result.tarotType] ?? "타로";
  const emoji = TOPIC_EMOJIS[result.tarotType] ?? "🔮";
  const summary = esc(result.overallResult?.summary);
  const full = esc(result.overallResult?.full);
  const firstUser = esc(result.overallResult?.firstUser ?? "첫번째");
  const secondUser = esc(result.overallResult?.secondUser ?? "두번째");
  const tarotId = encodeURIComponent(result.tarotId);
  const createdAt = esc(result.createdAt);
  const cards = result.cards ?? [];
  const cardResults = result.cardResults ?? [];
  const isHarmony = result.tarotType === 5;

  const cardSections = cards.map((cardNum, i) => {
    const info = cardResults[i];
    const keywords = esc(info?.keywords?.join("  ·  "));
    const desc = esc(info?.description);
    const imgUrl = cardImageUrl(cardNum, baseUrl);
    const label = isHarmony
      ? (i < 3 ? `${firstUser} ${i + 1}번째 카드` : `${secondUser} ${i - 2}번째 카드`)
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
    ? `<p class="harmony-users">${firstUser} &amp; ${secondUser}</p>`
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
  <meta property="og:url" content="${baseUrl}/share?tarotId=${tarotId}">
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
      <div class="date">${createdAt}</div>
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
      <a href="${STORE_URL}">
        앱에서 나만의 타로 보기
      </a>
      <p>TarotForU — AI 타로 리딩</p>
    </div>
  </div>
</body>
</html>`;
}

// 궁합 초대 링크가 브라우저로 열렸을 때 보여 주는 페이지.
// App Links가 검증된 기기에서는 링크가 앱으로 바로 열려 이 페이지를 거치지 않지만,
// 카카오톡 같은 인앱 브라우저는 그대로 웹을 띄우므로 intent 링크로 앱을 열어 준다.
function renderInvitePage(roomId, host) {
  const fallback = encodeURIComponent(STORE_URL);
  const openInApp = `intent://${host}/share?roomId=${roomId}#Intent;scheme=https;package=${PACKAGE_NAME};S.browser_fallback_url=${fallback};end`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>✨ 궁합 타로 초대 | TarotForU</title>
  <meta property="og:title" content="✨ 궁합 타로 초대가 도착했어요">
  <meta property="og:description" content="링크를 눌러 함께 궁합 타로를 확인해 보세요.">
  <meta property="og:type" content="website">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
      background: #0f0a1e; color: #e8e0f0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .container { max-width: 480px; padding: 32px 24px; text-align: center; }
    .emoji { font-size: 44px; }
    h1 { font-size: 20px; margin: 16px 0 10px; }
    p { font-size: 14px; color: #a090c0; line-height: 1.7; }
    .btn {
      display: block; margin-top: 28px; padding: 15px 24px; border-radius: 24px;
      background: linear-gradient(135deg, #7c4dba, #5b2d9e);
      color: white; text-decoration: none; font-size: 15px; font-weight: 600;
    }
    .sub { display: inline-block; margin-top: 16px; font-size: 13px; color: #9b7fc7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji">✨</div>
    <h1>궁합 타로 초대가 도착했어요</h1>
    <p>아래 버튼을 누르면 앱에서 초대방으로 바로 들어가요.<br>초대방은 1시간 동안만 열려 있어요.</p>
    <a class="btn" href="${openInApp}">앱에서 초대방 열기</a>
    <a class="sub" href="${STORE_URL}">앱이 없다면 설치하기</a>
  </div>
</body>
</html>`;
}

// GET /share?tarotId=XXX  — 공유된 타로 결과
// GET /share?roomId=XXX   — 궁합 초대
router.get("/", (req, res) => {
  const { tarotId, roomId } = req.query;

  if (typeof roomId === "string" && /^[A-Za-z0-9]{1,32}$/.test(roomId)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(renderInvitePage(roomId, req.get("host")));
  }

  if (!tarotId) {
    return res.status(400).send("tarotId 또는 roomId가 필요합니다.");
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
