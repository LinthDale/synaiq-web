window.__emsCompiledLogic=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  renderVals() {
    var props = this.props || {};
    var st = this.state || {};
    var self = this;
    var showSketch = props.showSketch == null ? true : props.showSketch;
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    var fmt = function (v, d) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
    var pad2 = function (n) { return String(n).padStart(2, '0'); };
    var type = st.type || 'monthly';

    // Sample data (示意資料). Report KPIs are always the sums of the bars below them.
    var rows = [], labels = [], ticks = [], YMAX = 1, unitNote = '';
    var i;
    if (type === 'monthly') {
      for (i = 0; i < 31; i++) {
        var dow = new Date(2026, 7, i + 1).getDay();
        var weekend = dow === 0 || dow === 6;
        var load = weekend ? 4600 + 180 * Math.sin(i * 1.7) : 7400 + 260 * Math.sin(i * 0.9) + 140 * Math.sin(i * 2.3);
        var pv = (700 + 120 * Math.sin(i * 0.55 + 1)) * ((i === 9 || i === 10 || i === 20) ? 0.55 : 1);
        var bess = weekend ? 80 : 125 + 10 * Math.sin(i * 1.3);
        rows.push({ grid: Math.round(load - pv - bess), pv: Math.round(pv), bess: Math.round(bess) });
        labels.push('08/' + pad2(i + 1));
      }
      ticks = [0, 5, 10, 15, 20, 25, 30].map(function (x) { return { i: x, label: labels[x] }; });
      YMAX = 8000;
    } else {
      var HL = [205, 201, 198, 196, 196, 199, 222, 286, 352, 391, 413, 429, 434, 447, 425, 383, 389, 365, 342, 325, 305, 268, 239, 223];
      var HP = [0, 0, 0, 0, 0, 0, 4, 22, 58, 96, 128, 148, 156, 150, 132, 104, 68, 30, 6, 0, 0, 0, 0, 0];
      var HB = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 0, 0, 0, 41.8, 41.8, 0, 0, 0, 0];
      for (i = 0; i < 24; i++) {
        rows.push({ grid: r1(HL[i] - HP[i] - HB[i]), pv: HP[i], bess: HB[i] });
        labels.push(pad2(i) + ':00–' + pad2(i + 1) + ':00');
      }
      ticks = [0, 4, 8, 12, 16, 20].map(function (x) { return { i: x, label: pad2(x) + ':00' }; });
      YMAX = 500;
    }
    var sum = function (k) { return rows.reduce(function (a, r) { return a + r[k]; }, 0); };
    var tGrid = sum('grid'), tPv = sum('pv'), tBess = sum('bess'), tLoad = tGrid + tPv + tBess;
    var pct = function (v) { return fmt(v / tLoad * 100, 1) + ' %'; };
    // Bill estimate: purchased energy incl. BESS charging, internal assumption only - no rate is displayed.
    var charge = type === 'monthly' ? 154 * 31 : 154;
    var bill = type === 'monthly' ? Math.round(((tGrid + charge) * 4.6 + 118000) / 1000) * 1000 : Math.round(((tGrid + charge) * 4.6 + 118000 / 30) / 100) * 100;
    var rep = {
      title: type === 'monthly' ? '2026 年 8 月 月報' : '2026/09/22 日報',
      eyebrow: type === 'monthly' ? 'MONTHLY' : 'DAILY',
      period: type === 'monthly' ? '2026 年 8 月' : '2026/09/22',
      chartTitle: type === 'monthly' ? '每日用電來源（kWh）' : '每小時用電來源（kWh）',
      load: fmt(tLoad), grid: fmt(tGrid), pv: fmt(tPv), bess: fmt(tBess),
      gridPct: pct(tGrid), pvPct: pct(tPv), bessPct: pct(tBess),
      peak: type === 'monthly' ? '497' : '341', peakWhen: type === 'monthly' ? '08/14 16:45' : '17:00',
      bill: fmt(bill)
    };

    // Stacked bars: grid at the base, then PV, then BESS; 2 px surface gap between segments, 4 px rounded data-end.
    var W = props.plotWidth || 700, H = 180;
    var n = rows.length, slot = W / n, bw = Math.min(24, slot * 0.66);
    var seg = function (x, yb, yt, round) {
      var rr = round ? Math.min(4, (yb - yt) / 2) : 0;
      if (yb - yt < 0.6) { return ''; }
      if (!rr) { return 'M' + r1(x) + ' ' + r1(yb) + 'V' + r1(yt) + 'H' + r1(x + bw) + 'V' + r1(yb) + 'Z'; }
      return 'M' + r1(x) + ' ' + r1(yb) + 'V' + r1(yt + rr) + 'Q' + r1(x) + ' ' + r1(yt) + ' ' + r1(x + rr) + ' ' + r1(yt) + 'H' + r1(x + bw - rr) + 'Q' + r1(x + bw) + ' ' + r1(yt) + ' ' + r1(x + bw) + ' ' + r1(yt + rr) + 'V' + r1(yb) + 'Z';
    };
    var paths = { grid: [], pv: [], bess: [] };
    rows.forEach(function (r, j) {
      var x = j * slot + (slot - bw) / 2, y = H;
      var keys = ['grid', 'pv', 'bess'].filter(function (k) { return r[k] > 0; });
      keys.forEach(function (k, m) {
        var h = r[k] / YMAX * H;
        var yb = m > 0 ? y - 2 : y;
        var yt = y - h;
        paths[k].push(seg(x, yb, yt, m === keys.length - 1));
        y = yt;
      });
    });
    var hi = (st.hi === undefined || st.hi === null || st.hi >= n) ? null : st.hi;
    var stepY = YMAX / 4;
    var chart = {
      width: W,
      gridBars: paths.grid.join(' '), pvBars: paths.pv.join(' '), bessBars: paths.bess.join(' '),
      grid: [1, 2, 3, 4].map(function (k) { return 'M0 ' + r1(H - k * stepY / YMAX * H) + 'H' + W; }).join(' '),
      yTicks: [0, 1, 2, 3, 4].map(function (k) { return { label: fmt(k * stepY), top: r1(6 + H - k * stepY / YMAX * H) + 'px' }; }),
      xTicks: ticks.filter(function(t, i) { return W >= 450 || i % 2 === 0; }).map(function (t) { return { label: t.label, left: r1(52 + (t.i + 0.5) * slot) + 'px' }; }),
      hot: hi === null ? '' : 'M' + r1(hi * slot + 1) + ' 0H' + r1((hi + 1) * slot - 1) + 'V' + H + 'H' + r1(hi * slot + 1) + 'Z',
      aria: rep.chartTitle + '：市電 ' + rep.grid + '、太陽能 ' + rep.pv + '、儲能放電 ' + rep.bess + ' kWh'
    };
    var barMove = function (e) {
      var box = e.currentTarget.getBoundingClientRect();
      var j = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - box.left) / box.width * n)));
      if (!self.state || self.state.hi !== j) { self.setState({ hi: j }); }
    };
    var barLeave = function () { self.setState({ hi: null }); };
    var hover = { tipLeft: '0px', label: '', grid: '', pv: '', bess: '' };
    if (hi !== null) {
      var cx = (hi + 0.5) * slot;
      hover = {
        tipLeft: r1(cx > W - 190 ? 52 + cx - 182 : 52 + cx + 12) + 'px', label: labels[hi],
        grid: fmt(rows[hi].grid, type === 'monthly' ? 0 : 1), pv: fmt(rows[hi].pv), bess: fmt(rows[hi].bess, type === 'monthly' ? 0 : 1)
      };
    }
    var segOn = function (key) { var on = type === key; return { bg: on ? '#f8f8f7' : 'transparent', fg: on ? '#282825' : '#64645e', on: on }; };
    var sD = segOn('daily'), sM = segOn('monthly');
    var segCtl = {
      dBg: sD.bg, dFg: sD.fg, dOn: sD.on, mBg: sM.bg, mFg: sM.fg, mOn: sM.on,
      pickD: function () { self.setState({ type: 'daily', hi: null }); },
      pickM: function () { self.setState({ type: 'monthly', hi: null }); }
    };

    return { showSketch: showSketch, rep: rep, chart: chart, seg: segCtl, hoverOn: hi !== null, hover: hover, barMove: barMove, barLeave: barLeave };
  }
}

return Component;
};
