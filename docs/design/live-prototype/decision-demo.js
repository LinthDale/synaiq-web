import { escapeHtml as e } from './i18n.js';

// These are the supplied example's output values, not a reconstructed calculation.
// Keep the comparison and the static illustration on the same localized content.
function decisionAnswers(messages) {
  const d=messages.demo.decision;
  const rows=d.rows.map(([name,value,tradeoff])=>`<tr><th scope="row">${e(name)}</th><td class="decision-value">${e(value)}</td><td>${e(tradeoff)}</td></tr>`).join('');
  return [
    `
      <section class="decision-step" data-decision-step="question" id="decision-question" aria-labelledby="decision-question-title">
        <h4 id="decision-question-title">1. ${e(d.chapters[0])}</h4>
        <p>${e(d.context)}</p>
        <ul>${d.inputs.map(([title,copy])=>`<li><strong>${e(title)}</strong>：${e(copy)}</li>`).join('')}</ul>
        <details class="decision-evidence"><summary>${e(d.evidenceLabel)}</summary><p>${e(d.evidence)}</p></details>
      </section>`,
    `
      <section class="decision-step" data-decision-step="source" id="decision-source" aria-labelledby="decision-source-title">
        <h4 id="decision-source-title">2. ${e(d.chapters[1])}</h4>
        <div class="decision-table-wrap" role="region" tabindex="0" aria-label="${e(d.comparisonTitle)}"><table><caption>${e(d.metric)}</caption><thead><tr>${d.columns.map(v=>`<th scope="col">${e(v)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        <p class="decision-ranking">${e(d.ranking)}</p><p class="decision-footnote">${e(d.numberNote)}</p>
      </section>`,
    `
      <section class="decision-step" data-decision-step="library" id="decision-library" aria-labelledby="decision-library-title">
        <h4 id="decision-library-title">3. ${e(d.chapters[2])}</h4>
        <p>${e(d.recommendationTitle)}</p>
        <div class="decision-recommendations">${d.recommendations.map(([title,copy])=>`<div><h5>${e(title)}</h5><p>${e(copy)}</p></div>`).join('')}</div>
        <h5>${e(d.reassessTitle)}</h5><ul>${d.conditions.map(v=>`<li>${e(v)}</li>`).join('')}</ul>
        <p class="decision-boundary">${e(d.boundary)}</p>
      </section>`
  ];
}

function profitAnswers(d) {
  return d.turns.map((turn, index) => {
    const chapter = ['question', 'source', 'library'][index];
    const table = turn.table;
    return `<section class="decision-step" data-decision-step="${chapter}" id="profit-${chapter}" aria-labelledby="profit-${chapter}-title">
      <h4 id="profit-${chapter}-title">${index + 1}. ${e(d.chapters[index])}</h4>
      <p>${e(turn.intro)}</p>
      <div class="decision-table-wrap" role="region" tabindex="0" aria-label="${e(table.caption)}"><table><caption>${e(table.caption)}</caption>
        <thead><tr>${table.columns.map(value => `<th scope="col">${e(value)}</th>`).join('')}</tr></thead>
        <tbody>${table.rows.map(([label, ...values]) => `<tr><th scope="row">${e(label)}</th>${values.map(value => `<td class="decision-value">${e(value)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <div class="decision-recommendations">${turn.points.map(([title, copy]) => `<div><h5>${e(title)}</h5><p>${e(copy)}</p></div>`).join('')}</div>
      <p class="decision-boundary">${e(turn.conclusion)}</p>
      <details class="decision-evidence"><summary>${e(d.evidenceLabel)}</summary>${turn.evidence.map(copy => `<p>${e(copy)}</p>`).join('')}</details>
    </section>`;
  });
}

export function renderDecisionConversation(messages, scene = 'decision') {
  const d = messages.demo[scene];
  const answers = scene === 'profit' ? profitAnswers(d) : decisionAnswers(messages);
  return `<div class="decision-transcript" tabindex="0" role="region" aria-label="${e(d.title)}">${answers.map((answer,index)=>`
    <div class="decision-turn" data-decision-turn="${index}">
      <div class="film-question"><span>${e(d.questions[index])}</span></div>
      <div class="film-thinking"><i></i><i></i><i></i><span>${e(d.thinking || messages.demo.thinking)}</span></div>
      <div class="film-answer"><span class="film-avatar">${e(messages.demo.avatar)}</span><div class="decision-story">${answer}</div></div>
    </div>`).join('')}</div>`;
}

// Each turn uses the existing typing/send/answer clock. Last two holds are reading time.
export function decisionFrameAt(milliseconds, timing) {
  if(!timing) return {turn:2,state:'answer'};
  const total=timing.total*3;
  const end=timing.count>0 && milliseconds>=total*timing.count;
  const local=end?total-1:((milliseconds%total)+total)%total;
  const turn=Math.min(2,Math.floor(local/timing.total));
  const offset=local-turn*timing.total;
  return {turn,state:end?'answer':offset<timing.durations[0]?'question':offset<timing.durations[0]+timing.durations[1]?'click':'answer'};
}
