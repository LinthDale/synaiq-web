// Overview copy plus one block per case, keyed by the identifiers in cases-data.js.
// The recovered Tokyo exhibition story; no sales results attributed to AI.
export const zhHant = {
  overview: {
    eyebrow: '實績展示 · SELECTED WORK',
    title: ['讓 AI 走進現場，', '讓對話', '跨越語言。'],
    intro: '科技的價值，在相遇時發生。讓資訊有一張親切的面孔，也讓第一線服務，多一種與人溝通的方式。',
    action: '翻開這些故事',
    listTitle: '全部實績',
    readCase: '翻開這個故事',
    back: '返回全部實績',
    notFound: { title: '找不到此案例', body: '請回到全部實績，選擇其他案例。' },
    closing: '下一段故事，從你的場域開始。',
  },
  // Only the content a case actually provided; label text for the identifiers in cases-data.js.
  tags: { exhibition: '國際展會', multilingual: '四語導覽', digitalHuman: 'AI 數位人' },
  cases: {
    'tokyo-foodex-2026': {
      name: '東京食品展',
      dateLabel: '2026.03',
      summary: '從台南到東京，一個熟悉的身影，用四種語言，向世界介紹台灣的好味道。',
      chapter: '01 / 東京食品展', journey: 'TAINAN → TOKYO',
      photos: {
        hero: {
          label: '暫停或繼續東京食品展現場照片顯影',
          alt: '東京食品展，來賓與台南市長 AI 數位人互動的手繪場景',
          caption: '2026.03 · 東京食品展現場',
        },
        team: {
          label: '暫停或繼續東京食品展團隊合照顯影',
          alt: '台南展區與 AI 數位人裝置旁三位來賓的手繪合照',
          caption: '台南展區 · AI 數位人與現場團隊',
        },
      },
      facts: [['場域', '國際展會', '東京食品展 · 2026'], ['互動', '四語導覽', '中文 / 日文 / 英文 / 韓文'], ['整合', 'AI 數位人', '數位分身 × 現場裝置']],
      story: {
        eyebrow: '01 / THE STORY',
        title: ['一位市長的分身，', '一座城市的邀請。'],
        paragraphs: [
          '2026 年 3 月 10 日，台南前進東京食品展。面對來自不同國家的買家，如何讓城市的故事與在地農產，被更多人聽懂？',
          '鑫揚智能以 AI 數位人與軟硬體整合，將台南市長黃偉哲的 AI 分身帶到展場。透過中文、日文、英文與韓文導覽，讓介紹從單向展示，延伸為面對面的互動。',
        ],
      },
      field: {
        eyebrow: '02 / IN THE FIELD',
        title: ['科技的價值，', '在相遇時發生。'],
        intro: '讓資訊有一張親切的面孔，也讓第一線服務，多一種與人溝通的方式。',
        notes: [
          ['從人的互動出發', '以熟悉的城市代表作為導覽入口，讓訪客自然開始對話。'],
          ['讓語言成為橋梁', '將四種語言帶進同一個服務場景，回應國際展會的溝通需求。'],
          ['把技術接到現場', '串接數位人內容與展示裝置，讓 AI 服務走到訪客面前。'],
        ],
      },
      press: {
        title: '從報導，看見現場。',
        links: [
          ['蕃新聞', '鑫揚智能助台南市長 AI 分身進軍東京食品展'],
          ['ETtoday 新聞雲', '東京食品展 · 台南展區報導'],
        ],
      },
    },
  },
};

export const en = {
  overview: {
    eyebrow: 'SELECTED WORK',
    title: ['AI in the field.', 'Conversations', 'beyond language.'],
    intro: 'Technology finds meaning when people connect. A familiar face for information. Another way for front-line teams to welcome people.',
    action: 'Explore the stories',
    listTitle: 'All work',
    readCase: 'Explore the story',
    back: 'Back to all work',
    notFound: { title: 'Case not found', body: 'Return to all work to choose another case.' },
    closing: 'Your setting could be the next story.',
  },
  tags: { exhibition: 'International exhibition', multilingual: 'Four languages', digitalHuman: 'AI digital human' },
  cases: {
    'tokyo-foodex-2026': {
      name: 'FOODEX Japan',
      dateLabel: 'MARCH 2026',
      summary: 'From Tainan to Tokyo, a familiar face introduces the flavors of Taiwan in four languages.',
      chapter: '01 / TOKYO FOOD EXHIBITION', journey: 'TAINAN → TOKYO',
      photos: {
        hero: {
          label: 'Pause or resume the exhibition photograph reveal',
          alt: 'Hand-drawn scene of a visitor beside the Tainan mayor’s AI digital human at the Tokyo exhibition',
          caption: 'MARCH 2026 · TOKYO FOOD EXHIBITION',
        },
        team: {
          label: 'Pause or resume the exhibition group photograph reveal',
          alt: 'Hand-drawn group of three visitors beside the AI digital-human device in the Tainan booth',
          caption: 'TAINAN BOOTH · DIGITAL HUMAN & ON-SITE TEAM',
        },
      },
      facts: [['SETTING', 'International exhibition', 'Tokyo · 2026'], ['INTERACTION', 'Four languages', 'Mandarin / Japanese / English / Korean'], ['INTEGRATION', 'AI digital human', 'Digital twin × On-site device']],
      story: {
        eyebrow: '01 / THE STORY',
        title: ['A mayor’s digital twin.', 'An invitation from a city.'],
        paragraphs: [
          'On March 10, 2026, Tainan arrived at the Tokyo food exhibition. With buyers visiting from different countries, how could more people connect with its local produce and the stories behind it?',
          'SynaiQ brought an AI digital twin of Tainan Mayor Huang Wei-che to the exhibition through digital-human technology and hardware–software integration. Guidance in Mandarin, Japanese, English and Korean opened a new way to interact with visitors.',
        ],
      },
      field: {
        eyebrow: '02 / IN THE FIELD',
        title: ['Technology finds meaning', 'when people connect.'],
        intro: 'A familiar face for information. Another way for front-line teams to welcome people.',
        notes: [
          ['Begin with people', 'A familiar city representative gives visitors a natural starting point for a conversation.'],
          ['Let language connect', 'Four languages in one service setting respond to the communication needs of an international exhibition.'],
          ['Bring the pieces together', 'Digital-human content and the exhibition device work together to put AI in front of visitors.'],
        ],
      },
      press: {
        title: 'Another view of the story.',
        links: [
          ['Yam News', 'SynaiQ brings the Tainan mayor’s AI digital twin to Tokyo'],
          ['ETtoday', 'Coverage from the Tainan booth in Tokyo'],
        ],
      },
    },
  },
};
