window.__emsCompiledLogic=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  renderVals() {
    var props = this.props || {};
    var showSketch = props.showSketch == null ? true : props.showSketch;
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    var fmt = function (v, d) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
    var pad2 = function (n) { return String(n).padStart(2, '0'); };

    // Sample snapshot (示意資料), shared with 能源總覽: SOC 78 %, 58 kW discharging, 209 kWh / 200 kW.
    var soc = 78, cap = 209, kw = 58;

    // Operating mode (tweak previews each state of the machine).
    var code = props.mode || 'GRID_TIE';
    var MODES = {
      STANDBY: { name: '待機', desc: 'PCS 不輸出，接觸器保持，等待排程或指令。', kw: 0, kvar: 0, power: '待機 · 0 kW', pcs: '待命 · 無故障碼', chipBg: '#e9e9e3', chipFg: '#64645e', dot: '#64645e', stateFg: '#64645e' },
      GRID_TIE: { name: '併網運轉', desc: '依排程、需量控制與時間電價充放電，SOC 維持於 25–95 %。', kw: kw, kvar: 13.2, power: '放電中 · 58 kW', pcs: '運轉中 · 無故障碼', chipBg: '#e5ebdc', chipFg: '#426d4b', dot: '#426d4b', stateFg: '#426d4b' },
      ISLAND: { name: '孤島運轉', desc: '市電中斷時供應重要負載；SOC 低於 10 % 即停止放電。', kw: kw, kvar: 13.2, power: '孤島供電 · 58 kW', pcs: '孤島運轉 · 無故障碼', chipBg: '#f6ead1', chipFg: '#282825', dot: '#cca858', stateFg: '#282825' },
      FAULT: { name: '故障', desc: 'BMS／PCS 故障、過欠壓、過溫、絕緣異常或 SOC 低於孤島下限時進入，需人工復歸。', kw: 0, kvar: 0, power: '已停機 · 0 kW', pcs: '故障 · 請查看警報中心', chipBg: '#f9e9e5', chipFg: '#96493e', dot: '#a55445', stateFg: '#96493e' }
    };
    var m = MODES[code] || MODES.GRID_TIE;
    var node = function (key) {
      if (key !== code) { return { bg: '#f8f8f7', bd: '#b4b4ac', fg: '#282825' }; }
      if (key === 'FAULT') { return { bg: '#a55445', bd: '#a55445', fg: '#f8f8f7' }; }
      return { bg: '#282825', bd: '#282825', fg: '#f4f4f2' };
    };
    var nS = node('STANDBY'), nG = node('GRID_TIE'), nI = node('ISLAND'), nF = node('FAULT');
    var mode = {
      code: code, name: m.name, desc: m.desc, power: m.power, pcsState: m.pcs,
      kw: fmt(m.kw, 1), kwNum: m.kw, kvar: fmt(m.kvar, 1), pcsPct: r1(m.kw / 200 * 100) + '%',
      chipBg: m.chipBg, chipFg: m.chipFg, dot: m.dot, stateFg: m.stateFg,
      stBg: nS.bg, stBd: nS.bd, stFg: nS.fg, gtBg: nG.bg, gtBd: nG.bd, gtFg: nG.fg,
      isBg: nI.bg, isBd: nI.bd, isFg: nI.fg, ftBg: nF.bg, ftBd: nF.bd, ftFg: nF.fg
    };

    // SOC ring: arc from 12 o'clock clockwise, band ticks outside the ring.
    var C = 119, R = 88;
    var pt = function (r, pctv) { var a = pctv / 100 * Math.PI * 2; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
    var end = pt(R, soc);
    var ring = {
      soc: soc,
      arc: 'M' + C + ' ' + (C - R) + ' A' + R + ' ' + R + ' 0 ' + (soc > 50 ? 1 : 0) + ' 1 ' + r1(end[0]) + ' ' + r1(end[1]),
      ticks: [95, 30, 25, 10].map(function (b) { var a = pt(R + 9, b), z = pt(R + 17, b); return 'M' + r1(a[0]) + ' ' + r1(a[1]) + 'L' + r1(z[0]) + ' ' + r1(z[1]); }).join(' '),
      labels: [95, 30, 25, 10].map(function (b) { var p = pt(R + 28, b); return { label: String(b), left: r1(p[0]) + 'px', top: r1(p[1]) + 'px' }; }),
      energy: fmt(soc / 100 * cap, 1),
      hours: fmt((soc - 25) / 100 * cap / kw, 1)
    };

    // Schedule: hourly actual power (discharge +, charge -), plan outlines, SOC line with the SOC bands.
    var W = props.plotWidth || 1000, slot = W / 24, bw = Math.min(24, slot * 0.6), PH = 116, ZERO = 58, PMAX = 100, SH = 100;
    var yP = function (v) { return ZERO - v / PMAX * ZERO; };
    var bar = function (h, v) {
      var x = h * slot + (slot - bw) / 2, y = yP(v), rr = Math.min(4, bw / 2);
      if (v >= 0) { return 'M' + r1(x) + ' ' + ZERO + 'V' + r1(y + rr) + 'Q' + r1(x) + ' ' + r1(y) + ' ' + r1(x + rr) + ' ' + r1(y) + 'H' + r1(x + bw - rr) + 'Q' + r1(x + bw) + ' ' + r1(y) + ' ' + r1(x + bw) + ' ' + r1(y + rr) + 'V' + ZERO + 'Z'; }
      return 'M' + r1(x) + ' ' + ZERO + 'V' + r1(y - rr) + 'Q' + r1(x) + ' ' + r1(y) + ' ' + r1(x + rr) + ' ' + r1(y) + 'H' + r1(x + bw - rr) + 'Q' + r1(x + bw) + ' ' + r1(y) + ' ' + r1(x + bw) + ' ' + r1(y - rr) + 'V' + ZERO + 'Z';
    };
    var chargeKw = -25.7, nightKw = 41.8;
    var yS = function (v) { return SH - v / 100 * SH; };
    var xh = function (h) { return h / 24 * W; };
    var socPts = [[0, 25], [6, 95], [14, 92.8], [14 + 32 / 60, 78]];
    var planPts = [[14 + 32 / 60, 78], [15, 65], [18, 65], [20, 25], [24, 25]];
    var poly = function (pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(xh(p[0])) + ' ' + r1(yS(p[1])); }).join(' '); };
    var nowH = 14 + 32 / 60;
    var sched = {
      width: W, bandLeft: (68 + W) + 'px',
      charge: [0, 1, 2, 3, 4, 5].map(function (h) { return bar(h, chargeKw); }).join(' '),
      discharge: '',
      current: bar(14, 58),
      plan: [bar(18, nightKw), bar(19, nightKw)].join(' '),
      grid: 'M0 ' + r1(yP(100)) + 'H' + W + ' M0 ' + r1(yP(-100)) + 'H' + W,
      pTicks: [100, 0, -100].map(function (v) { return { label: String(v), top: r1(52 + yP(v)) + 'px' }; }),
      sTicks: [100, 50, 0].map(function (v) { return { label: String(v), top: r1(180 + yS(v)) + 'px' }; }),
      bands: [95, 30, 25, 10].map(function (b) { return 'M0 ' + r1(yS(b)) + 'H' + W; }).join(' '),
      bandLabels: [[95, '上限 95'], [30, '黑啟動 30'], [25, '備援 25'], [10, '孤島 10']].map(function (b, i) { return { label: b[1], top: r1(180 + yS(b[0]) + (i === 1 ? -6 : (i === 2 ? 6 : 0))) + 'px' }; }),
      socDone: poly(socPts), socPlan: poly(planPts),
      nowX: r1(xh(nowH)), nowSocY: r1(yS(soc)),
      nowLeft: r1(60 + xh(nowH)) + 'px', nowLabelTop: '156px',
      xTicks: (W < 450 ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24]).map(function (h) { return { label: pad2(h) + ':00', left: r1(60 + xh(h)) + 'px' }; })
    };

    // Cell range meters (thresholds from the protection table).
    var vPos = function (v) { return r1((v - 2.7) / (3.7 - 2.7) * 100) + '%'; };
    var tPos = function (t) { return r1(t / 70 * 100) + '%'; };
    var cell = {
      vLeft: vPos(3.38), vWidth: r1((3.42 - 3.38) / 1.0 * 100 + 1) + '%', vLow: vPos(2.8), vWarn: vPos(3.55),
      tLeft: tPos(27), tWidth: r1((31 - 27) / 70 * 100) + '%', t45: tPos(45), t55: tPos(55), t65: tPos(65)
    };

    return { showSketch: showSketch, mode: mode, ring: ring, sched: sched, cell: cell };
  }
}

return Component;
};
