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

async function readMatchTarot({ firstUser, secondUser, cards }) {
  const firstCards = cards.slice(0, 3);
  const secondCards = cards.slice(3, 6);

  const formatCards = (cardNums) =>
    cardNums.map((num, i) => {
      const card = getCard(num);
      return `  ${i + 1}번째 카드: ${card.name} - ${card.meaning}`;
    }).join("\n");

  const userMessage = `두 사람의 궁합 타로 리딩을 해주세요.

${firstUser}님이 뽑은 카드:
${formatCards(firstCards)}

${secondUser}님이 뽑은 카드:
${formatCards(secondCards)}

두 사람의 카드를 종합하여 궁합 리딩을 해주세요. 각 카드 설명에는 해당 카드가 두 사람 관계에서 어떤 의미인지 담아주세요.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return JSON.parse(response.content[0].text);
}

module.exports = { readTarot, readMatchTarot };
