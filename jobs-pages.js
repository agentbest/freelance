// 案件サイトの追加ページ：職種別・勤務地/働き方別の一覧、気になる案件（マイページ）、応募・相談フォームへのリンク
// build.js から呼ぶ。出力は build.js の write() を通すので NG_WORDS の確認がかかる。

// 応募・相談フォーム（Airtable）→ 求職者（フリーランス）tblDp1w31rRtbgOyc
const INQUIRY_URL = 'https://airtable.com/appYkc36EvioYoL1A/paglrk4YsAU4rkius/form';
// prefill に使う Airtable の列名（列名を変えたらここも直す）
const INQ_FIELDS = { kind: 'お問い合わせの種類', jobs: '気になる案件（案件番号）', from: '流入フォーム' };

function inquiryUrl({kind, jobs, from}){
  const q = [];
  if(kind) q.push(`prefill_${encodeURIComponent(INQ_FIELDS.kind)}=${encodeURIComponent(kind)}`);
  if(jobs) q.push(`prefill_${encodeURIComponent(INQ_FIELDS.jobs)}=${encodeURIComponent(jobs)}`);
  q.push(`prefill_${encodeURIComponent(INQ_FIELDS.from)}=${encodeURIComponent(from || 'サイト')}`);
  q.push(`hide_${encodeURIComponent(INQ_FIELDS.from)}=true`);
  return `${INQUIRY_URL}?${q.join('&')}`;
}

// 職種カテゴリ（Airtable の選択肢名）→ URL と紹介文
const CAT_PAGES = [
  ['PM・PMO', 'pm-pmo', 'システム導入・業務改革プロジェクトのPM・PMO案件です。進捗・課題管理、ベンダーコントロール、会議体の運営などを担います。'],
  ['ITコンサル', 'it-consultant', 'IT戦略・システム構想・要件定義・ベンダー選定など、上流工程を支援するITコンサルタントの案件です。'],
  ['業務・戦略コンサル', 'strategy-consultant', '事業戦略・新規事業・業務改革（BPR）・組織改革などを支援するコンサルタントの案件です。'],
  ['SAP・ERP', 'sap-erp', 'SAP（S/4HANA）をはじめとするERPの導入・移行・保守の案件です。FI/CO・SD・MMなどのモジュール担当やPMOがあります。'],
  ['開発（バックエンド）', 'backend', 'Java・Go・Python・PHP・Rubyなどを使うサーバーサイド開発・API開発の案件です。'],
  ['開発（フロントエンド）', 'frontend', 'React・Vue.js・TypeScriptなどを使うWebフロントエンド開発の案件です。'],
  ['インフラ・クラウド', 'infra-cloud', 'AWS・Azure・Google Cloudの設計構築、ネットワーク・サーバー、SRE・運用改善の案件です。'],
  ['データ・AI', 'data-ai', 'データ基盤構築、データ分析、機械学習・生成AIの活用支援などの案件です。'],
  ['セキュリティ', 'security', 'セキュリティ診断・対策の立案、CSIRT/SOC、ガバナンス整備などの案件です。'],
  ['QA・テスト', 'qa-test', 'テスト計画・設計・実行、品質管理、テスト自動化などの案件です。'],
  ['その他', 'other', '上記の職種に当てはまらない業務委託案件です。'],
];

