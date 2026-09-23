// Static illustrations share purchasing copy with the animated interface.
// Edit locale-demo.js for questions, answers, source filenames and send labels.
import { zhHant, en } from './locale-demo.js';

export const screenLocaleSuffixes = Object.freeze({ 'zh-Hant': '', en: '-en' });
const captions = {
  'zh-Hant': { searchTitle: 'Synaiq KIP 智慧搜尋介面示意', libraryTitle: 'Synaiq KIP 知識中心介面示意', description: '品牌化介面與虛構採購流程示意，並非真實產品截圖或客戶資料。', format: '格式', search: '搜尋文件名稱', add: '＋ 接入文件', pdf: 'PDF', word: 'Word', excel: 'Excel' },
  en: { searchTitle: 'Synaiq KIP knowledge search interface concept', libraryTitle: 'Synaiq KIP knowledge center interface concept', description: 'Branded interface and fictional purchasing process, not a live product screenshot or customer data.', format: 'Format', search: 'Search document names', add: '＋ Add files', pdf: 'PDF', word: 'Word', excel: 'Excel' },
};

export const screenMessages = Object.fromEntries(Object.entries({ 'zh-Hant': zhHant, en }).map(([locale, demo]) => {
  const c = captions[locale];
  const common = {
    description: c.description, productLabel: demo.productLabel,
    newChat: demo.newChat, recentQuestions: demo.recentQuestions,
    conversationTopic: demo.warrantyTopic, knowledgeCenter: demo.knowledgeCenter,
    sourcesQuestion: demo.sourceTopic, workspace: demo.workspace, footer: demo.productNote,
  };
  return [locale, {
    search: {
      ...common, title: c.searchTitle, breadcrumb: demo.breadcrumb,
      question: demo.question, avatar: demo.avatar, answerHeading: demo.answer,
      answerClause: demo.answerHighlight, answerNote: demo.answerNote,
      sourceLabel: demo.citationLabel, sourceFilename: demo.citationFilename,
      sourcePage: demo.citationPage, sourceDisclaimer: demo.libraryNote,
      followup: demo.followUp, send: demo.send,
    },
    library: {
      ...common, title: c.libraryTitle, heading: demo.libraryTitle, intro: demo.libraryIntro,
      searchPlaceholder: c.search, addDocument: c.add,
      columnName: demo.tableHeaders[0], columnFormat: c.format, columnStatus: demo.tableHeaders[1],
      contractFilename: demo.tableRows[0][0], workflowFilename: demo.tableRows[1][0], indexFilename: demo.tableRows[2][0],
      pdfFormat: c.pdf, wordFormat: c.word, excelFormat: c.excel,
      contractStatus: demo.tableRows[0][1], workflowStatus: demo.tableRows[1][1], indexStatus: demo.tableRows[2][1],
      disclaimer: demo.libraryNote,
    },
  }];
}));
