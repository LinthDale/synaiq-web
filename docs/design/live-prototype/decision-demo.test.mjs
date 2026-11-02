import test from 'node:test';
import assert from 'node:assert/strict';
import {getMessages} from './i18n.js';
import {renderAnimatedDemo,renderDemoFilm} from './demo-animation.js';
import {decisionFrameAt} from './decision-demo.js';
import {buildScreens} from './scripts/sync-brand-screens.mjs';

test('decision is first, with a readable comparison and conditional advice in every language',()=>{
 for(const locale of ['zh-Hant','en','de']){
  const messages=getMessages(locale),d=messages.demo.decision;
  const html=renderAnimatedDemo({locale,messages});
  assert.match(html,/data-demo-scene="decision"/);
  // Decision content belongs inside the existing product chat, not a replacement UI.
  for(const part of ['film-sidebar','film-question','film-answer','film-input','film-top','film-product-logo']) {
   assert.ok(html.includes(part),`preserve shared chat element: ${part}`);
  }
  assert.equal((html.match(/data-demo-select=/g)||[]).length,5);
  assert.equal((html.match(/data-decision-step=/g)||[]).length,3);
  assert.equal((html.match(/class="decision-turn"/g)||[]).length,3);
  for(const question of d.questions) assert.ok(html.includes(question));
  assert.equal((html.match(/data-demo-chapter=/g)||[]).length,3);
  assert.match(html,/<table><caption>/);
  assert.equal((html.match(/scope="row"/g)||[]).length,3);
  for(const value of ['38.25','36','24'])assert.ok(html.includes(`>${value}</td>`));
  assert.ok(html.includes(d.boundary));
  assert.ok(html.includes(d.evidence));
  assert.doesNotMatch(html,/<form|<input|fetch\(|setInterval|synaiq-ai\.com/);
  if(locale!=='zh-Hant')assert.doesNotMatch(html,/\p{Script=Han}/u);
  const staticScreen=buildScreens().find(s=>s.locale===locale&&s.screen==='decision').source;
  for(const row of d.rows)assert.ok(staticScreen.includes(row[1]));
 }
});

test('three timed turns type, send and answer, then stop on the final answer',()=>{
 const timing={total:10000,durations:[2400,1400,4600,800,800],count:1};
 for(let turn=0;turn<3;turn++){
  assert.deepEqual(decisionFrameAt(turn*10000,timing),{turn,state:'question'});
  assert.deepEqual(decisionFrameAt(turn*10000+2400,timing),{turn,state:'click'});
  assert.deepEqual(decisionFrameAt(turn*10000+3800,timing),{turn,state:'answer'});
 }
 assert.deepEqual(decisionFrameAt(30000,timing),{turn:2,state:'answer'});
 assert.deepEqual(decisionFrameAt(0,timing),{turn:0,state:'question'});
 assert.deepEqual(decisionFrameAt(30000,{...timing,count:0}),{turn:0,state:'question'});
 assert.deepEqual(decisionFrameAt(0,null),{turn:2,state:'answer'});
});

test('decision source text is escaped and retained knowledge tools remain available',()=>{
 const m=structuredClone(getMessages('en'));
 m.demo.decision.rows[0][2]='<img src=x onerror=alert(1)>';
 const html=renderDemoFilm('decision',m);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(renderDemoFilm('knowledge',m),/Equipment_Purchasing_Sample\.pdf/);
 for(const scene of ['text-image','image-image'])assert.match(renderDemoFilm(scene,m),/image-results/);
});

test('profit analysis adds three sourced turns without replacing business decisions', () => {
 for (const locale of ['zh-Hant', 'en', 'de']) {
  const messages = getMessages(locale), d = messages.demo.profit;
  const html = renderAnimatedDemo({locale, messages, initialScene: 'profit'});
  assert.match(html, /data-demo-scene="profit"/);
  assert.match(html, /02 \/ 05/);
  assert.equal((html.match(/class="decision-turn"/g) || []).length, 3);
  assert.equal((html.match(/<table>/g) || []).length, 3);
  assert.equal((html.match(/class="decision-evidence"/g) || []).length, 3);
  for (const id of ['question','source','library']) {
   assert.ok(html.includes(`aria-controls="profit-${id}"`));
   assert.ok(html.includes(`id="profit-${id}"`));
  }
  // Cross-check the scenario arithmetic against the displayed sample values.
  for (const [index, margin] of [0.28, 0.30].entries()) {
   const grossProfit = 1200 * margin;
   assert.equal(Number(d.turns[2].table.rows[1][index + 1]), Math.round(grossProfit));
   assert.equal(Number(d.turns[2].table.rows[3][index + 1]), Math.round(grossProfit - 240));
  }
  for (const value of ['96','120','336','360']) assert.ok(html.includes(`>${value}</td>`));
  assert.ok(html.includes('38.25') === false);
  assert.match(renderDemoFilm('decision', messages), />38.25<\/td>/);
  assert.doesNotMatch(html, /<form|<input|fetch\(|synaiq-ai\.com/);
  if(locale !== 'zh-Hant') assert.doesNotMatch(html, /\p{Script=Han}/u);
 }
});

test('profit tables and evidence escape supplied content', () => {
 const m = structuredClone(getMessages('en'));
 m.demo.profit.turns[0].table.rows[0][0] = '<img src=x onerror=alert(1)>';
 m.demo.profit.turns[2].evidence[0] = '<script>alert(1)</script>';
 const html = renderDemoFilm('profit',m);
 assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html, /<img src=x|<script>/);
});