// 勤務地・働き方（勤務地は自由記述なので、含まれる語で判定する）
const PLACE_PAGES = [
  {slug: 'remote', name: 'フルリモート', h: 'フルリモートのフリーランス案件', desc: '出社のないフルリモートの業務委託案件です。お住まいの地域を問わずご参画いただけます。', test: j => j.remote === 'フルリモート'},
  {slug: 'part-time', name: '週3日以下', h: '週3日以下で参画できるフリーランス案件', desc: '週1〜3日の稼働で参画できる業務委託案件です。複数案件の掛け持ちや、ご自身の事業との両立に向いています。', test: j => ['週3日', '週2日', '週1日'].includes(j.days)},
  {slug: 'tokyo', name: '東京都', h: '東京都のフリーランス案件', desc: '東京都内に勤務地がある業務委託案件です（一部リモートを含みます）。', test: j => /東京|都内|23区/.test(j.area || '')},
  {slug: 'kanagawa', name: '神奈川県', h: '神奈川県のフリーランス案件', desc: '神奈川県内（横浜・川崎など）に勤務地がある業務委託案件です。', test: j => /神奈川|横浜|川崎/.test(j.area || '')},
  {slug: 'saitama-chiba', name: '埼玉県・千葉県', h: '埼玉県・千葉県のフリーランス案件', desc: '埼玉県・千葉県に勤務地がある業務委託案件です。', test: j => /埼玉|千葉/.test(j.area || '')},
  {slug: 'osaka', name: '大阪府・関西', h: '大阪府・関西のフリーランス案件', desc: '大阪府をはじめ関西に勤務地がある業務委託案件です。', test: j => /大阪|京都|兵庫|神戸|関西/.test(j.area || '')},
  {slug: 'aichi', name: '愛知県・東海', h: '愛知県・東海のフリーランス案件', desc: '愛知県（名古屋）をはじめ東海に勤務地がある業務委託案件です。', test: j => /愛知|名古屋|静岡|岐阜|三重|東海/.test(j.area || '')},
  {slug: 'fukuoka', name: '福岡県・九州', h: '福岡県・九州のフリーランス案件', desc: '福岡県をはじめ九州に勤務地がある業務委託案件です。', test: j => /福岡|九州/.test(j.area || '')},
];

const catPath = name => { const c = CAT_PAGES.find(([n]) => n === name); return c ? `/jobs/c/${c[1]}/` : `/jobs/?cat=${encodeURIComponent(name)}`; };

