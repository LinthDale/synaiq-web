// Static illustrations share purchasing copy with the animated interface.
// Generated from JSON via the same catalog as the animated interface. Node build only.
import { LOCALE_CONFIG } from './locale-config.js';
import { loadMessages } from './locale-store.js';

export const screenLocaleSuffixes = Object.freeze(Object.fromEntries(LOCALE_CONFIG.map(({ code, suffix }) => [code, suffix])));
const catalogs = Object.fromEntries(await Promise.all(LOCALE_CONFIG.map(async ({ code }) => [code, await loadMessages(code)])));

export const screenMessages = Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => {
  const demo = catalog.demo;
  const c = catalog.screens;
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
