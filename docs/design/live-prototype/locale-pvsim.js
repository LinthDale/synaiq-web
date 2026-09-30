export const zhHant = {
  screens: {
  "label": "從模型，到看得見的設計成果",
  "note": "實際介面截圖 · 已去識別化 · 屋頂示範案例",
  "group": "PVsim 產品畫面",
  "enlarge": "放大查看原圖",
  "items": [
    [
      "三維場域與配置",
      "把場域模型、周邊環境與模組配置放在同一個三維視角裡核對。"
    ],
    [
      "全年遮陰分布",
      "查看遮陰在模組上的分布，找到需要回頭調整配置或串接的區域。"
    ],
    [
      "月發電量比較",
      "對照同一批板位的不同串接方式，閱讀典型氣象與模型假設下的月發電量估算。"
    ],
    [
      "逐板串接設計",
      "從每片模組的歸屬走到串列、MPPT 與逆變器配置，核對電氣設計。"
    ]
  ]
},
  productLabel: 'PVsim 光電模擬與設計',
  title: ['從一個場域，', '走到一套', '想清楚的設計。'],
  intro: '能放多少片，只是設計的開始。Synaiq PVsim 串起場域建模、模組配置、遮陰與發電評估、串接檢核，讓空間、日照與電氣條件，在同一段設計流程裡相互核對。',
  status: '示範環境', cta: '看看設計流程',
  sceneLabel: '讓每一片配置，都有設計脈絡', sceneNote: '示範工作區實際介面',
  sceneNodes: ['場域條件', '日照評估', '串接檢核'],
  storyLabel: '設計，從理解場域開始',
  storyTitle: ['放得下，', '還要想得周全。'],
  story: ['同一個場域，換一種排列，會得到不同的設計。障礙物、可用空間與日照影響配置；配置又會牽動發電評估與電氣串接。', 'PVsim 希望把這些原本容易分開討論的條件，放回同一個案件裡：先建立場景，再調整方案，最後回到假設與檢核結果，說清楚為什麼這樣設計。'],
  processTitle: ['把場域裡的想法，', '一步步變成方案。'],
  steps: [
    ['建立場景', '從場域範圍與障礙條件開始，建立可討論的模型，釐清設計邊界。'],
    ['配置與評估', '安排模組並比較不同配置，將遮陰與發電評估帶回方案調整。'],
    ['串接與核對', '接續檢視電氣串接條件，整理方案與成果，讓設計討論有共同依據。'],
  ],
  capabilitiesTitle: ['空間、日照、電氣，', '一起放進設計裡。'],
  capabilitiesIntro: '從快速配置到設計核對，六個面向構成 PVsim 的產品方向。目前提供示範環境，計算條件、設備資料與實際交付範圍，於案件中逐項確認。',
  capabilities: [
    ['場域模型與場景整理', '先釐清場域與障礙條件，讓後續配置從同一份場景資料出發。'],
    ['模組配置與方案調整', '以可用空間為起點探索排列方式，讓配置選擇能回到現場條件。'],
    ['遮陰評估', '把周邊遮擋與日照影響納入設計討論，找出需要重新檢視的配置區域。'],
    ['發電評估', '將配置與計算假設一起閱讀，理解方案的預估表現與條件。'],
    ['電氣串接檢核', '從空間配置接續到串接安排，核對模組、變流器與串列的設計條件。'],
    ['案件與成果整理', '以案件保存設計脈絡，讓方案、假設與成果可以接續檢視和溝通。'],
  ],
  demoTitle: ['從一個場域出發，', '走完設計的每一步。'],
  demoIntro: '點選步驟，從場域條件一路看到配置、評估與串接需要核對的事情。',
  demoLabel: '互動流程示意 · 非工程計算結果',
  demoNote: '本頁為設計情境示意，不進行發電或電氣計算。PVsim 示範工作區需登入，帳號由管理者提供。',
  stageGroup: '光電設計流程步驟', questionLabel: '此刻要回答的問題', actionLabel: '接著核對',
  stages: [
    ['認識場域', '這個場域，有哪些可用與受限的地方？', '整理場域邊界、障礙物與現場條件，先把設計範圍說清楚。', '場域條件 → 場景模型'],
    ['安排模組', '模組怎麼排，才符合這個場景？', '在可用區域探索配置方式，對照排列與空間限制。', '可用空間 → 模組配置'],
    ['核對遮陰', '有哪些位置，值得再看一次日照？', '把遮擋條件帶回配置討論，找出需要調整或確認的區域。', '遮擋條件 → 配置調整'],
    ['評估發電', '這個方案的預估，建立在哪些條件上？', '一起閱讀配置、計算假設與預估結果，再比較方案。', '配置與假設 → 發電評估'],
    ['檢視串接', '排得下的模組，電氣條件也合適嗎？', '對照模組與變流器資料，檢視串列安排及待確認的條件。', '設備條件 → 串接檢核'],
    ['整理方案', '如何讓下一位接手的人理解設計？', '將場景、方案與核對重點放回案件，保留後續討論的脈絡。', '設計成果 → 案件紀錄'],
  ],
  external: '進入 PVsim 示範工作區', externalNote: '另開視窗 · 需示範帳號',
  contact: { heading: ['帶著你的場域，', '一起展開設計討論。'], description: ['從場址條件、配置需求與評估目的開始，', '一起確認示範案件與設計流程。'], cta: '洽談 PVsim 示範' },
};

