// Rider-Waite 78장 타로카드 (0-77)
const TAROT_CARDS = {
  // 메이저 아르카나 (0-21)
  0:  { name: "바보 (The Fool)",               meaning: "새로운 시작, 모험, 순수함, 무한한 가능성" },
  1:  { name: "마법사 (The Magician)",          meaning: "의지력, 능력, 창의성, 행동" },
  2:  { name: "여사제 (The High Priestess)",    meaning: "직관, 신비, 내면의 지혜, 무의식" },
  3:  { name: "여황제 (The Empress)",           meaning: "풍요, 창조, 모성, 자연" },
  4:  { name: "황제 (The Emperor)",             meaning: "권위, 안정, 구조, 리더십" },
  5:  { name: "교황 (The Hierophant)",          meaning: "전통, 신앙, 가르침, 관습" },
  6:  { name: "연인 (The Lovers)",              meaning: "사랑, 선택, 조화, 관계" },
  7:  { name: "전차 (The Chariot)",             meaning: "의지, 승리, 자기 통제, 추진력" },
  8:  { name: "힘 (Strength)",                  meaning: "내면의 힘, 용기, 인내, 자기 확신" },
  9:  { name: "은둔자 (The Hermit)",            meaning: "성찰, 고독, 내면 탐구, 지혜" },
  10: { name: "운명의 수레바퀴 (Wheel of Fortune)", meaning: "변화, 운명, 순환, 행운" },
  11: { name: "정의 (Justice)",                 meaning: "공정함, 균형, 진실, 인과응보" },
  12: { name: "매달린 사람 (The Hanged Man)",   meaning: "희생, 관점의 전환, 기다림, 수용" },
  13: { name: "죽음 (Death)",                   meaning: "변화, 끝과 시작, 변환, 해방" },
  14: { name: "절제 (Temperance)",              meaning: "균형, 조화, 인내, 절제" },
  15: { name: "악마 (The Devil)",               meaning: "집착, 물질주의, 속박, 그림자 자아" },
  16: { name: "탑 (The Tower)",                 meaning: "갑작스러운 변화, 혼란, 파괴 후 재건" },
  17: { name: "별 (The Star)",                  meaning: "희망, 영감, 평온, 치유" },
  18: { name: "달 (The Moon)",                  meaning: "불안, 환상, 무의식, 두려움" },
  19: { name: "태양 (The Sun)",                 meaning: "기쁨, 성공, 활력, 긍정" },
  20: { name: "심판 (Judgement)",               meaning: "각성, 용서, 재탄생, 소명" },
  21: { name: "세계 (The World)",               meaning: "완성, 성취, 통합, 여정의 끝" },

  // 완드 (22-35)
  22: { name: "완드 에이스 (Ace of Wands)",     meaning: "새로운 열정, 창의력의 씨앗, 도전" },
  23: { name: "완드 2 (Two of Wands)",          meaning: "계획, 미래 비전, 결정의 기로" },
  24: { name: "완드 3 (Three of Wands)",        meaning: "탐험, 확장, 기회를 기다림" },
  25: { name: "완드 4 (Four of Wands)",         meaning: "축하, 가정의 행복, 안정" },
  26: { name: "완드 5 (Five of Wands)",         meaning: "경쟁, 갈등, 도전, 의견 충돌" },
  27: { name: "완드 6 (Six of Wands)",          meaning: "승리, 인정, 성공, 자신감" },
  28: { name: "완드 7 (Seven of Wands)",        meaning: "방어, 도전에 맞섬, 굳은 입장" },
  29: { name: "완드 8 (Eight of Wands)",        meaning: "빠른 움직임, 소식, 에너지" },
  30: { name: "완드 9 (Nine of Wands)",         meaning: "회복력, 끈기, 경계" },
  31: { name: "완드 10 (Ten of Wands)",         meaning: "부담, 책임, 과중한 짐" },
  32: { name: "완드 시종 (Page of Wands)",      meaning: "탐험, 열정적 메시지, 새로운 아이디어" },
  33: { name: "완드 기사 (Knight of Wands)",    meaning: "행동, 모험, 충동적 에너지" },
  34: { name: "완드 여왕 (Queen of Wands)",     meaning: "자신감, 독립심, 카리스마" },
  35: { name: "완드 왕 (King of Wands)",        meaning: "리더십, 비전, 열정적 권위" },

  // 컵 (36-49)
  36: { name: "컵 에이스 (Ace of Cups)",        meaning: "새로운 감정, 사랑의 시작, 직관" },
  37: { name: "컵 2 (Two of Cups)",             meaning: "파트너십, 상호 끌림, 연결" },
  38: { name: "컵 3 (Three of Cups)",           meaning: "축하, 우정, 커뮤니티" },
  39: { name: "컵 4 (Four of Cups)",            meaning: "명상, 무관심, 재평가" },
  40: { name: "컵 5 (Five of Cups)",            meaning: "상실, 후회, 슬픔, 실망" },
  41: { name: "컵 6 (Six of Cups)",             meaning: "향수, 추억, 순수함" },
  42: { name: "컵 7 (Seven of Cups)",           meaning: "환상, 선택, 꿈, 욕망" },
  43: { name: "컵 8 (Eight of Cups)",           meaning: "포기, 떠남, 더 깊은 의미 추구" },
  44: { name: "컵 9 (Nine of Cups)",            meaning: "소원 성취, 만족, 감사" },
  45: { name: "컵 10 (Ten of Cups)",            meaning: "행복한 가정, 완전한 사랑, 조화" },
  46: { name: "컵 시종 (Page of Cups)",         meaning: "감성적 메시지, 창의성, 꿈" },
  47: { name: "컵 기사 (Knight of Cups)",       meaning: "낭만, 이상주의, 감성적 행동" },
  48: { name: "컵 여왕 (Queen of Cups)",        meaning: "공감, 직관, 감성적 돌봄" },
  49: { name: "컵 왕 (King of Cups)",           meaning: "감성적 성숙, 균형, 외교" },

  // 소드 (50-63)
  50: { name: "소드 에이스 (Ace of Swords)",    meaning: "명료함, 진실, 새로운 아이디어" },
  51: { name: "소드 2 (Two of Swords)",         meaning: "교착 상태, 결정 보류, 균형" },
  52: { name: "소드 3 (Three of Swords)",       meaning: "상처, 슬픔, 이별, 배신" },
  53: { name: "소드 4 (Four of Swords)",        meaning: "휴식, 회복, 명상" },
  54: { name: "소드 5 (Five of Swords)",        meaning: "갈등, 패배, 불공평한 승리" },
  55: { name: "소드 6 (Six of Swords)",         meaning: "전환, 평화로 이동, 치유" },
  56: { name: "소드 7 (Seven of Swords)",       meaning: "속임수, 전략, 혼자 행동함" },
  57: { name: "소드 8 (Eight of Swords)",       meaning: "제한, 무력감, 자기 속박" },
  58: { name: "소드 9 (Nine of Swords)",        meaning: "불안, 걱정, 악몽" },
  59: { name: "소드 10 (Ten of Swords)",        meaning: "끝, 배신, 완전한 종결" },
  60: { name: "소드 시종 (Page of Swords)",     meaning: "호기심, 경계, 날카로운 정신" },
  61: { name: "소드 기사 (Knight of Swords)",   meaning: "야망, 직접적 행동, 빠른 결단" },
  62: { name: "소드 여왕 (Queen of Swords)",    meaning: "독립, 명료한 판단, 솔직함" },
  63: { name: "소드 왕 (King of Swords)",       meaning: "지적 권위, 명료한 사고, 분석" },

  // 펜타클 (64-77)
  64: { name: "펜타클 에이스 (Ace of Pentacles)", meaning: "새로운 기회, 물질적 시작, 번영" },
  65: { name: "펜타클 2 (Two of Pentacles)",    meaning: "균형, 적응, 멀티태스킹" },
  66: { name: "펜타클 3 (Three of Pentacles)",  meaning: "협력, 기술 개발, 팀워크" },
  67: { name: "펜타클 4 (Four of Pentacles)",   meaning: "안정, 소유, 보수적 태도" },
  68: { name: "펜타클 5 (Five of Pentacles)",   meaning: "어려움, 결핍, 고난" },
  69: { name: "펜타클 6 (Six of Pentacles)",    meaning: "나눔, 관대함, 균형 잡힌 교환" },
  70: { name: "펜타클 7 (Seven of Pentacles)",  meaning: "인내, 평가, 수확을 기다림" },
  71: { name: "펜타클 8 (Eight of Pentacles)",  meaning: "숙련도, 노력, 전문성 개발" },
  72: { name: "펜타클 9 (Nine of Pentacles)",   meaning: "풍요, 독립, 자기 충족" },
  73: { name: "펜타클 10 (Ten of Pentacles)",   meaning: "유산, 가족의 번영, 장기적 성공" },
  74: { name: "펜타클 시종 (Page of Pentacles)", meaning: "학습, 새로운 기회 탐색, 현실적 꿈" },
  75: { name: "펜타클 기사 (Knight of Pentacles)", meaning: "근면, 신뢰성, 꾸준한 진전" },
  76: { name: "펜타클 여왕 (Queen of Pentacles)", meaning: "현실적 돌봄, 풍요, 땅의 지혜" },
  77: { name: "펜타클 왕 (King of Pentacles)",  meaning: "물질적 성공, 안정, 사업적 역량" },
};

