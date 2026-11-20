(() => {
'use strict';
const D = window.IY_DATA;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEYS = ['L', 'S', 'R', 'W'], SUBJ = { L: '听力', S: '口语', R: '阅读', W: '写作' };
const PC_ADDR = 'ielts.unipus.cn';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = $('#phone');

/* 14 周四阶段（原型 W.STAGES） */
const STAGES = [
  { n: '基础筑基', f: 1, t: 4, d: '摸清考试规则与评分标准，打牢基础' },
  { n: '题型突破', f: 5, t: 8, d: '逐个题型拆解方法，练成套路' },
  { n: '实战强化', f: 9, t: 12, d: '高难题型与整篇实战，限时复盘' },
  { n: '冲刺备战', f: 13, t: 14, d: '无视频，按薄弱技能自适应冲刺' }
];
/* 五阶里程碑（原型 M02） */
const MILES = [
  { d: 3, n: '3 天护航礼', rw: ['补签卡 × 1'] },
  { d: 7, n: '7 天破冰礼', rw: ['自研单科模考 5 折券 × 1', 'AI 写作 / 口语精批 × 2'] },
  { d: 14, n: '14 天进阶礼', rw: ['补签卡 × 1', '增购单科立减 15 元券'] },
  { d: 21, n: '21 天冲刺礼', rw: ['补签卡 × 1', '自研单科模考立减 30 元券'] },
  { d: 30, n: '30 天王炸大奖', rw: ['免费解锁自研单科模考 × 1'] }
];
const CONDS = [
  { k: 'a', n: '看一讲新课', s: '视频 ≥ 80%', ic: 'video', full: '任一讲新课视频观看 ≥ 80%' },
  { k: 'b', n: '有效练习', s: '专项 / 诊断 / 模考', ic: 'target', full: '有效提交自适应专项、完成诊断或模考（满足最短有效作答，非白卷）' },
  { k: 'c', n: '背词 + 游乐场', s: '≥ 20 词 + 1 局', ic: 'words', full: '背词 ≥ 20 个并完成 1 局轻游乐场，累计 ≥ 10 分钟' }
];

/* 示例账号状态（原型 M02 / M10 示例数据） */
const DEF = () => ({
  name: '王美凤', phone: '138****0000', target: '6.5', examDate: '', examUnknown: false, took: false, grade: '大二', scores: { L: '', S: '', R: '', W: '' },
  streak: 9, lit: true, cond: { a: true, b: false, c: false }, cards: 1, shield: true, claimed: { 3: 1, 7: 1 },
  prog: { L: 4, S: 3, R: 3, W: 2 }, cur: 'R', remind: true, mapOpen: {}, courseOpen: {}, filter: 'all', mileSel: null, lpos: {},
  coupons: [{ stub: '5折', small: '单科模考', name: '自研单科模考 5 折券', desc: '自研单科模考下单时抵扣', from: '7 天破冰礼' }]
});
let S = DEF();

/* ---------- 图标 ---------- */
const ic = (p, s = 24, sw = 1.8, cls = '') => `<svg class="${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[p]}</svg>`;
const P = {
  chevR: '<path d="M9 6l6 6-6 6"/>', chevL: '<path d="M15 6l-6 6 6 6"/>', chevD: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>', pause: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>',
  pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9v11M12 9C10 5 6 5 6 7.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M14 8v8" stroke-dasharray="2 2"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  report: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 16v-3M12 16V9M16 16v-5"/>',
  cart: '<path d="M3 4h2l2.2 11h10.6L20 7H6.2"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
  exam: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  order: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  words: '<path d="M4 5h9a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M7 9h5M7 12h4"/><path d="M19 5v10"/>',
  award: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2.5 5 2.5-1.5-8"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none"/>',
  flame: '<path d="M12 3c1.5 3.5 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.8 1.4-4.5 2.8-5.9.3 1.7 1 2.8 2 3.1C11 8 11.3 5.6 12 3z" fill="currentColor" stroke="none"/>'
};

/* 贴纸风图标（沿用上一版：#1A2233 描边 + 品牌色块） */
const SH = '<ellipse cx="32" cy="58" rx="20" ry="3" fill="#3264FA" opacity=".12"/>';
const ST = {
  L: `<svg viewBox="0 0 64 64">${SH}<path d="M13 36C13 15 51 15 51 36" fill="none" stroke="#1A2233" stroke-width="7" stroke-linecap="round"/><path d="M13 36C13 15 51 15 51 36" fill="none" stroke="#ADCAFF" stroke-width="3" stroke-linecap="round"/><rect x="6" y="31" width="16" height="23" rx="7" fill="#3264FA" stroke="#1A2233" stroke-width="2.5"/><rect x="42" y="31" width="16" height="23" rx="7" fill="#3264FA" stroke="#1A2233" stroke-width="2.5"/><rect x="9.5" y="35" width="4" height="8" rx="2" fill="#fff" opacity=".7"/><rect x="45.5" y="35" width="4" height="8" rx="2" fill="#fff" opacity=".7"/><path d="M27 40v6M32 36v14M37 40v6" stroke="#FABE0A" stroke-width="3" stroke-linecap="round"/></svg>`,
  S: `<svg viewBox="0 0 64 64">${SH}<path d="M8 22a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v8a12 12 0 0 1-12 12H28l-10 9v-9.4A12 12 0 0 1 8 30z" fill="#4AA8FF" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 20a7 7 0 0 1 6-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/><circle cx="22" cy="26" r="3" fill="#fff"/><circle cx="32" cy="26" r="3" fill="#fff"/><circle cx="42" cy="26" r="3" fill="#fff"/><path d="M52 44l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FABE0A" stroke="#1A2233" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  R: `<svg viewBox="0 0 64 64">${SH}<path d="M5 18l27 6 27-6v30l-27 6-27-6z" fill="#3264FA" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 14c9-2 17 0 24 6v30c-7-6-15-8-24-6z" fill="#fff" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/><path d="M56 14c-9-2-17 0-24 6v30c7-6 15-8 24-6z" fill="#F0F6FF" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/><path d="M13 24c5-1 9 0 13 3M13 31c5-1 9 0 13 3M38 27c4-3 8-4 13-3" stroke="#ADCAFF" stroke-width="2.4" stroke-linecap="round"/><path d="M44 32v16l3-3 3 3V31" fill="#FF8000" stroke="#1A2233" stroke-width="2" stroke-linejoin="round"/></svg>`,
  W: `<svg viewBox="0 0 64 64">${SH}<rect x="10" y="10" width="34" height="42" rx="7" fill="#fff" stroke="#1A2233" stroke-width="2.5" transform="rotate(-6 27 31)"/><path d="M17 22h18M18 30h16M19 38h10" stroke="#ADCAFF" stroke-width="2.6" stroke-linecap="round" transform="rotate(-6 27 31)"/><g transform="rotate(38 44 34)"><rect x="39" y="10" width="11" height="34" rx="3" fill="#FABE0A" stroke="#1A2233" stroke-width="2.5"/><rect x="39" y="10" width="11" height="7" rx="3" fill="#3264FA" stroke="#1A2233" stroke-width="2.5"/><path d="M39 44l5.5 9 5.5-9z" fill="#FFE28C" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/><path d="M43 49.5l1.5 3.5 1.5-3.5z" fill="#1A2233"/></g></svg>`,
  game: `<svg viewBox="0 0 64 64"><path d="M16 20h32a10 10 0 0 1 10 9.5l1 11a7 7 0 0 1-12 5l-5-5H22l-5 5a7 7 0 0 1-12-5l1-11A10 10 0 0 1 16 20z" fill="#4AA8FF" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 28v8M15 32h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="29" r="3" fill="#FABE0A" stroke="#1A2233" stroke-width="1.6"/><circle cx="49" cy="35" r="3" fill="#FF8000" stroke="#1A2233" stroke-width="1.6"/><path d="M28 12l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFE28C" stroke="#1A2233" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  words: `<svg viewBox="0 0 64 64"><rect x="18" y="8" width="32" height="42" rx="6" fill="#ADCAFF" stroke="#1A2233" stroke-width="2.5" transform="rotate(10 34 29)"/><rect x="12" y="12" width="32" height="42" rx="6" fill="#fff" stroke="#1A2233" stroke-width="2.5" transform="rotate(-6 28 33)"/><text x="28" y="39" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="17" fill="#3264FA" transform="rotate(-6 28 33)">Aa</text><path d="M50 4l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FABE0A" stroke="#1A2233" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  gift: `<svg viewBox="0 0 64 64"><rect x="10" y="26" width="44" height="28" rx="5" fill="#3264FA" stroke="#1A2233" stroke-width="2.5"/><path d="M29 27h6v26h-6z" fill="#FABE0A"/><rect x="6" y="18" width="52" height="11" rx="4" fill="#4AA8FF" stroke="#1A2233" stroke-width="2.5"/><path d="M29 18h6v11h-6z" fill="#FABE0A"/><path d="M32 18c-4-10-16-10-14-3 1 3 8 3 14 3zM32 18c4-10 16-10 14-3-1 3-8 3-14 3z" fill="#FFE28C" stroke="#1A2233" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  flame: off => `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="60" rx="16" ry="3" fill="#0E2F9E" opacity=".25"/><g class="f-out"><path d="M32 4c4 10 17 16 17 33a17 17 0 0 1-34 0c0-9 4-14 8.5-18 1 5.5 3.2 8.5 6.5 9.5C29 19 30 11 32 4z" fill="${off ? '#C2C5CC' : '#FF8000'}" stroke="#1A2233" stroke-width="2.5" stroke-linejoin="round"/></g><g class="f-in"><path d="M32 30c3 5 9 8 9 16a9 9 0 0 1-18 0c0-4.5 2.2-7.5 4.5-9.5.8 2.4 2 3.6 3.4 3.9C30.4 36.6 31 33.4 32 30z" fill="${off ? '#E1E6F0' : '#FFE28C'}" stroke="#1A2233" stroke-width="2" stroke-linejoin="round"/></g><path d="M22 31c-1.5 2-2.5 4-2.6 6.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></svg>`
};

/* ---------- 状态工具 ---------- */
const titleOf = (k, w) => w <= 12 ? D.TITLES[k][w - 1] : D.SPRINT[w - 13];
const stageOf = w => STAGES.find(s => w >= s.f && w <= s.t);
const curW = k => Math.min(S.prog[k] + 1, 13);
const pct = k => Math.round(S.prog[k] / 12 * 100);
const total = () => KEYS.reduce((a, k) => a + S.prog[k], 0);
function nodeState(k, w) {
  const p = S.prog[k];
  if (w <= 12) return w <= p ? 'done' : (w === p + 1 ? 'cur' : 'lock');
  return (p >= 12 && w === 13) ? 'cur' : 'lock';
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/* ---------- 轻提示 / 弹层 ---------- */
const toastEl = $('#toast'); let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 1900); }
const sheet = $('#sheet'), scrim = $('#scrim'); let lastFocus;
function openSheet(title, html) {
  if (!sheet.classList.contains('on')) lastFocus = document.activeElement;
  $('#sheetTitle').textContent = title; $('#sheetBody').innerHTML = html;
  sheet.style.removeProperty('--drag'); sheet.scrollTop = 0;
  sheet.classList.remove('on'); void sheet.offsetWidth;
  scrim.classList.add('on'); sheet.classList.add('on');
  setTimeout(() => sheet.focus({ preventScroll: true }), 320);
}
function closeSheet() { sheet.classList.remove('on'); scrim.classList.remove('on'); sheet.style.removeProperty('--drag'); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); }
scrim.addEventListener('click', closeSheet);
let y0 = null; const grab = $('#grab');
grab.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; y0 = e.clientY; sheet.classList.add('dragging'); grab.setPointerCapture(e.pointerId); });
grab.addEventListener('pointermove', e => { if (y0 === null) return; sheet.style.setProperty('--drag', Math.max(0, (e.clientY - y0) / scale()) + 'px'); });
grab.addEventListener('pointerup', e => { if (y0 === null) return; const dy = (e.clientY - y0) / scale(); y0 = null; sheet.classList.remove('dragging'); dy > 90 ? closeSheet() : sheet.style.setProperty('--drag', '0px'); });

