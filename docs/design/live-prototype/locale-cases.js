// Overview copy plus one block per case, keyed by the identifiers in cases-data.js.
// The recovered Tokyo exhibition story; no sales results attributed to AI.
export const zhHant = {
  overview: {
    eyebrow: '實績展示 · SELECTED WORK',
    title: ['讓 AI 走進現場，', '讓對話', '跨越語言。'],
    intro: '科技的價值，在相遇時發生。讓資訊有一張親切的面孔，也讓第一線服務，多一種與人溝通的方式。',
    action: '翻開這些故事',
    listTitle: '一起見證我們的旅途',
    readCase: '翻開這個故事',
    back: '回到旅途',
    notFound: { title: '找不到此案例', body: '這一站還沒有故事。回到旅途，看看其他現場。' },
    closing: '下一段故事，從你的場域開始。',
  },
  // Only the content a case actually provided; label text for the identifiers in cases-data.js.
  tags: {
    exhibition: '國際展會', multilingual: '四語導覽', digitalHuman: 'AI 數位人',
    'knowledge-platform': 'KIP 知識平台', 'industry-forum': '產業論壇', panel: '綜合論談',
  },
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
        title: ['在東京的現場，', '對話真的發生了。'],
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
    'tainan-tech-forum-2026': {
      name: '臺南市科技產業論壇',
      dateLabel: '2026.09',
      summary: '讓企業累積的文件與經驗，成為團隊用得上的知識。SynaiQ 在臺南展示 KIP 智慧知識平台，並參與綜合論談，分享 AI 在企業知識管理中的應用。',
      chapter: '02 / 臺南市科技產業論壇', journey: 'TAINAN · HOME GROUND',
      photos: {
        hero: {
          alt: '臺南市科技產業論壇展區，SynaiQ 人員在螢幕前向經濟發展局長官介紹 KIP',
          label: '暫停或繼續臺南市科技產業論壇展區照片顯影',
          caption: '2026.09.16 · 展區，KIP 示範',
        },
        panel: {
          alt: '論壇綜合論談台上五位與談人，最右側持麥克風者為 SynaiQ 與談人',
          label: '暫停或繼續臺南市科技產業論壇綜合論談照片顯影',
          caption: '綜合論談 · 最右側為 SynaiQ 與談人',
        },
      },
      facts: [['場域', '臺南市科技產業論壇', '大臺南會展中心 · 2026.09.16–17'], ['展示', 'KIP 智慧知識平台', '企業知識管理與來源追溯'], ['角色', '參展與綜合論談與談', '臺南市政府經濟發展局主辦']],
      story: {
        eyebrow: '01 / THE STORY',
        title: ['讓企業的知識，', '成為團隊的能力。'],
        paragraphs: [
          '115年臺南市科技產業研討暨策展，由臺南市政府經濟發展局主辦，2026 年 9 月 16 至 17 日在大臺南會展中心舉行。兩天的專題論壇與產業策展，聚焦 AI 技術應用與綠色能源。',
          'SynaiQ 在展區介紹 KIP 智慧知識平台，聚焦企業日常的知識管理需求：文件分散在不同地方、查找資料耗時，以及經驗難以交接。KIP 將文件接入、解析與分庫管理串接起來，讓團隊能以自然語言提問，並沿著回答中的引用回到原始資料。',
          '除了展區展示，SynaiQ 也參與綜合論談。本次分享以企業知識管理為核心，關注如何把累積的文件與經驗整理成可查詢、可追溯、可持續維護的知識，支援組織日常工作與經驗傳承。',
        ],
      },
      field: {
        eyebrow: '02 / IN THE FIELD',
        title: ['從資料累積，', '到知識傳承。'],
        intro: 'KIP 著重企業內部的知識管理，從文件整合、查詢到來源確認，讓組織經驗能被找到、理解並持續運用。',
        notes: [
          ['整合企業文件', '將分散的文件接入知識中心，透過解析與分庫整理，建立團隊共用的知識基礎。'],
          ['讓回答有據可查', '以自然語言查詢工作所需資訊，回答附上引用來源，方便回看原文、確認內容與脈絡。'],
          ['讓經驗留在組織', '把作業文件與經驗紀錄納入可持續維護的知識庫，支援日常協作、新人學習與工作交接。'],
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
    listTitle: 'Walk the journey with us',
    readCase: 'Explore the story',
    back: 'Back to the journey',
    notFound: { title: 'Case not found', body: 'No story at this stop yet. Return to the journey and see the other fields.' },
    closing: 'Your setting could be the next story.',
  },
  tags: {
    exhibition: 'International exhibition', multilingual: 'Four languages', digitalHuman: 'AI digital human',
    'knowledge-platform': 'KIP Knowledge Platform', 'industry-forum': 'Industry forum', panel: 'Panel',
  },
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
        title: ['In Tokyo,', 'the conversations happened.'],
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
    'tainan-tech-forum-2026': {
      name: 'Tainan Technology Industry Forum',
      dateLabel: 'SEPTEMBER 2026',
      summary: 'At the Tainan forum, SynaiQ presented KIP for enterprise knowledge management: connecting company documents, traceable answers, and shared experience.',
      chapter: '02 / TAINAN TECHNOLOGY INDUSTRY FORUM', journey: 'TAINAN · HOME GROUND',
      photos: {
        hero: {
          alt: 'SynaiQ staff presenting KIP on a screen to Bureau of Economic Development officials on the Tainan forum exhibition floor',
          label: 'Pause or resume the Tainan forum exhibition photograph reveal',
          caption: '16 Sep 2026 · Exhibition floor, KIP demo',
        },
        panel: {
          alt: 'Five panelists on the forum stage; the SynaiQ panelist speaks at far right',
          label: 'Pause or resume the Tainan forum panel photograph reveal',
          caption: 'Forum panel · SynaiQ panelist at far right',
        },
      },
      facts: [['Venue', 'Tainan Technology Industry Forum', 'ICC Tainan · 16–17 Sep 2026'], ['On show', 'KIP Knowledge Platform', 'Enterprise knowledge management with traceable sources'], ['Role', 'Exhibitor and panelist', 'Hosted by the Bureau of Economic Development, Tainan City Government']],
      story: {
        eyebrow: '01 / THE STORY',
        title: ['Company knowledge,', 'shared team capability.'],
        paragraphs: [
          'The 2026 Tainan Technology Industry Forum and Exhibition, hosted by the Bureau of Economic Development, Tainan City Government, ran on 16–17 September 2026 at ICC Tainan. Two days of talks and showcases focused on applied AI and green energy.',
          'SynaiQ presented KIP around everyday knowledge management needs: scattered documents, time spent searching, and experience that is difficult to pass on. KIP connects document ingestion, parsing, and library management, so teams can ask questions in natural language and follow citations back to the original material.',
          'SynaiQ also joined the forum panel. Our contribution focused on enterprise knowledge management: organizing documents and experience into knowledge that can be searched, traced, and maintained to support daily work and knowledge transfer.',
        ],
      },
      field: {
        eyebrow: '02 / IN THE FIELD',
        title: ['From stored information', 'to shared knowledge.'],
        intro: 'KIP focuses on knowledge management within the enterprise. Document integration, search, and source verification help teams find, understand, and reuse what their organization knows.',
        notes: [
          ['Bring documents together', 'Connect scattered documents to the knowledge center, then parse and organize them into libraries that provide a shared foundation for the team.'],
          ['Check every answer against its source', 'Ask for work information in natural language. Citations lead back to the original material so people can verify the answer and its context.'],
          ['Keep experience in the organization', 'Maintain procedures and records of experience in a knowledge base that supports collaboration, onboarding, and handovers.'],
        ],
      },
    },
  },
};
