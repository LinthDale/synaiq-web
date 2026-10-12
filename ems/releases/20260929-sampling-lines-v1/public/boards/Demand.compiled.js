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

    // Sample snapshot shared with 能源總覽 / 即時監控 (示意資料).
    var snap = { contract: 500, monthPeak: 428, now: 186 };
    // Today's 15-min grid-import demand, 00:00 .. 14:30 (last interval still running) - same series as 即時監控.
    var TODAY = [234,233,231,230,229,228,227,227,226,225,225,224,224,223,223,223,224,224,225,226,227,229,231,234,207,212,221,233,246,259,271,283,294,302,309,312,306,302,298,296,293,290,288,287,286,284,283,283,282,281,279,287,292,297,300,294,246,212,186];
    var PW = props.plotWidth || 694, PH = 250, YMAX = 600, SLOTS = 96, OX = 50, OY = 14;
    var slot = PW / SLOTS, bw = Math.min(5, slot * 0.7), rad = Math.min(2, bw / 2);
    var Y = function (v) { return PH - v / YMAX * PH; };
    var barPath = function (i, v) {
      var x = i * slot + (slot - bw) / 2, y = Y(v);
      return 'M' + r1(x) + ' ' + PH + 'V' + r1(y + rad) + 'Q' + r1(x) + ' ' + r1(y) + ' ' + r1(x + rad) + ' ' + r1(y) +
        'H' + r1(x + bw - rad) + 'Q' + r1(x + bw) + ' ' + r1(y) + ' ' + r1(x + bw) + ' ' + r1(y + rad) + 'V' + PH + 'Z';
    };
    var liveIdx = TODAY.length - 1;
    var done = TODAY.slice(0, liveIdx);
    var maxKw = Math.max.apply(null, done);
    var maxIdx = done.indexOf(maxKw);
    var slotLabel = function (i) { var m = i * 15; return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); };
    var touOf = function (i) { var h = i / 4; return h < 9 ? '離峰' : (h < 16 ? '半尖峰' : (h < 22 ? '尖峰' : '半尖峰')); };

    var hi = (st.hi === undefined || st.hi === null) ? null : st.hi;
    var bars = {
      width: PW,
      done: done.map(function (v, i) { return barPath(i, v); }).join(' '),
      live: barPath(liveIdx, TODAY[liveIdx]),
      hot: hi === null ? '' : barPath(hi, TODAY[hi]),
      grid: [200, 400, 600].map(function (v) { return 'M0 ' + r1(Y(v)) + 'H' + PW; }).join(' '),
      yTicks: [0, 200, 400, 600].map(function (v) { return { label: String(v), top: r1(OY + Y(v)) + 'px' }; }),
      xTicks: (PW < 450 ? [0, 24, 48, 72, 96] : [0, 12, 24, 36, 48, 60, 72, 84, 96]).map(function (i) { return { label: i === 96 ? '24:00' : slotLabel(i), left: r1(OX + i * slot) + 'px' }; }),
      contractPath: 'M0 ' + r1(Y(snap.contract)) + 'H' + PW,
      peakPath: 'M0 ' + r1(Y(snap.monthPeak)) + 'H' + PW,
      contractTop: r1(OY + Y(snap.contract) - 28) + 'px',
      peakTop: r1(OY + Y(snap.monthPeak) + 6) + 'px',
      maxKw: fmt(maxKw), maxTime: slotLabel(maxIdx),
      maxLeft: r1(OX + (maxIdx + 0.5) * slot) + 'px', maxTop: r1(OY + Y(maxKw) - 30) + 'px',
      liveLeft: r1(OX + (liveIdx + 0.5) * slot) + 'px', liveTop: r1(OY + Y(TODAY[liveIdx]) - 20) + 'px'
    };

    var barMove = function (e) {
      var box = e.currentTarget.getBoundingClientRect();
      var i = Math.floor((e.clientX - box.left) / box.width * SLOTS);
      var j = (i < 0 || i > liveIdx) ? null : i;
      if (!self.state || self.state.hi !== j) { self.setState({ hi: j }); }
    };
    var barLeave = function () { self.setState({ hi: null }); };
    var hover = { tipLeft: '0px', slot: '', kw: '', pct: '', tou: '' };
    if (hi !== null) {
      var cx = (hi + 0.5) * slot;
      hover = {
        tipLeft: r1(cx > PW - 200 ? OX + cx - 188 : OX + cx + 12) + 'px',
        slot: slotLabel(hi) + '–' + slotLabel(hi + 1) + (hi === liveIdx ? '（進行中）' : ''),
        kw: fmt(TODAY[hi]), pct: fmt(TODAY[hi] / snap.contract * 100, 1), tou: touOf(hi)
      };
    }

    // Time-of-use ribbons (sample windows, flagged [PLACEHOLDER] on screen until confirmed with Taipower).
    var TINT = { '離峰': '#f7f3eb', '半尖峰': '#f1e5cc', '尖峰': '#e5d0a6' };
    var ribbon = function (spans) {
      return spans.map(function (s) {
        return { label: s[2] + ' ' + pad2(s[0]) + '–' + pad2(s[1]), left: r1(s[0] / 24 * 100) + '%', width: r1((s[1] - s[0]) / 24 * 100) + '%', bg: TINT[s[2]] };
      });
    };
    var tou = {
      summerWeekday: ribbon([[0, 9, '離峰'], [9, 16, '半尖峰'], [16, 22, '尖峰'], [22, 24, '半尖峰']]),
      summerSat: ribbon([[0, 9, '離峰'], [9, 24, '半尖峰']]),
      winterWeekday: ribbon([[0, 6, '離峰'], [6, 11, '半尖峰'], [11, 14, '離峰'], [14, 24, '半尖峰']]),
      sunday: ribbon([[0, 24, '離峰']]),
      nowLeft: r1((14 + 32 / 60) / 24 * 100) + '%'
    };

    var pct = snap.monthPeak / snap.contract * 100;
    var k = {
      contract: fmt(snap.contract), peak: fmt(snap.monthPeak), now: fmt(snap.now),
      pct: fmt(pct, 1), pctNum: r1(pct), pctCss: r1(pct) + '%', headroom: fmt(snap.contract - snap.monthPeak)
    };
    // Bill estimate (估算): amounts only, never a rate.
    var basic = 118000, energy = 554000;
    var bill = { basic: fmt(basic), energy: fmt(energy), total: fmt(basic + energy), basicPct: r1(basic / (basic + energy) * 100) + '%' };

    return {
      showSketch: showSketch, k: k, bars: bars, tou: tou, bill: bill,
      hoverOn: hi !== null, hover: hover, barMove: barMove, barLeave: barLeave
    };
  }
}

return Component;
};
