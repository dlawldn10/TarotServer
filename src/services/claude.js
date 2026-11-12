const Anthropic = require("@anthropic-ai/sdk");
const { getCard, TOPIC_NAMES } = require("../data/cards");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `당신은 타로카드 전문 리더입니다. 한국어로 답변하세요.
사용자의 고민과 뽑은 카드를 바탕으로 깊이 있고 따뜻한 타로 리딩을 제공합니다.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "cardResults": [
    {
      "keywords": ["키워드1", "키워드2", "키워드3"],
      "description": "이 카드가 현재 상황에서 갖는 의미 (2-3문장)"
    },
    { "keywords": [...], "description": "..." },
    { "keywords": [...], "description": "..." }
  ],
  "overallResult": {
    "summary": "전체 리딩 한 줄 요약 (30자 이내)",
    "full": "세 카드를 종합한 상세 리딩. 현재 상황, 조언, 앞으로의 방향을 포함 (200-300자)"
  }
}`;

async function readTarot({ topic, cards, firstAnswer, secondAnswer, thirdAnswer }) {
  const topicName = TOPIC_NAMES[topic] ?? topic;
  const cardDescriptions = cards.map((num, i) => {
    const card = getCard(num);
    return `${i + 1}번째 카드: ${card.name} - ${card.meaning}`;
  }).join("\n");

  const userMessage = `주제: ${topicName}

뽑은 카드:
${cardDescriptions}

사용자의 답변:
1. ${firstAnswer}
2. ${secondAnswer}
3. ${thirdAnswer}

위 카드들과 사용자의 고민을 바탕으로 타로 리딩을 해주세요.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return JSON.parse(response.content[0].text);
}

const MATCH_SYSTEM_PROMPT = `당신은 타로카드 전문 리더입니다. 한국어로 답변하세요.
두 사람이 각자 뽑은 카드 3장씩, 총 6장을 바탕으로 깊이 있고 따뜻한 궁합 리딩을 제공합니다.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "cardResults": [
    {
      "keywords": ["키워드1", "키워드2", "키워드3"],
      "description": "이 카드가 두 사람의 관계에서 갖는 의미 (2-3문장)"
    }
  ],
  "overallResult": {
    "summary": "전체 궁합 한 줄 요약 (30자 이내)",
    "full": "여섯 카드를 종합한 상세 궁합 리딩 (300-450자)"
  }
}

cardResults는 반드시 6개여야 하며, 앞의 3개는 첫 번째 사람의 카드, 뒤의 3개는 두 번째 사람의 카드 순서입니다.
각 카드 설명은 그 카드를 뽑은 사람의 입장에서, 그 사람에게 말을 건네듯 작성하세요.`;

const GENDER_LABELS = { 0: "여성", 1: "남성" };

function matchGuidance(firstUser, secondUser, firstGender, secondGender) {
  const firstLabel = GENDER_LABELS[firstGender];
  const secondLabel = GENDER_LABELS[secondGender];

  if (!firstLabel || !secondLabel) {
    return {
      people: `첫 번째 사람: ${firstUser}님\n두 번째 사람: ${secondUser}님`,
      relationship: "두 사람의 관계 유형은 알 수 없습니다. 연인인지 친구인지 단정하지 말고, 두 사람 사이의 조화와 소통을 중심으로 리딩하세요.",
    };
  }

  const people = `첫 번째 사람: ${firstUser}님 (${firstLabel})\n두 번째 사람: ${secondUser}님 (${secondLabel})`;
  const perspective = `${firstUser}님의 카드는 ${firstLabel}인 ${firstUser}님의 입장에서, ${secondUser}님의 카드는 ${secondLabel}인 ${secondUser}님의 입장에서 해석하세요.
overallResult.full은 ${firstUser}님 입장에서 본 이야기, ${secondUser}님 입장에서 본 이야기, 두 사람에게 함께 전하는 조언 순서로 작성하세요.`;

  if (firstGender === secondGender) {
    return {
      people,
      relationship: `두 사람은 동성(${firstLabel}-${secondLabel}) 사이이므로 **우정 궁합**으로 리딩하세요.
연애 감정으로 해석하지 말고, 친구로서의 신뢰, 서로에게 주는 힘, 함께할 때의 케미, 오래 가는 우정을 위한 조언을 중심으로 하세요.
${perspective}`,
    };
  }

  return {
    people,
    relationship: `두 사람은 남녀 사이이므로 **커플 궁합**으로 리딩하세요.
서로에게 느끼는 끌림, 애정 표현 방식의 차이, 연인으로서의 조화, 관계가 더 깊어지기 위한 조언을 중심으로 하세요.
${perspective}`,
  };
}

async function readMatchTarot({ firstUser, secondUser, firstGender, secondGender, cards }) {
  const formatCards = (cardNums) =>
    cardNums.map((num, i) => {
      const card = getCard(num);
      return `  ${i + 1}번째 카드: ${card.name} - ${card.meaning}`;
    }).join("\n");

  const { people, relationship } = matchGuidance(firstUser, secondUser, firstGender, secondGender);

  const userMessage = `두 사람의 궁합 타로 리딩을 해주세요.

${people}

${relationship}

${firstUser}님이 뽑은 카드:
${formatCards(cards.slice(0, 3))}

${secondUser}님이 뽑은 카드:
${formatCards(cards.slice(3, 6))}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system: MATCH_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const reading = JSON.parse(response.content[0].text);
  if (!Array.isArray(reading.cardResults) || reading.cardResults.length !== 6) {
    throw new Error(`궁합 리딩 cardResults가 6개가 아님: ${reading.cardResults?.length}`);
  }
  return reading;
}

module.exports = { readTarot, readMatchTarot };