/* ---------- 计数动效 ---------- */
function countUp(root) {
  if (reduce) return;
  $$('[data-count]', root).forEach(el => {
    const to = +el.dataset.count; if (!to) return;
    const t0 = performance.now(), dur = 900;
    const f = now => { const p = Math.max(0, Math.min(1, (now - t0) / dur)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}
function placeUl(root) {
  if (!root) return;
  $$('.ltabs', root).forEach(t => { const on = $('button.on', t), ul = $('.ul', t); if (on && ul) ul.style.transform = `translateX(${on.offsetLeft + (on.offsetWidth - 48) / 2}px)`; });
  $$('.seg2', root).forEach(t => { const on = $('button.on', t), kn = $('.kn', t); if (on && kn) { kn.style.width = on.offsetWidth + 'px'; kn.style.transform = `translateX(${on.offsetLeft - 2}px)`; } });
}
const ltabs = (act, list, cur) => `<div class="ltabs" role="tablist">${list.map(([v, l]) => `<button role="tab" aria-selected="${v === cur}" data-act="${act}" data-v="${v}" class="${v === cur ? 'on' : ''}">${l}</button>`).join('')}<i class="ul"></i></div>`;

/* =================================================================
   学习（M02）
   ================================================================= */
function mState(m) { return S.claimed[m.d] ? 'claimed' : (S.streak >= m.d ? 'ready' : 'future'); }
function railP() {
  const ds = [0, 3, 7, 14, 21, 30], ps = [0, .1, .3, .5, .7, .9], s = S.streak;
  if (s >= 30) return 1;
  for (let i = 1; i < ds.length; i++) if (s <= ds[i]) return ps[i - 1] + (s - ds[i - 1]) / (ds[i] - ds[i - 1]) * (ps[i] - ps[i - 1]);
  return 1;
}
function mileSel() { return S.mileSel || (MILES.find(m => mState(m) === 'ready') || MILES.find(m => S.streak < m.d) || MILES[4]).d; }
function mDetail(d) {
  const m = MILES.find(x => x.d === d), st = mState(m);
  const r = st === 'claimed' ? '<span class="tag t-grey">已领取</span>'
    : st === 'ready' ? `<button class="btn btn-xs btn-primary" data-act="claim" data-d="${d}">领取</button>`
    : `<span class="tag t-blue">还差 ${m.d - S.streak} 天</span>`;
  return `<span class="gico">${ST.gift}</span><span class="mt"><b>${m.n}</b><small>${m.rw.join('、')}</small></span>${r}`;
}
function streakHTML() {
  const today = 4, days = ['一', '二', '三', '四', '五', '六', '日'];
  const cells = days.map((d, i) => {
    let cls = 'day', lit = false;
    if (i > today) cls += ' fut';
    else lit = S.lit ? (today - i < S.streak) : (i < today && today - 1 - i < S.streak);
    if (lit) cls += ' lit'; if (i === today) cls += ' today';
    return `<div class="${cls}" style="--d:${i}"><i>${lit ? `<span style="color:#FF8000;display:grid">${ic('flame', 18)}</span>` : ''}</i>${i === today ? '今天' : '周' + d}</div>`;
  }).join('');
  const pips = [0, 1].map(i => `<i class="${i < S.cards ? 'on' : ''}"></i>`).join('');
  return `<section class="streak rise" style="--i:2" id="streak">
    <div class="sk-top"><span class="flame ${S.lit ? '' : 'off'}">${ST.flame(!S.lit)}</span>
      <div class="sk-num"><small>严格连胜 · 每天最多 +1</small><b><em class="num" data-count="${S.streak}">${S.streak}</em>天连胜</b></div>
      ${S.lit ? `<span class="tag t-onc">${ic('check', 12, 2.6)}今日已点亮</span>` : '<span class="tag t-warn">今日未点亮</span>'}</div>
    <div class="week">${cells}</div>
    <div class="conds"><div class="conds-h"><span>今日点亮条件 · 任一即可</span><button data-act="rules">规则${ic('chevR', 14, 2)}</button></div>
      <div class="conds-g">${CONDS.map(c => `<button class="cond ${S.cond[c.k] ? 'met' : ''}" data-act="rules"><span class="ci">${ic(S.cond[c.k] ? 'check' : c.ic, 18, S.cond[c.k] ? 2.4 : 1.8)}</span><b>${c.n}</b><small>${S.cond[c.k] ? '已达成' : c.s}</small></button>`).join('')}</div></div>
    <div class="sk-foot"><button data-act="cardsInfo">${ic('ticket', 18)}补签卡 <span class="pips">${pips}</span><span class="num">${S.cards}/2</span></button>
      <span class="shield">自动护盾<button class="switch" role="switch" aria-checked="${S.shield}" data-act="shield" aria-label="自动护盾"></button></span></div>
  </section>`;
}
function mileHTML() {
  const next = MILES.find(m => S.streak < m.d), sel = mileSel();
  return `<section class="card rise" style="--i:3" id="mile">
    <div class="card-h"><h3>连续打卡赢免费模考</h3><span class="more">${next ? `下一站 <b>${next.d} 天</b> · 还差 ${next.d - S.streak} 天` : '五阶全部达成'}</span></div>
    <div class="rail"><div class="rail-track"><i class="rail-fill" id="railFill" style="--p:0"></i></div>
      ${MILES.map((m, i) => { const st = mState(m); return `<button class="mnode ${st} ${m.d === sel ? 'sel' : ''}" style="--x:${10 + i * 20}%" data-act="mile" data-d="${m.d}" aria-label="${m.n}"><span class="mdot">${ic(st === 'claimed' ? 'check' : 'gift', 18, st === 'claimed' ? 2.4 : 1.8)}</span><b>${m.d} 天</b></button>`; }).join('')}
    </div>
    <div class="mdetail" id="mdetail">${mDetail(sel)}</div>
  </section>`;
}
function nowHTML() {
  const k = S.cur, w = curW(k);
  return `<section class="card now"><div class="now-h"><span class="ico48">${ST[k]}</span><div style="flex:1;min-width:0"><p class="cap">当前该学 · 雅思${SUBJ[k]} · ${stageOf(w).n}</p><h3>W${w} · ${titleOf(k, w)}</h3></div></div>
    <div class="pbar"><span>已学 <span class="num">${S.prog[k]}/12</span> 讲</span><span class="bar"><i style="--p:${S.prog[k] / 12}"></i></span><b>${pct(k)}%</b></div>
    <div class="acts"><button class="btn btn-m btn-outline" data-act="adapt" data-k="${k}">自适应专项</button><button class="btn btn-m btn-primary" data-act="node" data-k="${k}" data-w="${w}">继续学习${ic('chevR', 18, 2)}</button></div></section>`;
}
function stageHTML(k, si) {
  const st = STAGES[si], ws = range(st.f, st.t), sts = ws.map(w => nodeState(k, w));
  const done = sts.filter(x => x === 'done').length, isCur = sts.includes('cur'), allDone = done === ws.length;
  const key = k + si, open = S.mapOpen[key] !== undefined ? S.mapOpen[key] : isCur;
  const rows = ws.map((w, i) => ({ w, st: sts[i] }));
  if (si === 2) rows.push({ cert: true, st: S.prog[k] >= 12 ? 'done' : 'lock' });
  const X = [36, 104], H = 76;
  let paths = '';
  for (let i = 0; i < rows.length - 1; i++) {
    const x1 = X[i % 2], y1 = i * H + H / 2, x2 = X[(i + 1) % 2], y2 = y1 + H;
    const d = `M${x1} ${y1}C${x1} ${y1 + H / 2} ${x2} ${y2 - H / 2} ${x2} ${y2}`;
    const on = rows[i + 1].st !== 'lock';
    paths += on ? `<path class="p-on" pathLength="1" style="--s:${i}" d="${d}"/>` : `<path class="p-off" d="${d}"/>`;
  }
  const rowsH = rows.map((r, i) => {
    const x = X[i % 2];
    if (r.cert) return `<div class="row ${r.st}"><button class="node cert ${r.st === 'done' ? '' : 'off'}" style="left:${x}px" data-act="cert" data-k="${k}" aria-label="单科结营证书">${ic('award', 22)}</button><button class="lbl" data-act="cert" data-k="${k}"><small>W12 完课 · <span class="num">${S.prog[k]}/12</span></small><b>单科结营证书</b></button></div>`;
    const inner = r.st === 'done' ? ic('check', 22, 2.4) : r.st === 'cur' ? ic('play', 22) : ic('lock', 20);
    return `<div class="row ${r.st}"><button class="node ${r.st}" style="left:${x}px" data-act="node" data-k="${k}" data-w="${r.w}" aria-label="W${r.w}">${inner}</button><button class="lbl" data-act="node" data-k="${k}" data-w="${r.w}"><small>W${r.w}${r.st === 'cur' ? ' <span class="tag t-blue">当前</span>' : r.st === 'done' ? ' · 已点亮' : ''}</small><b>${titleOf(k, r.w)}</b></button></div>`;
  }).join('');
  return `<div class="stage-c ${isCur ? 'cur' : ''} ${allDone ? 'done' : ''} ${open ? 'open' : ''}" data-key="${key}">
    <button class="stg-h" data-act="stage" data-key="${key}" aria-expanded="${open}"><span class="stg-no">${allDone ? ic('check', 18, 2.4) : '0' + (si + 1)}</span><span class="stg-t"><b>${st.n}</b><small>W${st.f}–${st.t} · ${st.d}</small></span><span class="stg-r">${isCur ? '<span class="tag t-blue">进行中</span>' : ''}<span>${done}/${ws.length}</span>${ic('chevD', 20, 1.8, 'chev')}</span></button>
    <div class="fold"><div><div class="trail"><svg class="path" height="${rows.length * H}" viewBox="0 0 140 ${rows.length * H}">${paths}</svg>${rowsH}</div></div></div></div>`;
}
function mapHTML() {
  const k = S.cur;
  return `<div id="mapSec"><div class="sec-h"><h2>14 周闯关地图</h2><span>顺序解锁 · 已点亮 ${S.prog[k]} 讲</span></div>${STAGES.map((_, si) => stageHTML(k, si)).join('')}</div>`;
}
function renderStudy() {
  const v = $('#v-study'), top = v.scrollTop, seen = v.classList.contains('seen');
  v.innerHTML = `<div class="bgtop"></div><div class="wrap">
    <header class="ph rise" style="--i:0"><div><p class="hello">${S.name} · 目标 <b>${S.target}</b></p><h1 class="disp">下午好</h1></div><button class="avatar" data-act="tab" data-tab="me" aria-label="我的">王</button></header>
    ${S.remind ? `<div class="remind rise" style="--i:1" id="remind"><span class="tav">王</span><p><b>王老师提醒：</b>本周还有课程未完成，抽 15 分钟学完下一讲吧。</p><button class="btn btn-xs btn-outline" data-act="remindOk">知道了</button></div>` : ''}
    ${streakHTML()}${mileHTML()}
    <div class="subjbar rise" style="--i:4">${ltabs('subj', KEYS.map(k => [k, SUBJ[k]]), S.cur)}</div>
    <div class="swapzone rise" style="--i:5" id="studyZone">${nowHTML()}${mapHTML()}</div>
    <section class="duo rise" style="--i:6">
      <button class="tile dark" data-act="game" data-v="同义配对"><h4>轻游乐场</h4><p>配对 · 快打 · 实景</p><span class="big" style="font-size:14px;line-height:22px;color:#ADCAFF;font-family:var(--sans)">去玩一局 ›</span><span class="tico">${ST.game}</span></button>
      <button class="tile white" data-act="words"><h4>3000 核心词</h4><p>已学 <span class="num">320</span> / 3000</p><span class="big"><span class="num" data-count="24">24</span><small>词待复习</small></span><span class="tico">${ST.words}</span></button>
    </section></div>`;
  v.scrollTop = top; placeUl(v);
  const rf = $('#railFill');
  if (seen || reduce) rf.style.setProperty('--p', railP()); else requestAnimationFrame(() => requestAnimationFrame(() => rf.style.setProperty('--p', railP())));
  if (!seen) countUp(v);
}
function swapStudyZone() {
  const z = $('#studyZone'); z.classList.add('fade');
  setTimeout(() => { z.innerHTML = nowHTML() + mapHTML(); z.classList.remove('fade'); }, reduce ? 0 : 160);
}
function refreshMile(pop) {
  const m = $('#mile'); if (!m) return;
  const tmp = document.createElement('div'); tmp.innerHTML = mileHTML(); const n = tmp.firstElementChild; n.classList.remove('rise');
  m.replaceWith(n); $('#railFill').style.setProperty('--p', railP());
  if (pop) { const b = $(`.mnode[data-d="${pop}"] .mdot`); b && b.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
}

/* =================================================================
   课程（M07）
   ================================================================= */
const ringSVG = (p, track, col, sw = 3.2) => `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke="${track}" stroke-width="${sw}"/><circle class="rv" cx="18" cy="18" r="15.9" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" pathLength="100" style="--p:${p}"/></svg>`;
function lsnRow(k, w) {
  const st = nodeState(k, w);
  const end = st === 'done' ? ic('check', 18, 2.4) : st === 'lock' ? ic('lock', 16) : ic('chevR', 18, 2);
  return `<button class="lsn ${st}" data-act="node" data-k="${k}" data-w="${w}"><span class="wn">W${w}</span><span class="lt">${titleOf(k, w)}</span>${st === 'cur' ? '<span class="tag t-blue">当前</span>' : ''}<span class="st">${end}</span></button>`;
}
function courseHTML(k, i) {
  const open = S.courseOpen[k] !== undefined ? S.courseOpen[k] : k === S.cur;
  const hide = S.filter !== 'all' && S.filter !== k;
  return `<div class="course ${open ? 'open' : ''} ${hide ? 'hide' : ''}" data-k="${k}" style="--i:${i}">
    <button class="ch-h" data-act="course" data-k="${k}" aria-expanded="${open}"><span class="ico48">${ST[k]}</span><span class="ct"><b>雅思${SUBJ[k]}<span class="tag t-ok">${ic('check', 12, 2.6)}已购</span></b><span class="pbar"><span>已学 <span class="num">${S.prog[k]}/12</span> 讲</span><span class="bar"><i style="--p:${S.prog[k] / 12}"></i></span><b>${pct(k)}%</b></span></span>${ic('chevD', 20, 1.8, 'chev')}</button>
    <div class="fold"><div>${STAGES.map(st => `<div class="stg-cap"><b>${st.n}</b><span class="num">W${st.f}–${st.t}</span></div>` + range(st.f, st.t).map(w => lsnRow(k, w)).join('')).join('')}<div style="height:8px"></div></div></div></div>`;
}
function renderCourse() {
  const v = $('#v-course'), top = v.scrollTop, t = total(), p = Math.round(t / 48 * 100);
  v.innerHTML = `<div class="bgtop"></div><div class="wrap">
    <header class="ph rise" style="--i:0"><div><p class="hello">四科均已购 · 每科 14 周</p><h1 class="disp">课程</h1></div></header>
    <section class="total rise" style="--i:1"><div class="total-t"><div><small>四门课合计</small><b><em class="num" data-count="${t}">${t}</em><span>/ 48 讲</span></b></div><div class="ring">${ringSVG(p, 'rgba(255,255,255,.14)', '#4AA8FF')}<em>${p}%</em></div></div>
      <div class="minis">${KEYS.map(k => `<div class="mini"><small>${SUBJ[k]}<span>${S.prog[k]}/12</span></small><div class="bar"><i style="--p:${S.prog[k] / 12}"></i></div></div>`).join('')}</div></section>
    <div class="pills rise" style="--i:2" role="tablist">${['all', ...KEYS].map(f => `<button class="pill ${S.filter === f ? 'on' : ''}" data-act="filter" data-f="${f}">${f === 'all' ? '全部' : SUBJ[f]}</button>`).join('')}</div>
    <div id="courses" class="rise" style="--i:3">${KEYS.map(courseHTML).join('')}</div></div>`;
  v.scrollTop = top;
  if (!v.classList.contains('seen')) countUp(v);
}

/* =================================================================
   训练（M03）
   ================================================================= */
function renderTrain() {
  const v = $('#v-train');
  const stars = n => `<span>${range(1, 5).map(() => `<i style="display:grid;color:rgba(255,255,255,.2)">${ic('star', 10)}</i>`).join('')}</span>${n}`;
  v.innerHTML = `<div class="bgtop"></div><div class="wrap">
    <header class="ph rise" style="--i:0"><div><p class="hello">四科已诊断 · 按薄弱技能推荐</p><h1 class="disp">训练</h1></div></header>
    <div class="sec-h rise" style="--i:1;margin-top:0"><h2>手机端专项</h2><span>听力 · 口语</span></div>
    <section class="hero-l rise" style="--i:2" id="hero-L">
      <div class="hl-h"><span class="ico40">${ST.L}</span><b>听力专项</b><span class="tag t-onc">${ic('check', 12, 2.6)}已诊断</span></div>
      <div class="hl-body"><div class="tx"><small>推荐题组 · 剑桥 20 Test 2</small><h3>Part 1 · Help for carers</h3>
        <div class="chips"><span class="chip">技能：获取细节信息</span><span class="chip">题型：笔记填空</span></div></div>
        <div class="gauge"><svg viewBox="0 0 100 56"><path d="M8 50A42 42 0 0 1 92 50" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="8" stroke-linecap="round"/><path class="gv" d="M8 50A42 42 0 0 1 92 50" fill="none" stroke="#FFE28C" stroke-width="8" stroke-linecap="round" pathLength="100" style="--p:70"/></svg><b>七成</b><small>预计答对约</small></div></div>
      <button class="btn btn-m btn-white blk" data-act="practice" data-k="L">开始听力专项</button>
    </section>
    <section class="hero-s rise" style="--i:3" id="hero-S">
      <div class="hl-h"><span class="ico40">${ST.S}</span><b>口语专项</b><span class="tag t-onc">${ic('check', 12, 2.6)}已诊断</span></div>
      <div class="parts"><div class="part"><span class="pn">Part 2</span><span>改变计划的经历</span></div>
        <div class="part"><span class="pn">Part 3</span><span>AI 考官对话</span><span class="wave">${range(0, 6).map(i => `<i style="--d:${i}"></i>`).join('')}</span></div></div>
      <div class="stars">${['流利连贯', '词汇', '语法', '发音'].map(n => `<div>${stars(n)}</div>`).join('')}</div>
      <div class="hs-foot"><p>提交后 AI 按四个维度给出星级</p><button class="btn btn-s btn-primary" data-act="practice" data-k="S">开始练习</button></div>
    </section>
    <div class="sec-h rise" style="--i:4"><h2>词汇与游戏</h2><span>每天 10 分钟</span></div>
    <section class="duo rise" style="--i:5;margin-top:0">
      <button class="tile white" data-act="words"><h4>3000 核心词</h4><p>今日新学 <span class="num">10</span> · 复习 <span class="num">24</span></p>
        <div class="wring"><div class="ring">${ringSVG(11, '#F5F7FA', '#3264FA', 4)}<em>11%</em></div><p><b>320</b><br>已学词</p></div></button>
      <div class="tile dark"><h4>轻游乐场</h4><p>选一个玩法开始</p><div class="games">${['同义配对', '机考快打', 'AI 留学实景'].map(g => `<button class="game" data-act="game" data-v="${g}"><i></i>${g}</button>`).join('')}</div></div>
    </section>
    <div class="sec-h rise" style="--i:6"><h2>电脑端科目</h2><span>报告可在手机查看</span></div>
    <div class="group rise" style="--i:7">${['R', 'W'].map(k => `<button class="li pcrow" id="pc-${k}" data-act="pc" data-k="${k}"><span class="ico40">${ST[k]}</span><span class="lt">${SUBJ[k]}专项<small>在电脑端练习，可在这里看报告</small></span><span class="tag t-ok">已诊断</span><span class="lr">${ic('chevR', 16)}</span></button>`).join('')}
      <div class="pcfoot">${ic('pc', 16)}电脑浏览器打开 <b>${PC_ADDR}</b><button data-act="copy">复制地址</button></div></div>
  </div>`;
}

/* =================================================================
   我的（M10）
   ================================================================= */
function renderMe() {
  const v = $('#v-me'), top = v.scrollTop;
  const date = S.examDate && !S.examUnknown ? S.examDate : '';
  const li = (act, icn, t, r) => `<button class="li" data-act="${act}">${ic(icn, 24, 1.8, 'lic')}<span class="lt">${t}</span><span class="lr">${r || ''}${ic('chevR', 16)}</span></button>`;
  v.innerHTML = `<div class="bgtop"></div><div class="wrap">
    <header class="me-h rise" style="--i:0"><span class="me-av">王</span><div class="nm"><b>${S.name}</b><small>${S.phone}</small></div><button class="icobtn" data-act="settings" aria-label="账号设置">${ic('gear', 22)}</button></header>
    <button class="goalc rise" style="--i:1" data-act="goal"><div class="gh">目标与权益<span>编辑${ic('chevR', 16, 2)}</span></div>
      <div class="gstats"><div><b class="num">${S.target}</b><small>目标总分</small></div><div><b class="${date ? 'num' : 'sm'}" style="${date ? 'font-size:16px' : ''}">${date || '选填'}</b><small>考试日期</small></div><div><b class="num" data-count="${S.streak}">${S.streak}</b><small>连胜天数</small></div></div></button>
    <p class="grp-t">学习</p>
    <div class="group rise" style="--i:2">${li('myMap', 'map', '我的学习地图', `已点亮 <span class="num">${total()}</span> 讲`)}${li('report', 'report', '学习报告')}${li('coupons', 'ticket', '我的卡券包', `补签卡 <span class="num">${S.cards}/2</span> 张 · ${S.coupons.length} 张券可用`)}</div>
    <p class="grp-t">购买与订单</p>
    <div class="group rise" style="--i:3">${li('shop', 'cart', '购买中心')}${li('mocks', 'exam', '已购模考', '1 套未开始')}${li('orders', 'order', '我的订单', '<i class="dot"></i>1 笔待支付')}</div>
    <div class="group rise" style="--i:4">${li('settings', 'gear', '账号设置')}</div>
  </div>`;
  v.scrollTop = top;
  if (!v.classList.contains('seen')) countUp(v);
}

/* ---------- 页签切换 ---------- */
const TABS = ['study', 'course', 'train', 'me'], RENDER = { study: renderStudy, course: renderCourse, train: renderTrain, me: renderMe };
const rendered = { study: false, course: false, train: false, me: false };
let curTab = 'study';
const topbar = $('#topbar');
function show(t) {
  const v = $('#v-' + t);
  if (!rendered[t]) { RENDER[t](); rendered[t] = true; setTimeout(() => v.classList.add('seen'), 1400); }
  return v;
}
function rerender(...ts) { ts.forEach(t => { if (rendered[t]) RENDER[t](); }); }
function switchTab(t) {
  if (t === curTab) { const v = $('#v-' + t); v.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return v; }
  const a = TABS.indexOf(curTab), b = TABS.indexOf(t), dir = b > a ? 1 : -1;
  const from = $('#v-' + curTab), to = show(t);
  from.style.setProperty('--dir', dir); to.style.setProperty('--dir', dir); to.classList.remove('out'); void to.offsetWidth;
  from.classList.remove('on'); from.classList.add('out'); setTimeout(() => from.classList.remove('out'), 380);
  to.classList.add('on'); curTab = t; placeUl(to);
  $$('#nav button').forEach((x, i) => { x.classList.toggle('on', i === b); x.setAttribute('aria-current', i === b ? 'page' : 'false'); });
  $('#nav .pill-bg').style.transform = `translateX(${b * 100}%)`;
  onScroll();
  return to;
}
function onScroll() { const v = $('#v-' + curTab); $('#topTitle').textContent = v.dataset.title; topbar.classList.toggle('on', v.scrollTop > 56); }
$$('.view').forEach(v => v.addEventListener('scroll', () => { if (v.id === 'v-' + curTab) onScroll(); }, { passive: true }));
$('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { closeSheet(); popAll(); switchTab(b.dataset.tab); } });
function scrollToEl(view, el, off = 140) {
  if (!el) return;
  const k = scale(), top = view.scrollTop + (el.getBoundingClientRect().top - view.getBoundingClientRect().top) / k - off;
  view.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
}
function flash(el, cls = 'flash') { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

/* ---------- 二级页 ---------- */
const subs = [];
function pushSub(title, html, bar) {
  const el = document.createElement('section'); el.className = 'sub';
  el.innerHTML = `<header class="sub-h"><button class="back" data-act="back" aria-label="返回">${ic('chevL', 24, 2)}</button><b>${title}</b></header><div class="sub-body ${bar ? 'has-bar' : ''}">${html}</div>${bar || ''}`;
  $('#subs').appendChild(el); void el.offsetWidth; el.classList.add('on');
  if (subs.length) subs[subs.length - 1].style.transform = 'translateX(-28%)';
  subs.push(el); phone.classList.add('in-sub'); placeUl(el);
  return el;
}
function popSub() {
  const el = subs.pop(); if (!el) return;
  if (el.dataset.kind === 'lesson') { stopPlay(); L = null; }
  el.classList.remove('on'); setTimeout(() => el.remove(), 460);
  if (subs.length) subs[subs.length - 1].style.transform = ''; else phone.classList.remove('in-sub');
}
function popAll() { while (subs.length) popSub(); }

/* ---------- 课程学习页（播放器 + 点亮） ---------- */
let L = null, timer = null;
const DUR = 20 * 60; /* 演示时长 [AI 假设] */
const SPEEDS = [.75, 1, 1.25, 1.5], SPL = ['0.75×', '1.0×', '1.25×', '1.5×'];
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
function lessonHTML() {
  const { k, w } = L, st = stageOf(w), pts = (D.PTS[k][w - 1] || []);
  return `<div class="player" id="player"><div class="pv"><small>雅思${SUBJ[k]} · W${w}</small><h4>${titleOf(k, w)}</h4><p class="pv-sub">${st.n} · 视频讲解</p>
      <button class="bigplay" data-act="play" aria-label="播放">${ic('play', 26)}</button><span class="eq">${range(0, 4).map(i => `<i style="--d:${i};height:${8 + i * 3}px"></i>`).join('')}</span></div>
    <div class="ctrl"><button class="pp" data-act="play" id="pp" aria-label="播放或暂停">${ic('play', 20)}</button><span class="tm" id="tm"></span>
      <div class="track" id="track" role="slider" aria-label="播放进度" aria-valuemin="0" aria-valuemax="100"><i class="tw"></i><i class="tf"></i><i class="t80"></i><i class="tk"></i></div>
      <button class="spd" data-act="speed" id="spd">${SPL[L.si]}</button></div></div>
    <div class="jump"><span>演示快进</span><button data-act="jump" data-v="85">到 85%</button><button data-act="jump" data-v="100">看完</button><span style="margin-left:auto">黄线 = 80% 点亮线</span></div>
    <section class="card les-t"><span class="tag t-blue">雅思${SUBJ[k]} · ${st.n}</span><h2>W${w} · ${titleOf(k, w)}</h2><ol class="pts">${pts.map(p => `<li>${p}</li>`).join('')}</ol></section>
    <section class="card unlock" id="unlock"></section>
    <section class="card adapt"><span class="ico40">${ST[k]}</span><div class="tx"><b>趁热打铁 · 自适应强化训练</b><small>${k === 'L' || k === 'S' ? '题型与难点衔接本讲内容，手机端可练' : '阅读、写作专项需在电脑端进行'}</small></div><button class="btn btn-xs btn-outline" data-act="adaptL">去练习</button></section>
    <div class="lnav" id="lnav"></div>`;
}
function renderLessonParts() {
  if (!L) return;
  const tr = $('#track'); if (!tr) return;
  tr.style.setProperty('--pos', L.pos + '%'); tr.style.setProperty('--wat', L.watched + '%'); tr.setAttribute('aria-valuenow', Math.round(L.pos));
  $('#tm').textContent = `${fmt(L.pos / 100 * DUR)} / ${fmt(DUR)}`;
  const u = $('#unlock'), wv = Math.round(L.watched);
  u.classList.toggle('lit', L.lit);
  const html = L.lit
    ? `<div class="uh">${ic('check', 20, 2.6)}已点亮 · 下一讲解锁</div><div class="ub"><i style="--w:${wv}%"></i><em></em></div><div class="ut"><span>${L.msg || '视频观看 ≥ 80% 已达成'}</span><b>${wv}%</b></div>`
    : `<div class="uh">${ic('lock', 20)}看到 80% 点亮本讲</div><div class="ub"><i style="--w:${wv}%"></i><em></em></div><div class="ut"><span>视频观看 ≥ 80%（当前 ${wv}%）</span><b>${wv}%</b></div>`;
  if (u.dataset.h !== html) { u.dataset.h = html; const sp = $$('.spark-p', u); u.innerHTML = html; sp.forEach(s => u.appendChild(s)); }
  const canNext = L.w < 12 && L.w <= S.prog[L.k];
  $('#lnav').innerHTML = `<button class="btn btn-s btn-outline" data-act="prevL" ${L.w > 1 ? '' : 'disabled'}>上一讲</button><button class="btn btn-s ${canNext ? 'btn-primary' : ''}" data-act="nextL" ${canNext ? '' : 'disabled'}>${canNext ? '下一讲' : '下一讲 · 未解锁'}</button>`;
}
function setL(k, w) {
  const done = w <= S.prog[k], saved = S.lpos[k + w];
  L = { k, w, pos: done ? 0 : (saved ?? 32), watched: done ? 100 : (saved ?? 32), lit: done, finished: done, si: 1, msg: '' };
}
function openLesson(k, w) {
  stopPlay(); setL(k, w);
  const el = pushSub(`雅思${SUBJ[k]} · W${w}`, lessonHTML()); el.dataset.kind = 'lesson';
  renderLessonParts(); bindTrack();
}
function swapLesson(k, w) {
  const el = subs[subs.length - 1];
  if (!el || el.dataset.kind !== 'lesson') return openLesson(k, w);
  stopPlay(); setL(k, w);
  const body = $('.sub-body', el); $('.sub-h b', el).textContent = `雅思${SUBJ[k]} · W${w}`;
  body.style.transition = 'opacity .16s'; body.style.opacity = 0;
  setTimeout(() => { body.innerHTML = lessonHTML(); body.scrollTop = 0; renderLessonParts(); bindTrack(); body.style.opacity = 1; }, reduce ? 0 : 160);
}
function bindTrack() {
  const tr = $('#track'); let drag = false;
  const at = e => { const r = tr.getBoundingClientRect(); setPos(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100))); };
  tr.addEventListener('pointerdown', e => { drag = true; tr.setPointerCapture(e.pointerId); at(e); });
  tr.addEventListener('pointermove', e => { if (drag) at(e); });
  tr.addEventListener('pointerup', () => { drag = false; });
}
function setPos(p) {
  if (!L) return;
  L.pos = p; L.watched = Math.max(L.watched, p); S.lpos[L.k + L.w] = L.watched;
  if (!L.lit && L.watched >= 80) doLit();
  renderLessonParts();
  if (!L.finished && L.watched >= 100) { L.finished = true; stopPlay(); setTimeout(finishSheet, reduce ? 0 : 420); }
}
function updPlay() {
  const pl = $('#player'); if (!pl) return;
  pl.classList.toggle('playing', !!timer); $('#pp').innerHTML = ic(timer ? 'pause' : 'play', 20);
}
function startPlay() { if (timer || !L) return; if (L.pos >= 100) L.pos = 0; timer = setInterval(() => { setPos(Math.min(100, L.pos + .5 * SPEEDS[L.si])); if (L && L.pos >= 100) stopPlay(); }, 100); updPlay(); }
function stopPlay() { clearInterval(timer); timer = null; updPlay(); }
function doLit() {
  L.lit = true;
  const first = L.w === S.prog[L.k] + 1;
  if (first) S.prog[L.k] = L.w;
  S.cond.a = true;
  let plus = false;
  if (!S.lit) { S.lit = true; S.streak += 1; plus = true; }
  L.msg = plus ? '本讲已点亮 · 今日连胜火苗 +1' : '本讲已点亮 · 今日火苗已亮，连胜每天最多 +1';
  toast(plus ? '本讲已点亮 · 今日连胜火苗 +1' : (L.w < 12 ? `本讲已点亮 · W${L.w + 1} 已解锁` : '本讲已点亮'));
  setTimeout(burst, 30);
  rerender('study', 'course', 'me');
}
function burst() {
  const u = $('#unlock'); if (!u || reduce) return;
  flash(u, 'burst');
  const cols = ['#0AC77C', '#FABE0A', '#3264FA', '#4AA8FF', '#FF8000'];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('i'); s.className = 'spark-p';
    const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 70;
    s.style.cssText = `left:30px;top:30px;background:${cols[i % 5]};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r * .6}px;--r:${Math.random() * 360}deg;border-radius:${i % 2 ? '50%' : '2px'}`;
    u.appendChild(s); setTimeout(() => s.remove(), 1000);
  }
}
function finishSheet() {
  if (!L) return;
  const hasNext = L.w < 12;
  openSheet('本讲已学完，趁热巩固一下', `<p class="lead">已为你匹配本讲对应的自适应强化训练，题型与难点衔接本讲内容。</p><div class="col">
    <button class="btn btn-l btn-primary blk stag" style="--i:0" data-act="adaptL">去自适应强化训练</button>
    ${hasNext ? '<button class="btn btn-l btn-outline blk stag" style="--i:1" data-act="nextL">去下一讲</button>' : ''}
    <button class="btn btn-m btn-text blk stag" style="--i:2" data-act="closeSheet">留在课程页</button></div>`);
}

/* ---------- 弹层内容 ---------- */
function pcSheet(k, withReport) {
  openSheet(`${SUBJ[k]}专项请在电脑端进行`, `<p class="lead">阅读、写作的自适应专项只在电脑端进行。电脑浏览器打开下面的地址，登录同一账号即可继续。</p>
    <div class="addr stag" style="--i:0">${ic('pc', 22)}<b>${PC_ADDR}</b><button class="btn btn-xs btn-outline" data-act="copy">复制</button></div>
    ${withReport ? `<div class="duo-b stag" style="--i:1"><button class="btn btn-m btn-outline" data-act="report" data-k="${k}">看${SUBJ[k]}报告</button><button class="btn btn-m btn-primary" data-act="closeSheet">知道了</button></div>` : '<button class="btn btn-l btn-primary blk stag" style="--i:1" data-act="closeSheet">知道了</button>'}`);
}
function lockSheet(k, w) {
  const prev = w - 1;
  openSheet('本讲暂未解锁', `<p class="lead">班级为<b>顺序解锁</b>：须完成上一讲（W${prev}）的视频观看 ≥ 80%，才会点亮本讲并解锁下一讲。专项训练、背单词、轻游乐场不受影响。</p>
    <div class="rw stag" style="--i:0"><i>${ic('lock', 18)}</i><span>W${w} · ${titleOf(k, w)}</span></div>
    <div class="duo-b stag" style="--i:1;margin-top:16px"><button class="btn btn-m btn-outline" data-act="closeSheet">知道了</button><button class="btn btn-m btn-primary" data-act="gotoPrev" data-k="${k}" data-w="${prev}">去上一讲</button></div>`);
}
function rulesSheet() {
  openSheet('今日点亮规则', `<p class="lead">满足下面任意一项，当天火苗点亮，连胜每天最多 +1。</p>
    ${CONDS.map((c, i) => `<div class="rule stag" style="--i:${i}"><i>${ic(c.ic, 20)}</i><div><b>${c.n} ${S.cond[c.k] ? '<span class="tag t-ok">已达成</span>' : ''}</b><small>${c.full}</small></div></div>`).join('')}
    <div class="hint stag" style="--i:3">${ic('info', 16)}<span>补签卡最多同时持有 2 张。次日登录若断签，开启自动护盾会自动抵扣 1 张；关闭时由你手动选择是否补签。</span></div>
    <button class="btn btn-l btn-primary blk stag" style="--i:4;margin-top:16px" data-act="closeSheet">知道了</button>`);
}
function claimSheet(d) {
  const m = MILES.find(x => x.d === d);
  openSheet(`领取「${m.n}」`, `<p class="lead">连续打卡 <b>${d}</b> 天达成。每一阶权益只能领取一次。</p>
    ${m.rw.map((r, i) => `<div class="rw stag" style="--i:${i}"><i>${ic('gift', 18)}</i><span>${r}</span></div>`).join('')}
    ${d === 30 ? `<p class="cap stag" style="--i:2;margin:12px 0 8px">选择一个已购科目</p><div class="opts stag" style="--i:2">${KEYS.map((k, i) => `<button class="opt sm ${i === 2 ? 'on' : ''}" data-act="pick" data-k="${k}">${SUBJ[k]}</button>`).join('')}</div>` : ''}
    <button class="btn btn-l btn-primary blk stag" style="--i:3;margin-top:16px" data-act="doClaim" data-d="${d}">确认领取</button>`);
}
function freezeFlow() {
  S.lit = false; S.cond = { a: false, b: false, c: false };
  if (S.shield && S.cards > 0) {
    S.cards -= 1; rerender('study', 'me');
    toast(`自动护盾已抵扣 1 张补签卡，${S.streak} 天连胜已保住`);
    return;
  }
  rerender('study', 'me');
  openSheet('昨天断签了', `<p class="lead">自动护盾已关闭。使用 1 张补签卡可以保住 <b>${S.streak}</b> 天连胜；不使用，连胜从 0 开始。</p>
    <div class="rw stag" style="--i:0"><i>${ic('ticket', 18)}</i><span style="flex:1">持有补签卡</span><b class="num">${S.cards}/2</b></div>
    <div class="col stag" style="--i:1;margin-top:8px">${S.cards > 0 ? '<button class="btn btn-l btn-primary blk" data-act="useCard">使用 1 张补签卡</button>' : '<button class="btn btn-l blk" disabled>补签卡不足</button>'}
    <button class="btn btn-m btn-text blk" data-act="noCard">不使用，连胜归 0</button></div>`);
}

/* ---------- 我的 · 二级页 ---------- */
let GF = null;
const BANDS = range(8, 18).map(x => (x / 2).toFixed(1));
function scoreHTML() {
  return `<section class="card reveal"><div class="fl">真实雅思成绩<small>选填 · 默认不填</small></div><div class="scores">${['L', 'R', 'S', 'W'].map(k => `<label class="score"><span>${SUBJ[k]}</span><select data-k="${k}" aria-label="${SUBJ[k]}成绩"><option value="">不填</option>${BANDS.map(b => `<option ${GF.scores[k] === b ? 'selected' : ''}>${b}</option>`).join('')}</select></label>`).join('')}</div>
    <div class="hint">${ic('info', 16)}<span>听力、阅读成绩会直接定级并跳过对应诊断；口语、写作成绩仅作参考。</span></div></section>`;
}
function openGoal() {
  GF = JSON.parse(JSON.stringify({ target: S.target, examDate: S.examDate, unk: S.examUnknown, took: S.took, grade: S.grade, scores: S.scores }));
  const T = ['5.5', '6.0', '6.5', '7.0', '7.5', '8.0 及以上'];
  const el = pushSub('目标与权益', `<section class="card"><div class="fl">目标总分</div><div class="opts">${T.map(v => `<button class="opt ${v.length > 3 ? 'sm' : ''} ${GF.target === v ? 'on' : ''}" data-act="tgt" data-v="${v}">${v}</button>`).join('')}</div></section>
    <section class="card" style="padding-top:4px;padding-bottom:4px">
      <div class="frow"><span class="fk">预计考试日期<small>选填</small></span><input type="date" id="fDate" value="${GF.examDate}" min="2026-11-20" ${GF.unk ? 'disabled' : ''} aria-label="预计考试日期"><button class="chk ${GF.unk ? 'on' : ''}" data-act="unk"><i>${ic('check', 12, 3)}</i>暂未确定</button></div>
      <div class="frow"><span class="fk">是否参加过雅思</span><div class="seg2"><span class="kn"></span><button data-act="took" data-v="0" class="${GF.took ? '' : 'on'}">否</button><button data-act="took" data-v="1" class="${GF.took ? 'on' : ''}">是</button></div></div>
      <div class="frow"><span class="fk">当前年级</span><button class="selbtn" data-act="grade"><span id="gradeV">${GF.grade}</span>${ic('chevR', 16)}</button></div>
    </section><div id="scoreBox">${GF.took ? scoreHTML() : ''}</div>`,
    '<div class="actbar"><button class="btn btn-l btn-primary blk" data-act="saveGoal">保存</button></div>');
  $('#fDate', el).addEventListener('change', e => { GF.examDate = e.target.value; });
  el.addEventListener('change', e => { const s = e.target.closest('select'); if (s) GF.scores[s.dataset.k] = s.value; });
  requestAnimationFrame(() => placeUl(el));
}
function couponsHTML() {
  return `<div class="ticket"><div class="stub" style="background:linear-gradient(160deg,#4AA8FF,#3264FA)"><b>×${S.cards}</b><small>持有 ${S.cards}/2</small></div><div class="body"><b>补签卡</b><small>断签次日抵扣 1 天，保住连胜</small><div class="rowx"><small>自动护盾：${S.shield ? '已开启' : '已关闭'}</small><span class="tag ${S.shield ? 't-ok' : 't-grey'}">${S.shield ? '自动使用' : '手动使用'}</span></div></div></div>
    ${S.coupons.map(c => `<div class="ticket"><div class="stub" style="background:linear-gradient(160deg,#FFB35C,#FF8000)"><b>${c.stub}</b><small>${c.small}</small></div><div class="body"><b>${c.name}</b><small>${c.desc}</small><div class="rowx"><small>来自 ${c.from}</small><button class="btn btn-xs btn-outline" data-act="useCoupon">去使用</button></div></div></div>`).join('')}
    <p class="note">券仅限自研模考或增购单科，不可用于 BC 官方模考。</p>`;
}
const ORDERS = [
  { t: '自研单科模考加购 · 阅读 × 1', p: '69.00', st: 'pend' },
  { t: '单科课程 · 听力 + 口语（半年）', p: '198.00', st: 'paid', note: '支付于 10/20' },
  { t: 'BC 官方合作全真模考', p: '229.00', st: 'closed', note: '超时未支付' }
];
const OST = { pend: ['待支付', 't-warn'], paid: ['已支付', 't-ok'], closed: ['已关闭', 't-grey'] };
let cdLeft = 12 * 60 + 8;
function ordersHTML() {
  return `<div style="margin:-8px -16px 12px;padding:0 16px">${ltabs('ordTab', [['all', '全部'], ['pend', '待支付'], ['paid', '已支付'], ['closed', '已关闭']], 'all')}</div>
    ${ORDERS.map(o => `<section class="card order ${o.st === 'closed' ? 'closed' : ''}" data-st="${o.st}"><div class="oh"><span class="tag ${OST[o.st][1]}">${OST[o.st][0]}</span><small>${o.note || ''}</small></div>
      <div class="ob"><b>${o.t}</b><span class="pr">¥${o.p}</span></div>
      ${o.st === 'pend' ? `<div class="of"><span>剩余 <span class="cd" id="cd">${fmt(cdLeft)}</span> 后自动关闭</span><button class="btn btn-xs btn-primary" data-act="pay">去支付</button></div>` : ''}</section>`).join('')}`;
}
function mocksHTML() {
  return `<section class="card"><div style="display:flex;justify-content:space-between;margin-bottom:16px"><span class="tag t-blue">自研高保真模考</span><span class="tag t-warn">未开始</span></div>
    <div style="display:flex;gap:12px;align-items:center"><span class="ico48">${ST.R}</span><div><b style="display:block;font-size:18px;line-height:26px;font-weight:600">Set 1 · 阅读</b><span class="cap">有效期至 <span class="num">2027-05-01</span></span></div></div>
    <div class="hint">${ic('pc', 16)}<span>模考需在电脑端作答：电脑浏览器打开 ${PC_ADDR}，登录同一账号。</span></div>
    <button class="btn btn-m btn-primary blk" style="margin-top:16px" data-act="copy">${ic('copy', 18)}复制电脑端地址</button></section>`;
}
setInterval(() => { if (cdLeft > 0) cdLeft--; const c = $('#cd'); if (c) c.textContent = fmt(cdLeft); }, 1000);

/* ---------- 统一点击 ---------- */
const ACT = {
  tab: b => switchTab(b.dataset.tab),
  back: () => popSub(),
  closeSheet: () => closeSheet(),
  remindOk: () => {
    const r = $('#remind'); S.remind = false; if (!r) return;
    r.style.height = r.offsetHeight + 'px'; void r.offsetHeight;
    Object.assign(r.style, { height: '0px', opacity: 0, marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px' });
    setTimeout(() => r.remove(), 320); toast('已收到老师提醒');
  },
  rules: () => rulesSheet(),
  cardsInfo: () => pushSub('我的卡券包', couponsHTML()),
  shield: b => { S.shield = !S.shield; b.setAttribute('aria-checked', S.shield); toast(S.shield ? '已开启：断签次日自动抵扣 1 张补签卡' : '已关闭：断签次日由你手动选择是否补签'); },
  mile: b => { const d = +b.dataset.d; S.mileSel = d; $$('.mnode').forEach(n => n.classList.toggle('sel', n === b)); const m = $('#mdetail'); m.innerHTML = mDetail(d); flash(m, 'swap'); },
  claim: b => claimSheet(+b.dataset.d),
  pick: b => $$('[data-act="pick"]').forEach(x => x.classList.toggle('on', x === b)),
  doClaim: b => {
    const d = +b.dataset.d, m = MILES.find(x => x.d === d); S.claimed[d] = 1;
    m.rw.forEach(r => { if (r.startsWith('补签卡')) S.cards = Math.min(2, S.cards + 1); else if (r.includes('券')) S.coupons.push({ stub: r.includes('15') ? '¥15' : r.includes('30') ? '¥30' : '券', small: r.includes('增购') ? '增购单科' : '单科模考', name: r, desc: r.includes('增购') ? '增购单科下单时抵扣' : '自研单科模考下单时抵扣', from: m.n }); });
    closeSheet(); S.mileSel = d; rerender('me');
    const st = $('#streak'); if (st) { const t = document.createElement('div'); t.innerHTML = streakHTML(); const n = t.firstElementChild; n.classList.remove('rise'); st.replaceWith(n); }
    refreshMile(d); toast('领取成功，可在「我的卡券包」查看');
  },
  subj: b => { const k = b.dataset.v; if (k === S.cur) return; S.cur = k; const t = b.parentElement; $$('button', t).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); placeUl(t.parentElement); swapStudyZone(); rerender('course'); },
  stage: b => { const c = b.closest('.stage-c'), open = !c.classList.contains('open'); c.classList.toggle('open', open); b.setAttribute('aria-expanded', open); S.mapOpen[b.dataset.key] = open; },
  node: b => {
    const k = b.dataset.k, w = +b.dataset.w, st = nodeState(k, w);
    if (st === 'lock') { const row = b.closest('.row'); flash(row ? row.querySelector('.node') : b, 'shake'); return lockSheet(k, w); }
    if (w >= 13) return toast('冲刺周：按近 28 天薄弱技能生成自适应题组');
    openLesson(k, w);
  },
  cert: b => toast(S.prog[b.dataset.k] >= 12 ? '恭喜获得「单科结营证书」：W1–W12 正课全部点亮' : '再点亮 W1–W12 全部 12 讲即可获得「单科结营证书」'),
  gotoPrev: b => { closeSheet(); const k = b.dataset.k, w = +b.dataset.w, c = curW(k); if (w !== c) toast(`需先学完当前讲 W${c}`); setTimeout(() => openLesson(k, c), 200); },
  adapt: b => {
    const k = b.dataset.k, v = switchTab('train');
    setTimeout(() => { const el = (k === 'L' || k === 'S') ? $('#hero-' + k) : $('#pc-' + k); scrollToEl(v, el); flash(el); if (k === 'R' || k === 'W') setTimeout(() => pcSheet(k, true), 520); }, 420);
  },
  game: b => toast(`演示：进入轻游乐场 · ${b.dataset.v}`),
  words: () => toast('演示：进入背词 · 今日新学 10 · 复习 24'),
  play: () => timer ? stopPlay() : startPlay(),
  speed: b => { L.si = (L.si + 1) % SPEEDS.length; b.textContent = SPL[L.si]; flash(b, 'swap'); },
  jump: b => setPos(Math.max(L.watched, +b.dataset.v)),
  adaptL: () => {
    const k = L ? L.k : S.cur;
    if (k === 'R' || k === 'W') return pcSheet(k);
    closeSheet(); popAll(); const v = switchTab('train');
    setTimeout(() => { const el = $('#hero-' + k); scrollToEl(v, el); flash(el); }, 460);
  },
  nextL: () => { closeSheet(); if (L && L.w < 12) swapLesson(L.k, L.w + 1); },
  prevL: () => { if (L && L.w > 1) swapLesson(L.k, L.w - 1); },
  course: b => { const c = b.closest('.course'), open = !c.classList.contains('open'); c.classList.toggle('open', open); b.setAttribute('aria-expanded', open); S.courseOpen[b.dataset.k] = open; },
  filter: b => {
    const f = b.dataset.f; S.filter = f; $$('.pill').forEach(x => x.classList.toggle('on', x === b));
    if (f !== 'all') S.courseOpen[f] = true;
    $$('.course').forEach(c => { const hide = f !== 'all' && c.dataset.k !== f; c.classList.toggle('hide', hide); if (f !== 'all' && !hide) c.classList.add('open'); if (!hide) flash(c, 'enter'); });
  },
  practice: b => toast(`演示：进入${SUBJ[b.dataset.k]}专项练习`),
  pc: b => pcSheet(b.dataset.k, true),
  copy: () => { try { navigator.clipboard && navigator.clipboard.writeText(PC_ADDR).catch(() => {}); } catch (e) { /* 本地文件打开时可能无剪贴板权限 */ } toast('已复制电脑端地址'); },
  report: b => { closeSheet(); toast(`演示：查看${b.dataset.k ? SUBJ[b.dataset.k] : '四科'}学习报告`); },
  settings: () => toast('沿用现有账号中心'),
  goal: () => openGoal(),
  myMap: () => { const v = switchTab('study'); setTimeout(() => scrollToEl(v, $('#mapSec'), 170), 380); },
  coupons: () => pushSub('我的卡券包', couponsHTML()),
  shop: () => toast('演示：进入购买中心'),
  mocks: () => pushSub('已购模考', mocksHTML()),
  orders: () => pushSub('我的订单', ordersHTML()),
  ordTab: b => { const v = b.dataset.v, t = b.parentElement; $$('button', t).forEach(x => x.classList.toggle('on', x === b)); placeUl(t.parentElement); $$('.order').forEach(o => { const hide = v !== 'all' && o.dataset.st !== v; o.classList.toggle('gone', hide); if (!hide) flash(o, 'reveal'); }); },
  pay: () => toast('演示：拉起支付'),
  useCoupon: () => toast('演示：前往购买中心使用'),
  tgt: b => { GF.target = b.dataset.v; $$('[data-act="tgt"]').forEach(x => x.classList.toggle('on', x === b)); },
  unk: b => { GF.unk = !GF.unk; b.classList.toggle('on', GF.unk); $('#fDate').disabled = GF.unk; },
  took: b => { GF.took = b.dataset.v === '1'; $$('[data-act="took"]').forEach(x => x.classList.toggle('on', x === b)); placeUl(b.closest('.sub')); $('#scoreBox').innerHTML = GF.took ? scoreHTML() : ''; },
  grade: () => {
    const G = ['高一', '高二', '高三', '大一', '大二', '大三', '大四', '研究生', '已工作'];
    openSheet('当前年级', G.map(g => `<button class="srow ${g === GF.grade ? 'on' : ''}" data-act="gradePick" data-v="${g}">${g}${g === GF.grade ? ic('check', 20, 2.4) : ''}</button>`).join(''));
  },
  gradePick: b => { GF.grade = b.dataset.v; $('#gradeV').textContent = GF.grade; closeSheet(); },
  saveGoal: () => {
    S.target = GF.target; S.examDate = GF.examDate; S.examUnknown = GF.unk; S.took = GF.took; S.grade = GF.grade; S.scores = GF.scores;
    popSub(); rerender('me', 'study'); toast('已保存目标与权益');
  },
  useCard: () => { S.cards -= 1; closeSheet(); rerender('study', 'me'); toast(`已使用 1 张补签卡，${S.streak} 天连胜已保住`); },
  noCard: () => { S.streak = 0; closeSheet(); rerender('study', 'me'); toast('连胜已归 0，今天学一讲重新点亮'); }
};
phone.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const f = ACT[b.dataset.act]; if (f) { e.preventDefault(); f(b); }
});
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (sheet.classList.contains('on')) closeSheet(); else if (subs.length) popSub(); });

/* ---------- 桌面演示控制 ---------- */
$('#demo').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset.demo;
  $$('#demo button').forEach(x => x.classList.toggle('on', x === b && ['normal', 'claim', 'freeze'].includes(d)));
  closeSheet();
  if (d === 'normal') { popAll(); const keep = S.cur; S = DEF(); S.cur = keep; rerender('study', 'course', 'me'); switchTab('study'); $('#v-study').scrollTo({ top: 0, behavior: 'smooth' }); toast('已恢复默认：连胜 9 天'); }
  if (d === 'claim') { popAll(); S.streak = Math.max(S.streak, 14); S.mileSel = 14; S.claimed[14] = 0; rerender('study', 'me'); const v = switchTab('study'); setTimeout(() => scrollToEl(v, $('#mile'), 160), 200); }
  if (d === 'freeze') { popAll(); const v = switchTab('study'); v.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(freezeFlow, 300); }
  if (d === 'lesson') { popAll(); switchTab('study'); setTimeout(() => openLesson(S.cur, curW(S.cur)), 200); }
  if (d === 'goal') { popAll(); switchTab('me'); setTimeout(openGoal, 200); }
});

/* ---------- 适配缩放 ---------- */
function scale() { return parseFloat(phone.style.getPropertyValue('--k')) || 1; }
function fit() { phone.style.setProperty('--k', innerWidth <= 460 ? 1 : Math.min(1, (innerHeight - 48) / 874)); }
addEventListener('resize', fit); fit();

/* ---------- 启动 ---------- */
show('study'); placeUl($('#v-study'));
if (document.fonts) document.fonts.ready.then(() => { placeUl($('#v-' + curTab)); subs.forEach(placeUl); });
window.__IY = { switchTab, openLesson, openGoal, setPos, freezeFlow, ACT, S: () => S, pushSub, couponsHTML, ordersHTML, mocksHTML, lockSheet, claimSheet, finishSheet, rulesSheet, pcSheet, popAll, closeSheet };
})();
