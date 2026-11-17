window.__emsCompiledLogic=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  renderVals() {
    var props = this.props || {};
    var st = this.state || {};
    var self = this;
    var showSketch = props.showSketch == null ? true : props.showSketch;

    // Device registry sample (示意資料) - first page of 24.
    var LC = {
      active: { bg: '#e5ebdc', fg: '#426d4b' },
      maintenance: { bg: '#f6ecd7', fg: '#8a5f21' },
      confirmed: { bg: '#e9e9e3', fg: '#282825' }
    };
    var CM = {
      GOOD: { fg: '#426d4b', dot: '#426d4b' },
      STALE: { fg: '#8a5f21', dot: '#a5762e' },
      '離線': { fg: '#96493e', dot: '#a55445' }
    };
    var ALL = [
      { name: '台電受電點電表', id: 'M-01', type: 'grid_meter', proto: 'Modbus TCP', loc: '配電室 B1', lc: 'active', comm: 'GOOD', seen: '3 秒前', avail: 99.98 },
      { name: '儲能電池管理', id: 'BMS-01', type: 'battery', proto: 'Modbus TCP', loc: '儲能櫃', lc: 'active', comm: 'GOOD', seen: '1 秒前', avail: 99.95 },
      { name: '儲能變流器', id: 'PCS-01', type: 'battery', proto: 'Modbus TCP', loc: '儲能櫃', lc: 'active', comm: 'GOOD', seen: '1 秒前', avail: 99.93 },
      { name: '太陽能逆變器', id: 'INV-01', type: 'solar_inverter', proto: 'Modbus TCP', loc: '屋頂 A 區', lc: 'active', comm: 'GOOD', seen: '5 秒前', avail: 99.61 },
      { name: '太陽能逆變器', id: 'INV-03', type: 'solar_inverter', proto: 'Modbus TCP', loc: '屋頂 B 區', lc: 'active', comm: 'GOOD', seen: '5 秒前', avail: 98.87 },
      { name: '空調控制器', id: 'HVAC-01', type: 'hvac', proto: 'Modbus RTU', loc: '機房 3F', lc: 'active', comm: 'STALE', seen: '2 分 17 秒前', avail: 97.4 },
      { name: '溫濕度感測器', id: 'ENV-02', type: 'temperature', proto: 'MQTT', loc: '儲能櫃', lc: 'active', comm: 'GOOD', seen: '12 秒前', avail: 99.2 },
      { name: '消防盤', id: 'FP-01', type: 'unknown', proto: '乾接點', loc: '防災中心', lc: 'maintenance', comm: '離線', seen: '3 小時前', avail: 91.3 }
    ];
    var f = st.filter || 'all';
    var rows = ALL.filter(function (d) {
      if (f === 'comm') { return d.comm !== 'GOOD'; }
      if (f === 'maint') { return d.lc === 'maintenance'; }
      return true;
    });
    var devices = rows.map(function (d) {
      var lc = LC[d.lc], cm = CM[d.comm];
      return {
        name: d.name, id: d.id, type: d.type, proto: d.proto, loc: d.loc, lc: d.lc, lcBg: lc.bg, lcFg: lc.fg,
        comm: d.comm, cmFg: cm.fg, cmDot: cm.dot, seen: d.seen,
        avail: d.avail.toFixed(2), availW: Math.max(4, Math.round((d.avail - 90) / 10 * 64)) + 'px',
        availC: d.avail >= 99 ? '#647956' : (d.avail >= 95 ? '#a5762e' : '#a55445')
      };
    });
    var chip = function (key) {
      var on = f === key;
      return { bg: on ? '#282825' : 'transparent', fg: on ? '#f4f4f2' : '#282825', bd: on ? '#282825' : '#b4b4ac', on: on };
    };
    var cA = chip('all'), cC = chip('comm'), cM = chip('maint');
    var flt = {
      allBg: cA.bg, allFg: cA.fg, allBd: cA.bd, allOn: cA.on,
      commBg: cC.bg, commFg: cC.fg, commBd: cC.bd, commOn: cC.on,
      maintBg: cM.bg, maintFg: cM.fg, maintBd: cM.bd, maintOn: cM.on,
      pickAll: function () { self.setState({ filter: 'all' }); },
      pickComm: function () { self.setState({ filter: 'comm' }); },
      pickMaint: function () { self.setState({ filter: 'maint' }); }
    };

    // AI confirmation queue (candidate -> confirmed), confidence bands 0.60 / 0.85 are sample thresholds.
    var decided = st.decided || {};
    var Q = [
      { id: 'q1', type: 'solar_inverter', typeZh: '太陽能逆變器', sig: 'Modbus TCP 10.0.3.27:502 · 18 個暫存器', conf: 0.91, signals: ['P_ac kW', 'E_total kWh', 'V_dc V'] },
      { id: 'q2', type: 'electricity', typeZh: '分路電表', sig: 'MQTT site/nangang/meter/sub-07', conf: 0.74, signals: ['kW', 'V', 'A', 'PF'] },
      { id: 'q3', type: 'hvac', typeZh: '空調設備', sig: 'Modbus TCP 10.0.3.41:502 · 9 個暫存器', conf: 0.58, signals: ['溫度 °C', '設定值 °C', '運轉 bool'] }
    ];
    var queue = Q.map(function (c) {
      var d = decided[c.id];
      var band = c.conf >= 0.85 ? '高' : (c.conf >= 0.6 ? '中' : '低，需人工判斷');
      return {
        type: c.type, typeZh: c.typeZh, sig: c.sig, conf: c.conf.toFixed(2), confNum: c.conf, band: band,
        confW: Math.round(c.conf * 100) + '%', confC: c.conf >= 0.85 ? '#647956' : (c.conf >= 0.6 ? '#cca858' : '#a5762e'),
        signalText: c.signals.join(' · '),
        open: !d, done: !!d,
        result: d === 'confirmed' ? '已確認 · confirmed' : '已退回',
        resBg: d === 'confirmed' ? '#e5ebdc' : '#e9e9e3', resFg: d === 'confirmed' ? '#426d4b' : '#64645e',
        confirm: function () { var n = Object.assign({}, decided); n[c.id] = 'confirmed'; self.setState({ decided: n }); },
        reject: function () { var n = Object.assign({}, decided); n[c.id] = 'rejected'; self.setState({ decided: n }); }
      };
    });
    var queueLeft = Q.filter(function (c) { return !decided[c.id]; }).length;

    return { showSketch: showSketch, devices: devices, shown: devices.length, flt: flt, queue: queue, queueLeft: queueLeft };
  }
}

return Component;
};
