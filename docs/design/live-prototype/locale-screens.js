// Static illustrations share purchasing copy with the animated interface.
// Generated from JSON via the same catalog as the animated interface. Node build only.
import { LOCALE_CONFIG } from './locale-config.js';
import { loadMessages } from './locale-store.js';

export const screenLocaleSuffixes = Object.freeze(Object.fromEntries(LOCALE_CONFIG.map(({ code, suffix }) => [code, suffix])));
const catalogs = Object.fromEntries(await Promise.all(LOCALE_CONFIG.map(async ({ code }) => [code, await loadMessages(code)])));

export const screenMessages = Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => {
  const demo = catalog.demo;
  const c = catalog.screens;
  const d = demo.decision;
  const common = {
    description: c.description, productLabel: demo.productLabel,
    newChat: demo.newChat, recentQuestions: demo.recentQuestions,
    conversationTopic: demo.warrantyTopic, knowledgeCenter: demo.knowledgeCenter,
    sourcesQuestion: demo.sourceTopic, workspace: demo.workspace, footer: demo.productNote,
  };
  return [locale, {
    decision: {
      ...common, description:catalog.home.products.screenAlt, title:demo.productTitle, conversationTopic:d.topic,
      question:d.screenQuestion, metric:d.screenMetric,
      optionA:d.rows[0][0], valueA:d.rows[0][1], optionC:d.rows[1][0], valueC:d.rows[1][1], optionB:d.rows[2][0], valueB:d.rows[2][1],
      adviceA:d.screenA, adviceC:d.screenC, conditions:d.screenConditions,
      note:d.screenNote,
    },
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
