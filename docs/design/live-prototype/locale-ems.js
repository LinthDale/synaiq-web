// Product direction confirmed by the owner; examples describe a demo, not a live site.
export const zhHant = {
  screens: {
  "label": "來自示範環境的產品畫面",
  "note": "實際介面截圖 · 畫面數值為示意資料",
  "group": "EMS 產品畫面",
  "enlarge": "放大查看原圖",
  "items": [
    [
      "能源總覽",
      "從電網、太陽能、儲能到廠區負載，同一個畫面掌握能源流向與用電趨勢。"
    ],
    [
      "需量管理",
      "把用電趨勢與契約容量放在一起，查看尖峰時段與需量管理的判讀依據。"
    ],
    [
      "儲能管理",
      "查看儲能狀態、充放電安排與運轉資訊，讓調度討論回到具體介面。"
    ]
  ]
},
  productLabel: 'EMS 能源管理系統',
  title: ['看見用電，', '理解變化，', '把能源管起來。'],
  intro: '一個場域的能源，不只是一張電費單。從即時監控、需量管理到儲能調度，Synaiq EMS 以完整的能源管理流程為目標，讓每一次判斷，都能回到現場資料。',
  status: '示範環境', cta: '看看管理流程',
  sceneLabel: '從現場，走向全局', sceneNote: '示範環境實際介面',
  sceneNodes: ['現場設備', '用電趨勢', '管理決策'],
  storyLabel: '先從一個工作日說起',
  storyTitle: ['電表一直在走，', '問題卻不只一個。'],
  story: ['早上設備陸續啟動，用電跟著升高。到了尖峰時段，管理者想知道：是哪裡變了？需量是否需要留意？儲能能否配合？', '當讀值、警報與報表散在不同地方，一個問題往往要經過多次查找。EMS 的主軸，是把觀察、判讀、管理與回顧接成同一段工作流程。'],
  processTitle: ['從一筆讀值，', '到一次有依據的判斷。'],
  steps: [
    ['掌握現在', '從場域與設備切入，查看即時讀值、狀態與警報，把需要注意的變化找出來。'],
    ['理解原因', '對照歷史趨勢、需量與設備紀錄，確認變化發生的時段與條件，再討論管理策略。'],
    ['管理與回顧', '把儲能調度、事件追蹤與報表放進同一個管理週期，持續核對策略與現場的關係。'],
  ],
  capabilitiesTitle: ['看懂一個設備，', '也看見整個場域。'],
  capabilitiesIntro: '以六個相互連接的工作面向，描繪完整 EMS 的管理範圍。示範環境用來討論流程；實際資料接入、控制條件與交付範圍，依場域確認。',
  capabilities: [
    ['能源總覽與即時監控', '從全場概況一路回到設備讀值，建立日常巡查的共同入口。'],
    ['歷史趨勢與設備分析', '把當下的異常放回時間軸，對照運轉時段與原始紀錄，釐清變化的脈絡。'],
    ['需量管理', '將用電尖峰、需量趨勢與場域目標放在一起討論，讓管理策略有明確依據。'],
    ['儲能管理與調度', '將儲能狀態、充放電需求與用電情境一起評估，逐步確認可執行的調度條件。'],
    ['警報與事件追蹤', '從發現異常、回看紀錄到確認處理結果，讓事件能接續追蹤。'],
    ['報表與管理回顧', '把一段時間的運轉與管理重點整理成可討論的紀錄，支援跨角色溝通。'],
  ],
  demoTitle: ['跟著一天的用電，', '走一遍管理流程。'],
  demoIntro: '點選步驟，看看每個環節要回答的問題，以及下一步需要核對的資訊。',
  demoLabel: '互動流程示意 · 非即時監控',
  demoNote: '本頁為情境示意，不連接設備或下達控制。EMS 示範環境目前以模擬器資料呈現，查看資料需登入。',
  stageGroup: '能源管理流程步驟', questionLabel: '此刻要回答的問題', actionLabel: '接著核對',
  stages: [
    ['巡查全場', '今天的用電，和平常一樣嗎？', '先看整體狀態，再選擇需要關注的設備與時段。', '現場讀值 → 全場概況'],
    ['回看變化', '用電是從什麼時候開始上升？', '對照即時讀值與歷史紀錄，找到變化發生的位置。', '歷史趨勢 → 設備紀錄'],
    ['檢視需量', '尖峰出現時，有哪些管理選擇？', '把需量趨勢與場域目標對照，再評估用電安排。', '需量趨勢 → 管理目標'],
    ['評估調度', '儲能可以怎麼配合現場？', '先核對儲能狀態、設備限制與控制權限，再討論充放電策略。', '儲能狀態 → 調度條件'],
    ['追蹤事件', '這次異常，後來如何處理？', '串起警報時間、設備紀錄與處理狀態，回看事件前後。', '警報事件 → 處理紀錄'],
    ['回顧成果', '這段時間，哪些地方值得再調整？', '整理趨勢與事件，帶著紀錄進行下一輪管理討論。', '管理報表 → 下一輪改善'],
  ],
  external: '進入 EMS 示範環境', externalNote: '另開視窗 · 需示範帳號',
  contact: { heading: ['先說說你的場域，', '一起畫出能源管理流程。'], description: ['從設備、資料來源與管理目標開始，', '一起確認示範情境與導入範圍。'], cta: '洽談 EMS 示範' },
};

