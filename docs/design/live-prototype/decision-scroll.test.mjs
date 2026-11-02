import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionFrameAt, decisionPacedFrameAt, buildDecisionTimeline, decisionTimelineFrame, scenePlacement, easeDecisionFrame, decisionPreloadOrder } from './decision-scroll.js';
import { DECISION_FRAME_FILES } from './decision-frames.js';

test('scroll frames are bounded, deterministic and reversible without a playback clock', () => {
  assert.equal(decisionFrameAt(-1), 0);
  assert.equal(decisionFrameAt(2), 242);
  assert.equal(decisionFrameAt(NaN), 0);
  const positions = [0, 0.15, 0.5, 0.9, 1];
  const frames = positions.map(p => decisionFrameAt(p));
  assert.deepEqual(frames, [0, 36, 121, 218, 242]);
  assert.deepEqual([...positions].reverse().map(p => decisionFrameAt(p)), [...frames].reverse());
  assert.equal(new Set(DECISION_FRAME_FILES).size, 243);
});

const surfaces = [{top:0,bottom:800},{top:2000,bottom:3000},{top:4400,bottom:5400}];

test('background preload prioritizes nearby frames and covers the sequence once in either direction', () => {
  for (const start of [0, 100, 242]) for (const direction of [-1, 1]) {
    const order = decisionPreloadOrder(start, direction);
    assert.equal(order[0], start);
    assert.equal(order.length, 243);
    assert.equal(new Set(order).size, 243);
    assert.ok(order.every(frame => frame >= 0 && frame < 243));
  }
  assert.deepEqual(decisionPreloadOrder(100, 1).slice(0, 5), [100, 101, 99, 102, 98]);
  assert.deepEqual(decisionPreloadOrder(100, -1).slice(0, 5), [100, 99, 101, 98, 102]);
});
const timeline = () => buildDecisionTimeline(surfaces, {viewportHeight:600,headerHeight:100,start:0,end:4800});

test('brain-to-lit-bulb receives more scroll distance with continuous reversible pacing',()=>{
  const samples=Array.from({length:10001},(_,i)=>decisionPacedFrameAt(i/10000));
  const at=frame=>samples.findIndex(value=>value>=frame)/10000;
  assert.equal(samples[0],0);assert.equal(samples.at(-1),242);
  for(let i=1;i<samples.length;i++)assert.ok(samples[i]>=samples[i-1]&&samples[i]-samples[i-1]<=1);
  assert.ok((at(220)-at(141))/((220-141)/242)>1.6,'brain through illumination should take over 60% more scroll');
  assert.ok((at(210)-at(175))/((210-175)/242)>1.9,'snap/morph core should be about twice as long');
  for(const p of [0,.2,.5,.8,1])assert.equal(decisionPacedFrameAt(p),samples[Math.round(p*10000)]);
  assert.equal(decisionPacedFrameAt(NaN),0);assert.equal(decisionPacedFrameAt(2),242);
});

test('foreground cards do not interrupt progress anywhere inside a black section', () => {
  const map=buildDecisionTimeline([{top:0,bottom:1000},{top:2000,bottom:4000}],
    {headerHeight:100,viewportHeight:650,start:0,end:3350});
  const frame=y=>decisionTimelineFrame(y,map);
  assert.ok(frame(200)>frame(0));
  for(let y=2000;y<=3200;y+=100) assert.ok(frame(y+100)>frame(y),'no pause inside the product/demo region');
  assert.equal(frame(900),frame(1350),'fully covered gap must hold');
  assert.equal(frame(3500),242);
  assert.ok(frame(100)-frame(0)>frame(3000)-frame(2900),'later morph advances fewer frames for the same fully visible scroll');
});