const TOPIC_NAMES = {
  love:  "연애/사랑",
  study: "학업/공부",
  dream: "꿈/진로",
  job:   "직업/취업",
  today: "오늘의 운세",
};

const TOPIC_IDS = {
  love: 0, study: 1, dream: 2, job: 3, today: 4,
};

// 앱이 사용자에게 묻는 질문 (앱의 constant/Topics.kt와 같은 문구·순서로 유지할 것)
// 앱은 답변만 보내므로 서버가 질문을 알고 있어야 한다. today는 질문 입력이 없다.
const TOPIC_QUESTIONS = {
  love: [
    "그 사람과의 첫만남은 어땠나요?",
    "그 사람에 대한 현재 나의 감정은?",
    "그 사람과 어떤 관계가 되고 싶나요?",
  ],
  study: [
    "어떤 시험을 준비하고 있나요?",
    "시험을 위해 어떤 노력을 하고 있나요?",
    "시험에서 어떤 결과를 얻고 싶나요?",
  ],
  dream: [
    "이루고 싶은 꿈이 무엇인가요?",
    "그 꿈을 위해 어떤 노력을 하고 있나요?",
    "꿈을 이루는데 있어 가장 장애물이 되는 것이 무엇인가요?",
  ],
  job: [
    "어떤 직무 취업을 준비하고 있나요?",
    "취업을 위해 어떤 노력을 하고 있나요?",
    "취업 준비 중에 어떤 부분이 가장 어려운가요?",
  ],
  today: [],
};

function getCard(cardNumber) {
  return TAROT_CARDS[cardNumber] ?? { name: `카드 ${cardNumber}`, meaning: "알 수 없음" };
}

module.exports = { TAROT_CARDS, TOPIC_NAMES, TOPIC_IDS, TOPIC_QUESTIONS, getCard };