export const en = {
  screens: {
  "label": "Inside the demo environment",
  "note": "Actual interface captures · Sample data",
  "group": "EMS product screens",
  "enlarge": "View full-size image",
  "items": [
    [
      "Energy overview",
      "Review grid, solar, storage and site load together, with energy composition and demand trends."
    ],
    [
      "Demand management",
      "Read demand trends alongside contracted capacity to identify the periods that need attention."
    ],
    [
      "Storage management",
      "Review storage state, charge and discharge schedules, and operating information."
    ]
  ]
},
  productLabel: 'EMS · Energy Management System',
  title: ['See the energy.', 'Understand the change.', 'Manage the whole site.'],
  intro: 'A site’s energy story goes beyond its electricity bill. From live monitoring and demand management to storage dispatch, Synaiq EMS is designed around a complete management cycle, with site data behind each decision.',
  status: 'Demo environment', cta: 'Explore the workflow',
  sceneLabel: 'From equipment to the whole site', sceneNote: 'Actual demo interface',
  sceneNodes: ['Site equipment', 'Energy trends', 'Management decisions'],
  storyLabel: 'Start with an ordinary workday',
  storyTitle: ['The meter keeps running.', 'So do the questions.'],
  story: ['Equipment starts up and demand rises. At peak time, the team needs to know: what changed, does demand need attention, and could storage help?', 'When readings, alarms and reports live in different places, each question takes several searches. EMS brings observation, interpretation, management and review into one connected workflow.'],
  processTitle: ['From a reading', 'to an informed decision.'],
  steps: [
    ['See the present', 'Start with the site and its equipment. Review current readings, status and alarms to find changes that need attention.'],
    ['Understand the change', 'Compare trends, demand and equipment records. Establish when and under what conditions a change occurred before discussing a strategy.'],
    ['Manage and review', 'Bring storage dispatch, event tracking and reporting into one cycle, reviewing how each strategy relates to site operation.'],
  ],
  capabilitiesTitle: ['Understand each device.', 'See the entire site.'],
  capabilitiesIntro: 'Six connected areas define the intended EMS scope. The demo supports workflow discussions; data connections, control conditions and delivery scope are confirmed for each site.',
  capabilities: [
    ['Energy overview and live monitoring', 'Move from a site overview to equipment readings through a shared starting point for daily checks.'],
    ['Historical trends and equipment analysis', 'Place a change on a timeline and compare operating periods with original records to understand its context.'],
    ['Demand management', 'Consider peaks, demand trends and site objectives together to inform management strategies.'],
    ['Storage management and dispatch', 'Review storage status, charging needs and site use together to establish workable dispatch conditions.'],
    ['Alarms and event tracking', 'Follow an event from detection through the underlying records to its handling and review.'],
    ['Reports and management review', 'Organize operating and management records for a period so different teams can discuss the same evidence.'],
  ],
  demoTitle: ['Follow a day’s energy.', 'Explore the management cycle.'],
  demoIntro: 'Choose a step to see the question it addresses and the information to check next.',
  demoLabel: 'Interactive workflow illustration · Not live monitoring',
  demoNote: 'This illustration does not connect to or control equipment. The EMS demo currently uses simulator data; viewing it requires an account.',
  stageGroup: 'Energy management workflow steps', questionLabel: 'The question to answer', actionLabel: 'What to check next',
  stages: [
    ['Survey the site', 'Does today’s energy use look familiar?', 'Review the overview, then select the equipment and period that need attention.', 'Site readings → Site overview'],
    ['Trace the change', 'When did energy use begin to rise?', 'Compare current readings with historical records to locate the change.', 'Historical trends → Equipment records'],
    ['Review demand', 'What options do we have at peak time?', 'Compare demand trends with site objectives before reviewing the operating schedule.', 'Demand trends → Site objectives'],
    ['Assess dispatch', 'How could storage support the site?', 'Check storage status, equipment limits and control permissions before discussing a charging strategy.', 'Storage status → Dispatch conditions'],
    ['Follow the event', 'What happened after the alarm?', 'Connect alarm times, equipment records and handling status to review the sequence.', 'Alarm events → Handling records'],
    ['Review the period', 'What should we consider adjusting next?', 'Bring trends and events together as evidence for the next management review.', 'Management reports → Further improvement'],
  ],
  external: 'Open the EMS demo', externalNote: 'Opens in a new tab · Demo account required',
  contact: { heading: ['Tell us about your site.', 'Let’s map its energy workflow.'], description: ['Start with equipment, data sources and management objectives.', 'Together, define a demonstration and an implementation scope.'], cta: 'Discuss an EMS demo' },
};