test('short product headings still receive frames instead of concentrating the movie in proof', () => {
  // Both product headings are short; the whole black section must contribute,
  // including the space occupied by foreground cards.
  for (const [heading,card,tail] of [[300,570,197],[254,324,192]]) {
    const product={top:1900,bottom:1900+heading+card+tail};
    const proof={top:product.bottom+1200,bottom:product.bottom+3000};
    const end=proof.bottom-900;
    const map=buildDecisionTimeline([{top:123,bottom:949},product,proof],
      {headerHeight:74,viewportHeight:900,start:49,end});
    const frame=y=>decisionTimelineFrame(y,map);
    const opening=frame(949-74), afterProduct=frame(product.bottom-74);
    assert.ok(opening>=20&&opening<=100,`opening share: ${opening}`);
    assert.ok(afterProduct-opening>=60,`product needs a substantial share: ${afterProduct-opening}`);
    assert.ok(afterProduct>=100,'product must carry the knowledge-gathering phase');
    for(let y=0;y<end;y+=10) assert.ok(frame(y+120)-frame(y)<=24,'no 120px scroll should discharge a whole scene');
  }
});

test('wheel smoothing settles promptly, reverses and is independent of render frequency', () => {
  let frame=0;
  const samples=[];
  for(let i=0;i<25;i++) {frame=easeDecisionFrame(frame,22,16);samples.push(frame);}
  assert.ok(samples[0]>0&&samples[0]<7,'first paint must not jump directly to the destination');
  assert.equal(frame,22,'settles in 400ms, with no ongoing playback');
  assert.ok(easeDecisionFrame(frame,0,16)<frame);
  assert.ok(Math.abs(easeDecisionFrame(easeDecisionFrame(0,22,16),22,16)-easeDecisionFrame(0,22,32))<1e-9);
});

test('opaque gaps do not consume frames and the next visible section resumes continuously', () => {
  const map = timeline();
  const frame = y => decisionTimelineFrame(y, map);
  assert.equal(frame(700), frame(1000));
  assert.equal(frame(1000), frame(1400));
  assert.equal(frame(2900), frame(3500));
  assert.equal(frame(3500), frame(3800));
  assert.ok(frame(500) < frame(700));
  assert.ok(frame(1600) > frame(1400));
  assert.equal(frame(-100), 0);
  assert.equal(frame(5000), 242);
  const positions = [0,120,700,1000,1400,1600,2900,3500,3800,4800];
  const frames = positions.map(frame);
  assert.deepEqual(frames, [...frames].sort((a,b) => a-b));
  assert.deepEqual([...positions].reverse().map(frame), [...frames].reverse());
});

test('partial visibility slows progress; overlap is counted once and layout changes rebuild the map', () => {
  const map = timeline();
  const fullStep = decisionTimelineFrame(200,map)-decisionTimelineFrame(100,map);
  const edgeStep = decisionTimelineFrame(700,map)-decisionTimelineFrame(600,map);
  assert.ok(edgeStep < fullStep);
  const duplicate = buildDecisionTimeline([...surfaces, surfaces[1]], {viewportHeight:600,headerHeight:100,start:0,end:4800});
  assert.deepEqual(duplicate, map);
  const shifted = buildDecisionTimeline([{top:0,bottom:800},{top:3000,bottom:4000},{top:5400,bottom:6400}], {viewportHeight:600,headerHeight:100,start:0,end:5800});
  assert.equal(decisionTimelineFrame(1000,shifted), decisionTimelineFrame(2200,shifted));
  assert.equal(decisionTimelineFrame(999,buildDecisionTimeline([], {viewportHeight:600,headerHeight:100,start:0,end:4800})),0);
});

test('scene covers both viewport orientations and portrait crop retains the right-hand subject', () => {
  for (const [w,h] of [[1440,826],[390,780],[844,326]]) {
    const scene = scenePlacement(w,h,1152,768);
    assert.ok(scene.width >= w && scene.height >= h);
    assert.ok(scene.x <= 0 && scene.x + scene.width >= w);
    assert.ok(scene.y <= 0 && scene.y + scene.height >= h);
  }
  const mobile = scenePlacement(390,780,1152,768);
  const handX = mobile.x + mobile.width * 0.78;
  assert.ok(handX > 0 && handX < 390);
});
