window.__emsCompiledLogic=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  renderVals() {
    var props = this.props || {};
    var st = this.state || {};
    var self = this;
    var alarm = (props.alarmState == null ? 'normal' : props.alarmState) === 'alarm';
    var showSketch = props.showSketch == null ? true : props.showSketch;
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    var fmt = function (v, d) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };

    // One sample snapshot (示意資料) - every widget reads from it, so the numbers always agree.
    var snap = { contract: 500, monthPeak: 428, grid: 186, pv: 142, bess: 58, soc: 78, soh: 98, savings: 2360 };
    var load = snap.grid + snap.pv + snap.bess;

    // Flow drawing: stroke weight grows with live kW; BESS arrow direction follows the sign.
    var weight = function (kw) { return r1(1.25 + Math.abs(kw) * 0.015) + 'px'; };
    var discharging = snap.bess > 0;
    var flow = {
      gridW: weight(snap.grid),
      pvW: weight(snap.pv),
      bessW: weight(snap.bess),
      bessPath: discharging ? 'M516 196 H464' : 'M446 196 H500',
      bessHead: discharging ? 'M464 189 L452 196 L464 203 Z' : 'M500 189 L512 196 L500 203 Z'
    };

    // Demand meter.
    var pct = snap.monthPeak / snap.contract * 100;
    var demand = {
      contract: fmt(snap.contract), peak: fmt(snap.monthPeak), pct: fmt(pct, 1), pctNum: r1(pct),
      pctCss: r1(pct) + '%', fill: pct > 100 ? '#a55445' : (pct >= 90 ? '#a5762e' : '#647956')
    };

    // Today's load, 15-min points 00:00-14:30 (sample shape).
    var LOAD = [208,206,205,203,202,201,199,200,198,197,199,196,196,195,197,195,195,194,196,197,198,200,203,207,212,219,231,246,262,279,297,314,331,346,359,370,378,387,395,402,409,414,419,425,428,431,433,435,436,432,438,443,447,452,446,437,420,401,386];
    var PW = props.plotWidth || 508, PH = 140, YMAX = 800, SLOTS = 96, OX = 40, OY = 16, BOXW = PW + 60;
    var X = function (i) { return i / SLOTS * PW; };
    var Y = function (kw) { return PH - kw / YMAX * PH; };
    var smooth = function (pts) {
      var n = pts.length, dx = [], m = [], t = [], i;
      for (i = 0; i < n - 1; i++) { dx.push(pts[i + 1][0] - pts[i][0]); m.push((pts[i + 1][1] - pts[i][1]) / dx[i]); }
      t.push(m[0]);
      for (i = 1; i < n - 1; i++) { t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2); }
      t.push(m[n - 2]);
      for (i = 0; i < n - 1; i++) {
        if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
        var a = t[i] / m[i], b = t[i + 1] / m[i], h = a * a + b * b;
        if (h > 9) { var s = 3 / Math.sqrt(h); t[i] = s * a * m[i]; t[i + 1] = s * b * m[i]; }
      }
      var d = 'M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]);
      for (i = 0; i < n - 1; i++) {
        var k = dx[i] / 3;
        d += ' C' + r1(pts[i][0] + k) + ' ' + r1(pts[i][1] + t[i] * k) + ' ' + r1(pts[i + 1][0] - k) + ' ' + r1(pts[i + 1][1] - t[i + 1] * k) + ' ' + r1(pts[i + 1][0]) + ' ' + r1(pts[i + 1][1]);
      }
      return d;
    };
    var hhmm = function (i) { var mins = i * 15; return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'); };
    var pts = LOAD.map(function (v, i) { return [X(i), Y(v)]; });
    var linePath = smooth(pts);
    var last = LOAD.length - 1;
    var peak = Math.max.apply(null, LOAD);
    var peakIdx = LOAD.indexOf(peak);
    var px = X(peakIdx), py = Y(peak);
    var nowX = X(last + 2 / 15);
    var trend = {
      width: PW,
      yTicks: [0, 200, 400, 600, 800].map(function (v) { return { label: String(v), top: r1(OY + Y(v)) + 'px' }; }),
      xTicks: (PW < 420 ? [0, 24, 48, 72, 96] : [0, 16, 32, 48, 64, 80, 96]).map(function (i) { return { label: hhmm(i), left: r1(OX + X(i)) + 'px' }; }),
      gridPath: [200, 400, 600, 800].map(function (v) { return 'M0 ' + r1(Y(v)) + 'H' + PW; }).join(' '),
      linePath: linePath,
      areaPath: linePath + ' L' + r1(X(last)) + ' ' + PH + ' L0 ' + PH + ' Z',
      contractPath: 'M0 ' + r1(Y(snap.contract)) + 'H' + PW,
      nowPath: 'M' + r1(nowX) + ' 0V' + PH,
      nowLeft: r1(OX + nowX) + 'px',
      peakX: r1(px), peakY: r1(py), peakKw: fmt(peak), peakTime: hhmm(peakIdx),
      leaderPath: 'M' + r1(px - 3) + ' ' + r1(py - 4) + 'L' + r1(px - 14) + ' ' + r1(Y(snap.contract) - 8),
      peakLabelRight: r1(Math.max(0, Math.min(BOXW - 190, BOXW - (OX + px - 14)))) + 'px', peakLabelTop: r1(OY + Y(snap.contract) - 30) + 'px',
      contract: fmt(snap.contract),
      calloutLeft: r1(OX + PW - 118) + 'px', calloutTop: r1(OY + Y(snap.contract) - 30) + 'px'
    };

    // Hover crosshair (enhancement only; the peak and now labels carry the key values).
    var hi = (st.hi === undefined || st.hi === null) ? null : st.hi;
    var trendMove = function (e) {
      var box = e.currentTarget.getBoundingClientRect();
      var ratio = (e.clientX - box.left) / box.width;
      var i = Math.max(0, Math.min(last, Math.round(ratio * SLOTS)));
      if (!self.state || self.state.hi !== i) { self.setState({ hi: i }); }
    };
    var trendLeave = function () { self.setState({ hi: null }); };
    var hover = { left: '0px', dotTop: '0px', tipLeft: '0px', time: '', kw: '', pct: '' };
    if (hi !== null) {
      var hx = X(hi);
      hover = {
        left: r1(OX + hx) + 'px', dotTop: r1(OY + Y(LOAD[hi])) + 'px',
        tipLeft: r1(hx > PW - 150 ? OX + hx - 144 : OX + hx + 12) + 'px',
        time: hhmm(hi), kw: fmt(LOAD[hi]), pct: fmt(LOAD[hi] / snap.contract * 100, 1)
      };
    }

    // Energy mix donut: annular sectors with a 2 px surface gap.
    var arcBand = function (cx, cy, r0, rr, a0, a1, gap) {
      var dO = gap / 2 / rr, dI = gap / 2 / r0;
      var P = function (r, a) { return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
      var o0 = P(rr, a0 + dO), o1 = P(rr, a1 - dO), i1 = P(r0, a1 - dI), i0 = P(r0, a0 + dI);
      var big = (a1 - a0) > Math.PI ? 1 : 0;
      return 'M' + r1(o0[0]) + ' ' + r1(o0[1]) + ' A' + rr + ' ' + rr + ' 0 ' + big + ' 1 ' + r1(o1[0]) + ' ' + r1(o1[1]) +
        ' L' + r1(i1[0]) + ' ' + r1(i1[1]) + ' A' + r0 + ' ' + r0 + ' 0 ' + big + ' 0 ' + r1(i0[0]) + ' ' + r1(i0[1]) + ' Z';
    };
    var total = snap.pv + snap.grid + snap.bess;
    var TAU = Math.PI * 2;
    var aPv = snap.pv / total * TAU, aGrid = snap.grid / total * TAU;
    var mix = {
      pv: arcBand(75, 75, 48, 70, 0, aPv, 2),
      grid: arcBand(75, 75, 48, 70, aPv, aPv + aGrid, 2),
      bess: arcBand(75, 75, 48, 70, aPv + aGrid, TAU, 2),
      pvPct: fmt(snap.pv / total * 100, 1) + ' %',
      gridPct: fmt(snap.grid / total * 100, 1) + ' %',
      bessPct: fmt(snap.bess / total * 100, 1) + ' %'
    };

    var kpi = {
      load: fmt(load), grid: fmt(snap.grid), pv: fmt(snap.pv), bess: fmt(Math.abs(snap.bess)),
      soc: snap.soc, soh: snap.soh, savings: fmt(snap.savings),
      bessState: snap.bess > 0 ? '放電中' : (snap.bess < 0 ? '充電中' : '待機')
    };

    return {
      alarm: alarm, calm: !alarm, showSketch: showSketch,
      flow: flow, demand: demand, trend: trend, mix: mix, kpi: kpi,
      hoverOn: hi !== null, hover: hover, trendMove: trendMove, trendLeave: trendLeave
    };
  }
}

return Component;
};