export const en = {
  screens: {
  "label": "From a model to visible design results",
  "note": "Actual demo captures · De-identified · Rooftop example in Chinese",
  "group": "PVsim product screens",
  "enlarge": "View full-size image",
  "items": [
    [
      "3D site and layout",
      "Review the site model, surrounding environment and module placement in one 3D view."
    ],
    [
      "Annual shading distribution",
      "See where shading falls across modules to identify layout and string decisions to revisit."
    ],
    [
      "Monthly yield comparison",
      "Compare string arrangements for the same module positions using typical weather and model assumptions."
    ],
    [
      "Module-level string design",
      "Follow each module into its string, MPPT input and inverter configuration for electrical review."
    ]
  ]
},
  productLabel: 'PVsim · Solar Simulation & Design',
  title: ['Start with a site.', 'Work through', 'the whole design.'],
  intro: 'Panel count is only the beginning. Synaiq PVsim connects site modeling, module layout, shading and generation assessment, and string checks so spatial, solar and electrical conditions can be reviewed together.',
  status: 'Demo environment', cta: 'Explore the design process',
  sceneLabel: 'Give every layout a design rationale', sceneNote: 'Actual demo workspace',
  sceneNodes: ['Site conditions', 'Solar assessment', 'String checks'],
  storyLabel: 'Design starts with understanding the site',
  storyTitle: ['It needs to fit.', 'It also needs thought.'],
  story: ['A different layout on the same site creates a different design. Obstacles, available space and sunlight affect placement; placement in turn affects generation estimates and electrical strings.', 'PVsim brings these connected questions into one project: build the scene, adjust a scheme, then revisit the assumptions and checks to explain why the design makes sense.'],
  processTitle: ['Turn an idea for a site', 'into a considered scheme.'],
  steps: [
    ['Build the scene', 'Start with site boundaries and obstacles to create a shared model and establish the design limits.'],
    ['Lay out and assess', 'Explore module arrangements, bringing shading and generation assessments back into layout decisions.'],
    ['Connect and review', 'Review electrical string conditions and organize the scheme and findings for the next discussion.'],
  ],
  capabilitiesTitle: ['Space, sunlight, electricity.', 'One design conversation.'],
  capabilitiesIntro: 'Six areas define the PVsim product direction, from layout to design checks. A demo environment is available; calculation conditions, equipment data and delivery scope are confirmed for each project.',
  capabilities: [
    ['Site modeling and scene preparation', 'Establish site and obstacle conditions so every layout begins with the same scene information.'],
    ['Module layout and scheme adjustments', 'Explore arrangements within the available space, relating placement choices to site conditions.'],
    ['Shading assessment', 'Bring surrounding obstructions and sunlight into the discussion to identify areas that need another look.'],
    ['Generation assessment', 'Read the layout alongside calculation assumptions to understand a scheme’s estimated performance and conditions.'],
    ['Electrical string checks', 'Continue from spatial layout to string planning, reviewing module, inverter and string design conditions.'],
    ['Project and result organization', 'Keep design context with each project so schemes, assumptions and results can be reviewed and discussed later.'],
  ],
  demoTitle: ['Follow one site', 'through the design process.'],
  demoIntro: 'Choose a step to explore the questions behind site preparation, layout, assessment and string checks.',
  demoLabel: 'Interactive workflow illustration · Not engineering results',
  demoNote: 'This illustration does not calculate energy yield or electrical performance. The PVsim demo workspace requires an account provided by an administrator.',
  stageGroup: 'Solar design workflow steps', questionLabel: 'The question to answer', actionLabel: 'What to check next',
  stages: [
    ['Understand the site', 'Which parts of this site are available or constrained?', 'Gather site boundaries, obstacles and site conditions to establish the design area.', 'Site conditions → Scene model'],
    ['Place the modules', 'Which arrangement works with this scene?', 'Explore the available area and compare placement with spatial constraints.', 'Available space → Module layout'],
    ['Review shading', 'Which areas need a closer look at sunlight?', 'Bring obstruction conditions back into the layout discussion to identify areas to review.', 'Obstructions → Layout adjustments'],
    ['Assess generation', 'Which assumptions support this estimate?', 'Read the layout, calculation assumptions and estimates together before comparing schemes.', 'Layout and assumptions → Generation assessment'],
    ['Check strings', 'Do the electrical conditions fit the layout?', 'Review module and inverter data alongside string arrangements and open questions.', 'Equipment conditions → String checks'],
    ['Organize the scheme', 'Can the next person understand the design?', 'Keep the scene, scheme and review points with the project for future discussion.', 'Design results → Project records'],
  ],
  external: 'Open the PVsim demo workspace', externalNote: 'Opens in a new tab · Demo account required',
  contact: { heading: ['Bring your site to the table.', 'Let’s explore its design.'], description: ['Start with site conditions, layout needs and assessment goals.', 'Together, define a demo project and a design workflow.'], cta: 'Discuss a PVsim demo' },
};