module.exports = function buildJobsPages({jobs, SITE_NAME, FORM_URL, LINE_URL, esc, head, foot, write, jobCard, jobNo, jobPath, payText, EMPTY_HTML}){
  const urls = [];

  const navChips = (current) => `<div class="block-sub">
    <h2 class="mini-h">職種から探す</h2>
    <div class="cat-list">${CAT_PAGES.map(([n, s]) => `<a class="cat${current === s ? ' on' : ''}" href="/jobs/c/${s}/">${esc(n)}</a>`).join('')}</div>
    <h2 class="mini-h">勤務地・働き方から探す</h2>
    <div class="cat-list">${PLACE_PAGES.map(p => `<a class="cat${current === p.slug ? ' on' : ''}" href="/jobs/area/${p.slug}/">${esc(p.name)}</a>`).join('')}</div>
  </div>`;

  const ctaBand = (from) => `<div class="cta-band">
    <h2>条件に合う案件を、個別にご案内します</h2>
    <p>サイトに載せていない案件もあります。ご登録いただくと、ご経験・ご希望に合う案件をメールかLINEでお送りします。</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
      <a class="btn btn-ghost" href="${esc(inquiryUrl({kind: '似た案件を紹介してほしい', from}))}" target="_blank" rel="noopener">案件について相談する</a>
      <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener" data-line-cta="${esc(from)}">LINEで相談する</a>
    </div>
  </div>`;

  function listPage({path, h1, desc, crumb, hits, current, from}){
    const html = head({
      title: `${h1}${hits.length ? `（${hits.length}件）` : ''}｜${SITE_NAME}`,
      desc: `${desc} お受け取り額の目安・稼働日数・リモート可否を掲載。`,
      canonical: path,
      robots: hits.length ? '' : 'noindex,follow'   // 案件が無いうちは検索に出さない
    }) + `<main class="wrap">
  <p class="crumbs"><a href="/">トップ</a> › <a href="/jobs/">案件を探す</a> › ${esc(crumb)}</p>
  <h1 class="page-title">${esc(h1)}</h1>
  <p class="lead-text">${esc(desc)}</p>
  <p class="result-count">${hits.length ? `${hits.length}件の案件` : ''}</p>
  ${hits.length ? `<div class="grid g2">${hits.map(jobCard).join('\n')}</div>` : EMPTY_HTML}
  ${navChips(current)}
  ${ctaBand(from)}
</main>
` + foot();
    write(`${path.slice(1)}index.html`, html);
    if(hits.length) urls.push(path);
  }

  for(const [name, slug, desc] of CAT_PAGES){
    listPage({path: `/jobs/c/${slug}/`, h1: `${name}のフリーランス案件`, desc, crumb: name,
      hits: jobs.filter(j => (j.categories || []).includes(name)), current: slug, from: `職種:${name}`});
  }
  for(const p of PLACE_PAGES){
    listPage({path: `/jobs/area/${p.slug}/`, h1: p.h, desc: p.desc, crumb: p.name,
      hits: jobs.filter(p.test), current: p.slug, from: `勤務地:${p.name}`});
  }

  /* ---------- 気になる案件（マイページ）。保存はブラウザの localStorage（ログインなし） ---------- */
  const mini = jobs.map(j => ({n: jobNo(j), u: jobPath(j), t: j.title, p: payText(j), g: [...(j.categories || []), j.remote, j.days, j.area].filter(Boolean)}));
  const mypage = head({title: `気になる案件｜${SITE_NAME}`, desc: '保存した案件と、最近見た案件の一覧です。', canonical: '/mypage/', robots: 'noindex,follow'}) + `<main class="wrap">
  <p class="crumbs"><a href="/">トップ</a> › 気になる案件</p>
  <h1 class="page-title">気になる案件</h1>
  <p class="lead-text">案件ページの「☆ 気になる」で保存した案件です。保存はこの端末のブラウザにだけ残ります（ログインは不要です）。</p>
  <div id="fav-actions" class="cta-row" hidden style="margin:8px 0 20px">
    <a class="btn btn-primary" id="fav-inquiry" href="#" target="_blank" rel="noopener">保存した案件についてまとめて相談する</a>
  </div>
  <div class="grid g2" id="fav-list"></div>
  <div id="fav-empty" class="empty" hidden><strong>保存した案件はまだありません</strong>案件一覧や案件ページの「☆ 気になる」を押すと、ここに集まります。<p style="margin-top:12px"><a class="btn btn-ghost" href="/jobs/">案件を探す</a></p></div>
  <h2 class="mini-h" style="margin-top:40px">最近見た案件</h2>
  <div class="grid g2" id="hist-list"></div>
  <p id="hist-empty" class="note" hidden>まだありません。</p>
  ${ctaBand('マイページ')}
</main>
<script>
(function(){
  var JOBS = ${JSON.stringify(mini).replace(/</g, '\\u003c')};
  var BY = {}; JOBS.forEach(function(j){ BY[j.n] = j; });
  var INQ = ${JSON.stringify(inquiryUrl({kind: 'この案件に応募したい', jobs: '__JOBS__', from: 'マイページ'}))};
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function card(n){
    var j = BY[n];
    if(!j) return '<div class="card job-card ended"><h3>' + esc(n) + '</h3><p>募集を終了した案件です。</p><button type="button" class="fav-btn" data-fav="' + esc(n) + '">☆ 気になる</button></div>';
    return '<div class="card job-card"><a class="job-link" href="' + j.u + '"><h3>' + esc(j.t) + '</h3></a><div class="pay">' + esc(j.p) +
      '<small> / 月（お受け取り額の目安）</small></div><ul class="tags">' + j.g.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') +
      '</ul><button type="button" class="fav-btn" data-fav="' + esc(j.n) + '">☆ 気になる</button></div>';
  }
  function render(){
    var f = window.ABF ? ABF.get(ABF.KEY) : [], h = window.ABF ? ABF.get(ABF.HKEY) : [];
    document.getElementById('fav-list').innerHTML = f.map(card).join('');
    document.getElementById('fav-empty').hidden = f.length > 0;
    var live = f.filter(function(n){ return BY[n]; });
    document.getElementById('fav-actions').hidden = live.length === 0;
    document.getElementById('fav-inquiry').href = INQ.replace('__JOBS__', encodeURIComponent(live.join(', ')));
    var hs = h.filter(function(n){ return BY[n]; }).slice(0, 10);
    document.getElementById('hist-list').innerHTML = hs.map(card).join('');
    document.getElementById('hist-empty').hidden = hs.length > 0;
    document.dispatchEvent(new Event('fav-sync'));
  }
  document.addEventListener('fav-change', render);
  document.addEventListener('DOMContentLoaded', render);
})();
</script>
` + foot();
  write('mypage/index.html', mypage);

  return {urls, CAT_PAGES, PLACE_PAGES, catPath, inquiryUrl};
};
module.exports.inquiryUrl = inquiryUrl;
module.exports.CAT_PAGES = CAT_PAGES;
module.exports.PLACE_PAGES = PLACE_PAGES;
module.exports.catPath = catPath;
