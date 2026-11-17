window.__emsCompiledLogic=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  renderVals() {
    var props = this.props || {};
    var st = this.state || {};
    var self = this;
    var showSketch = props.showSketch == null ? true : props.showSketch;

    var ICON = {
      P0: 'M7.8 3.4l8.1-.2 4.6 4.7.2 8.2-4.7 4.5-8.1.2-4.6-4.7-.2-8.2z M12 7.6l.1 5.7 M12.1 16.6v.2',
      P1: 'M11.2 4.1Q12 2.7 12.9 4.2L21 18.3Q21.7 19.6 20.1 19.7L3.8 19.9Q2.2 19.9 3 18.4L11.2 4.1 M12 8.8l.1 5.5 M12.2 17v.2',
      P2: 'M20.5 11.7Q20.8 20.2 12.2 20.6Q3.6 20.5 3.4 12Q3.1 3.6 11.8 3.4Q20.3 3.1 20.5 11.7 M12 7.7l.1 5.5 M12.1 16.5v.2',
      INFO: 'M20.5 11.7Q20.8 20.2 12.2 20.6Q3.6 20.5 3.4 12Q3.1 3.6 11.8 3.4Q20.3 3.1 20.5 11.7 M12 10.6l.1 5.6 M12 7.2v.2'
    };
    var LEVEL = {
      P0: { label: 'P0 緊急', bg: '#f9e9e5', fg: '#96493e', icon: '#a55445' },
      P1: { label: 'P1 重要', bg: '#f6ecd7', fg: '#8a5f21', icon: '#a5762e' },
      P2: { label: 'P2 一般', bg: '#f6ead1', fg: '#282825', icon: '#282825' },
      INFO: { label: '資訊', bg: '#e9e9e3', fg: '#64645e', icon: '#64645e' }
    };
    // Sample alarm set (示意資料); rules follow the implemented and planned alarm vocabulary.
    var BASE = [
      { id: 'a1', level: 'P1', title: '空調控制器 HVAC-01 資料中斷逾 2 分鐘', source: 'HVAC-01 · 空調控制器', rule: '資料停止更新 ≥ 2 分鐘（STALE）', pending: '14:27:48', first: '14:29:48', dur: '2 分 17 秒', state: 'ACTIVE',
        runbook: ['確認 HVAC-01 與閘道 GW-01 的網路連線', '於設備分析檢視最後上線時間與資料品質', '15 分鐘內未恢復，派員檢查控制器電源'] },
      { id: 'a2', level: 'P2', title: 'AI 分類防護攔截 6 次／小時', source: 'ENV-02 · 溫濕度感測器', rule: '同一裝置每小時攔截 ≥ 5 次', pending: '13:58:02', first: '13:58:02', dur: '34 分', state: 'ACTIVE',
        runbook: ['於設備分析檢視 ENV-02 的訊號與 AI 建議', '必要時凍結該裝置的 AI 自動分類'] },
      { id: 'a3', level: 'P2', title: 'LLM 預算用量 82 %', source: 'AI 分類管線', rule: '月預算用量 ≥ 80 %', pending: '13:05:41', first: '13:05:41', dur: '1 小時 27 分', state: 'ACKED', ackNote: '維運 13:12 確認',
        runbook: ['檢視本月 AI 分類呼叫量', '評估是否調降批次頻率'] },
      { id: 'a4', level: 'INFO', title: '儲能排程：14:00 開始半尖峰放電 58 kW', source: 'BESS-01 · 排程', rule: '排程事件', pending: '14:00:02', first: '14:00:02', dur: '32 分', state: 'ACTIVE', runbook: [] },
      { id: 'a5', level: 'P2', title: 'PCC 功率因數低於 0.9（5 分鐘平均）', source: 'M-01 · 台電受電點', rule: 'PF < 0.9 持續 5 分鐘', pending: '11:35:10', first: '11:40:10', dur: '2 小時 52 分', state: 'SHELVED', shelveNote: '擱置至 16:00 · 維運',
        runbook: ['比對空調分路與動力分路的無效功率', '確認 PCS 無效功率支援是否啟用'] }
    ];
    var acked = st.acked || {};
    var shelved = st.shelved || {};
    var unshelved = st.unshelved || {};
    var list = BASE.map(function (a) {
      var s = a.state, note = a.ackNote || a.shelveNote || '';
      if (a.state === 'SHELVED' && unshelved[a.id]) { s = 'ACTIVE'; note = ''; }
      if (shelved[a.id]) { s = 'SHELVED'; note = '擱置至 16:00 · 維運'; }
      else if (acked[a.id] && s === 'ACTIVE') { s = 'ACKED'; note = '維運 14:32 確認'; }
      return Object.assign({}, a, { cur: s, note: note });
    });
    var tab = st.tab || 'active';
    var selId = st.sel || 'a1';
    var STATE = {
      ACTIVE: { bg: '#f8f8f7', bd: '#282825', fg: '#282825', label: 'ACTIVE 進行中' },
      ACKED: { bg: '#e5ebdc', bd: '#e5ebdc', fg: '#426d4b', label: 'ACKED 已確認' },
      SHELVED: { bg: '#e9e9e3', bd: '#e9e9e3', fg: '#64645e', label: 'SHELVED 已擱置' }
    };
    var visible = list.filter(function (a) {
      if (tab === 'active') { return a.cur !== 'SHELVED'; }
      if (tab === 'shelved') { return a.cur === 'SHELVED'; }
      return true;
    });
    var rows = visible.map(function (a) {
      var lv = LEVEL[a.level], sx = STATE[a.cur];
      var isSel = a.id === selId;
      return {
        id: a.id, title: a.title, source: a.source, first: a.first, dur: a.dur,
        lvLabel: lv.label, lvBg: lv.bg, lvFg: lv.fg, lvIcon: ICON[a.level], lvIconColor: lv.icon,
        state: sx.label, stBg: sx.bg, stBd: sx.bd, stFg: sx.fg, stateNote: a.note,
        rowBg: isSel ? '#f2f0e8' : 'transparent', rowBar: isSel ? 'inset 2px 0 0 #cca858' : 'none',
        canAck: a.cur === 'ACTIVE' && a.level !== 'INFO',
        canShelve: a.cur !== 'SHELVED' && a.level !== 'INFO',
        canResume: a.cur === 'SHELVED',
        pick: function () { self.setState({ sel: a.id }); },
        ack: function () { var n = Object.assign({}, acked); n[a.id] = true; self.setState({ acked: n, sel: a.id }); },
        shelve: function () { var n = Object.assign({}, shelved); n[a.id] = true; var u = Object.assign({}, unshelved); delete u[a.id]; self.setState({ shelved: n, unshelved: u }); },
        resume: function () { var n = Object.assign({}, shelved); delete n[a.id]; var u = Object.assign({}, unshelved); u[a.id] = true; self.setState({ shelved: n, unshelved: u }); }
      };
    });

    var countIf = function (fn) { return list.filter(fn).length; };
    var counts = {
      p0: countIf(function (a) { return a.level === 'P0' && a.cur !== 'SHELVED'; }),
      p1: countIf(function (a) { return a.level === 'P1' && a.cur !== 'SHELVED'; }),
      p2: countIf(function (a) { return a.level === 'P2' && a.cur !== 'SHELVED'; }),
      info: countIf(function (a) { return a.level === 'INFO'; }),
      shelved: countIf(function (a) { return a.cur === 'SHELVED'; })
    };
    var seg = function (key) { var on = tab === key; return { bg: on ? '#f8f8f7' : 'transparent', fg: on ? '#282825' : '#64645e', on: on }; };
    var tA = seg('active'), tS = seg('shelved'), tL = seg('all');
    var tabs = {
      aBg: tA.bg, aFg: tA.fg, aOn: tA.on, aCount: countIf(function (a) { return a.cur !== 'SHELVED'; }),
      sBg: tS.bg, sFg: tS.fg, sOn: tS.on, sCount: counts.shelved,
      lBg: tL.bg, lFg: tL.fg, lOn: tL.on, lCount: list.length,
      pickA: function () { self.setState({ tab: 'active' }); },
      pickS: function () { self.setState({ tab: 'shelved' }); },
      pickL: function () { self.setState({ tab: 'all' }); }
    };

    var s = list.filter(function (a) { return a.id === selId; })[0] || list[0];
    var lvS = LEVEL[s.level];
    var order = ['NORMAL', 'PENDING', 'ACTIVE', 'ACKED', 'CLEARED'];
    var reached = s.cur === 'ACKED' ? 3 : 2;
    var times = { NORMAL: '—', PENDING: s.pending, ACTIVE: s.first, ACKED: s.cur === 'ACKED' ? (s.note.split(' ')[1] || '—') : '—', CLEARED: '—' };
    var sel = {
      title: s.title, source: s.source, rule: s.rule, first: s.first, dur: s.dur,
      lvLabel: lvS.label, lvBg: lvS.bg, lvFg: lvS.fg, lvIcon: ICON[s.level], lvIconColor: lvS.icon,
      steps: order.map(function (code, i) {
        return { code: code, time: times[code], bar: i <= reached ? (i === reached ? '#cca858' : '#647956') : '#e9e9e3', fg: i <= reached ? '#282825' : '#64645e' };
      }),
      runbook: s.runbook.map(function (t, i) { return { n: String(i + 1), text: t }; }),
      noRunbook: s.runbook.length === 0
    };

    return { showSketch: showSketch, counts: counts, tabs: tabs, rows: rows, empty: rows.length === 0, sel: sel };
  }
}

return Component;
};
