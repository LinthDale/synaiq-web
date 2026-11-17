window.__emsCompiledLogic=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  renderVals() {
    var props = this.props || {};
    var st = this.state || {};
    var self = this;
    var showSketch = props.showSketch == null ? true : props.showSketch;
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    var r2 = function (v) { return Math.round(v * 100) / 100; };
    var fmt = function (v, d) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
    var pad2 = function (n) { return String(n).padStart(2, '0'); };

    var range = st.range || '24h';
    var on = { v: st.mV == null ? true : st.mV, a: st.mA == null ? true : st.mA, hz: !!st.mHz, pf: !!st.mPF };

    // Sample series (示意資料) for the PCC grid-import meter. The last point always equals the live 186 kW.
    var BASE24 = [262,268,275,283,290,305,318,326,334,341,338,332,327,301,296,292,289,287,285,282,280,318,309,300,291,282,272,263,255,248,242,236,231,227,224,221,219,234,233,231,230,229,228,227,227,226,225,225,224,224,223,223,223,224,224,225,226,227,229,231,234,207,212,221,233,246,259,271,283,294,302,309,312,306,302,298,296,293,290,288,287,286,284,283,283,282,281,279,287,292,297,300,294,246,212,186];
    var HOURLY = [230,228,226,225,224,226,215,250,295,300,292,286,283,290,215,262,318,336,298,287,314,290,258,232];
    var DAYF = [1.00, 1.02, 0.97, 0.80, 0.74, 1.01, 1.03, 1.00];
    var wob = function (i) { return 2.4 * Math.sin(i * 1.9) + 1.2 * Math.sin(i * 0.61); };
    var kw = [], labels = [], ticks = [], divider = null, res = '', rangeText = '';
    var i, k;
    if (range === '1h') {
      for (i = 0; i < 60; i++) {
        var base = i < 27 ? 299 - i * 0.12 : 243 - (i - 27) * (57 / 32);
        kw.push(i === 59 ? 186 : r1(base + wob(i)));
        var mm = 33 + i;
        labels.push(pad2(13 + Math.floor(mm / 60)) + ':' + pad2(mm % 60));
      }
      ticks = [7, 17, 27, 37, 47, 57].map(function (x) { return { i: x, label: labels[x] }; });
      res = '1 分鐘平均'; rangeText = '近 1 小時';
    } else if (range === '7d') {
      for (k = 0; k < 168; k++) {
        var hour = (15 + k) % 24, day = Math.floor((15 + k) / 24);
        kw.push(r1(HOURLY[hour] * DAYF[day] + 3 * Math.sin(k * 1.3) + 2 * Math.sin(k * 0.37)));
        labels.push('09/' + pad2(16 + day) + ' ' + pad2(hour) + ':00');
      }
      ticks = [9, 33, 57, 81, 105, 129, 153].map(function (x, n) { return { i: x, label: '09/' + pad2(17 + n) }; });
      res = '1 小時平均'; rangeText = '近 7 天';
    } else {
      for (i = 0; i < 96; i++) {
        kw.push(BASE24[i]);
        var mins = (14 * 60 + 45 + i * 15) % 1440;
        labels.push((i < 37 ? '09/22 ' : '09/23 ') + pad2(Math.floor(mins / 60)) + ':' + pad2(mins % 60));
      }
      ticks = [1, 13, 25, 37, 49, 61, 73, 85].map(function (x) { return { i: x, label: labels[x].slice(6) }; });
      divider = 37;
      res = '15 分鐘平均'; rangeText = '近 24 小時';
    }

    var n = kw.length, last = n - 1;
    var volt = kw.map(function (g) { return r1(384.5 - 0.022 * g); });
    var pf = kw.map(function (g, j) { return r2(0.92 + 0.015 * Math.sin((j - last) * 0.33)); });
    var amp = kw.map(function (g, j) { return Math.round(g * 1000 / (Math.sqrt(3) * volt[j] * pf[j])); });
    var hz = kw.map(function (g, j) { return r2(60 + 0.012 * Math.sin((j - last) * 0.7)); });

    // Geometry: one shared x scale, one y scale per panel (never a dual axis).
    var PW = 694, OX = 52, OY = 18, STACK_BOTTOM = 378, PMAX = 400;
    var X = function (j) { return j / last * PW; };
    var nSec = [on.v, on.a, on.hz, on.pf].filter(Boolean).length;
    var powerH = nSec === 0 ? 350 : 150;
    var line = function (vals, lo, hi, h) {
      return vals.map(function (v, j) { return (j ? 'L' : 'M') + r1(X(j)) + ' ' + r1(h - (v - lo) / (hi - lo) * h); }).join(' ');
    };
    var pLine = line(kw, 0, PMAX, powerH);
    var power = {
      h: powerH, viewBox: '0 0 694 ' + powerH,
      line: pLine, area: pLine + ' L' + PW + ' ' + powerH + ' L0 ' + powerH + ' Z',
      grid: [100, 200, 300, 400].map(function (v) { return 'M0 ' + r1(powerH - v / PMAX * powerH) + 'H' + PW; }).join(' '),
      base: 'M0 ' + powerH + 'H' + PW,
      ticks: [0, 100, 200, 300, 400].map(function (v) { return { label: String(v), top: r1(OY + powerH - v / PMAX * powerH) + 'px' }; }),
      lastY: r1(powerH - kw[last] / PMAX * powerH),
      lastLabel: fmt(kw[last], 1) + ' kW',
      lastLabelTop: r1(OY + powerH - kw[last] / PMAX * powerH) + 'px'
    };

    var secTop = OY + powerH + 14;
    var region = STACK_BOTTOM - secTop;
    var panelH = nSec ? (region - 10 * (nSec - 1)) / nSec : 0;
    var defs = [
      { key: 'v', on: on.v, label: '電壓 V', lo: 375, hi: 383, vals: volt, ref: 380, d: 1 },
      { key: 'a', on: on.a, label: '電流 A', lo: 250, hi: 600, vals: amp, ref: null, d: 0 },
      { key: 'hz', on: on.hz, label: '頻率 Hz', lo: 59.98, hi: 60.02, vals: hz, ref: 60, d: 2 },
      { key: 'pf', on: on.pf, label: '功率因數', lo: 0.88, hi: 0.96, vals: pf, ref: null, d: 2 }
    ];
    var panels = [];
    var top = secTop;
    defs.forEach(function (d) {
      if (!d.on) { return; }
      var ph = Math.max(12, panelH - 16);
      panels.push({
        key: d.key, label: d.label, lastLabel: fmt(d.vals[last], d.d),
        top: r1(top) + 'px', height: r1(panelH) + 'px', plotH: r1(ph), viewBox: '0 0 694 ' + r1(ph),
        line: line(d.vals, d.lo, d.hi, ph),
        frame: 'M0 0H' + PW + ' M0 ' + r1(ph) + 'H' + PW,
        ref: d.ref == null ? '' : 'M0 ' + r1(ph - (d.ref - d.lo) / (d.hi - d.lo) * ph) + 'H' + PW,
        tMax: fmt(d.hi, d.d), tMin: fmt(d.lo, d.d), minTop: r1(16 + ph) + 'px'
      });
      top += panelH + 10;
    });

    var xTicks = ticks.map(function (t) { return { label: t.label, left: r1(OX + X(t.i)) + 'px' }; });

    // Shared crosshair across every panel.
    var hi = (st.hi === undefined || st.hi === null || st.hi > last) ? null : st.hi;
    var histMove = function (e) {
      var box = e.currentTarget.getBoundingClientRect();
      var j = Math.max(0, Math.min(last, Math.round((e.clientX - box.left) / box.width * last)));
      if (!self.state || self.state.hi !== j) { self.setState({ hi: j }); }
    };
    var histLeave = function () { self.setState({ hi: null }); };
    var hover = { left: '0px', tipLeft: '0px', time: '', rows: [] };
    if (hi !== null) {
      var hx = X(hi);
      var rows = [{ label: '有效功率', value: fmt(kw[hi], 1) + ' kW' }];
      if (on.v) { rows.push({ label: '電壓', value: fmt(volt[hi], 1) + ' V' }); }
      if (on.a) { rows.push({ label: '電流', value: fmt(amp[hi]) + ' A' }); }
      if (on.hz) { rows.push({ label: '頻率', value: fmt(hz[hi], 2) + ' Hz' }); }
      if (on.pf) { rows.push({ label: '功率因數', value: fmt(pf[hi], 2) }); }
      hover = { left: r1(OX + hx) + 'px', tipLeft: r1(hx > PW - 190 ? OX + hx - 180 : OX + hx + 12) + 'px', time: labels[hi], rows: rows };
    }

    var seg = function (key) {
      var sel = range === key;
      return { bg: sel ? '#f8f8f7' : 'transparent', fg: sel ? '#282825' : '#64645e', sh: sel ? '0 1px 2px #28282519' : 'none', on: sel };
    };
    var s1 = seg('1h'), s24 = seg('24h'), s7 = seg('7d');
    var rng = {
      bg1h: s1.bg, fg1h: s1.fg, sh1h: s1.sh, on1h: s1.on,
      bg24h: s24.bg, fg24h: s24.fg, sh24h: s24.sh, on24h: s24.on,
      bg7d: s7.bg, fg7d: s7.fg, sh7d: s7.sh, on7d: s7.on,
      pick1h: function () { self.setState({ range: '1h', hi: null }); },
      pick24h: function () { self.setState({ range: '24h', hi: null }); },
      pick7d: function () { self.setState({ range: '7d', hi: null }); }
    };
    var met = {
      v: on.v, a: on.a, hz: on.hz, pf: on.pf,
      toggleV: function () { self.setState({ mV: !on.v }); },
      toggleA: function () { self.setState({ mA: !on.a }); },
      toggleHz: function () { self.setState({ mHz: !on.hz }); },
      togglePf: function () { self.setState({ mPF: !on.pf }); }
    };

    // Live panel reads the same snapshot as 能源總覽 (PCC grid import 186 kW).
    var live = { kw: fmt(186, 1), kvar: fmt(79.2, 1), v: fmt(380.4, 1), a: fmt(307), hz: fmt(60, 2), pf: fmt(0.92, 2), kwh: fmt(1284562) };

    return {
      showSketch: showSketch, res: res, rangeText: rangeText, rng: rng, met: met, noop: function () {},
      power: power, panels: panels, xTicks: xTicks,
      dividerOn: divider !== null, dividerLeft: divider === null ? '0px' : r1(OX + X(divider)) + 'px',
      hoverOn: hi !== null, hover: hover, histMove: histMove, histLeave: histLeave, live: live
    };
  }
}

return Component;
};
