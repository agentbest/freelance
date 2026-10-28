// 使い方:  node build.js
// data/jobs.json（fetch-jobs.js が書き出す）から次のページを作り直します。
//   index.html（LP）／jobs/index.html（案件一覧）／job/<案件番号>/index.html（案件ページ）
//   404.html／sitemap.xml／robots.txt
// 外部ライブラリなし。CSS は assets/site.css。
//
// ★ 載せないもの: 掲載単価・掲載企業・媒体名・手数料。出力に紛れたら NG_WORDS で止まります。

const fs = require('fs'), path = require('path');
const dir = __dirname;

const SITE_URL  = 'https://freelance.agent-best.net';
const SITE_NAME = 'エージェントベストジョブ フリーランス';
const GA_ID     = 'G-1XXMP8Y1B4';
const FORM_URL  = 'https://docs.google.com/forms/d/1jKmGJwTy8p6wbJYAQxTMe3KUEloejZti8K7VusVPHgc/viewform'; // 業務委託基本契約 同意フォーム
const TALK_URL  = 'https://calendly.com/r_matsuoka';
const PRIVACY_URL = 'https://jobs.agent-best.net/privacy.html';

// 職種カテゴリ（Airtable の選択肢と同じ名前）
const CATEGORIES = [
  'PM・PMO', 'ITコンサル', '業務・戦略コンサル', 'SAP・ERP', '開発（バックエンド）', '開発（フロントエンド）',
  'インフラ・クラウド', 'データ・AI', 'セキュリティ', 'QA・テスト', 'その他'
];

// 出力に出てはいけない語（媒体名・社内の値）
const NG_WORDS = ['WhiteBox', 'ホワイトボックス', 'チョータツ', 'アサインナビ', 'assign-navi', '掲載単価', '掲載企業', '商流', 'マージン', '手数料', '（非公開）'];

const jobs = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'jobs.json'), 'utf8'));

/* ---------- 部品 ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jobNo = j => 'F' + String(j.no).padStart(4, '0');
const jobPath = j => `/job/${jobNo(j)}/`;

function payText(j){
  const a = j.payMin, b = j.payMax;
  if(a && b && a !== b) return `${a}〜${b}万円`;
  if(a || b) return `${a || b}万円`;
  return 'ご経験に応じて調整';
}
function tagList(j){
  const t = [...(j.categories || [])];
  if(j.remote) t.push(j.remote);
  if(j.days) t.push(j.days);
  if(j.area) t.push(j.area);
  return t;
}

function head({title, desc, canonical, robots}){
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${canonical ? `<link rel="canonical" href="${SITE_URL}${canonical}">` : ''}
${robots ? `<meta name="robots" content="${robots}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${canonical ? `<meta property="og:url" content="${SITE_URL}${canonical}">` : ''}
<meta name="theme-color" content="#1E3A5F">
<link rel="icon" href="/assets/favicon.ico">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/site.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>
</head>
<body>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/"><img src="/assets/mark.png" alt="" width="28" height="28"><span>${SITE_NAME}<small>フリーランスのエンジニア・コンサル向け案件紹介</small></span></a>
    <nav class="head-nav" aria-label="メニュー">
      <a class="link" href="/jobs/">案件を探す</a>
      <a class="link" href="/#flow">ご利用の流れ</a>
      <a class="btn btn-primary btn-sm" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録</a>
    </nav>
  </div>
</header>
`;
}

function foot(){
  return `<footer class="site-foot">
  <div class="wrap">
    <strong>${SITE_NAME}</strong>
    <div class="foot-links">
      <a href="/">トップ</a>
      <a href="/jobs/">案件を探す</a>
      <a href="${FORM_URL}" target="_blank" rel="noopener">ご登録（業務委託基本契約への同意）</a>
      <a href="${PRIVACY_URL}">個人情報の取り扱い</a>
      <a href="https://www.agent-best.net/company/">運営会社</a>
    </div>
    <div class="foot-links">
      <a href="https://jobs.agent-best.net/">正社員の求人を探す（エージェントベストジョブ）</a>
      <a href="https://skill.agent-best.net/">エージェントベストジョブ手に職</a>
      <a href="https://www.agent-best.net/">エージェントベスト</a>
    </div>
    <p>運営：株式会社エージェントベスト（有料職業紹介事業 許可番号 13-ユ-316964）<br>〒106-0032 東京都港区六本木4-8-7 嶋田ビル5階</p>
  </div>
</footer>
</body>
</html>
`;
}

function jobCard(j){
  return `<a class="card job-card" href="${jobPath(j)}">
  <h3>${esc(j.title)}</h3>
  <div class="pay">${esc(payText(j))}<small> / 月（お受け取り額の目安）</small></div>
  <ul class="tags">${tagList(j).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
</a>`;
}

const EMPTY_HTML = `<div class="empty"><strong>公開できる案件を準備しています</strong>
ご登録いただいた方には、サイトに載せていない案件も、ご経験・ご希望に合わせて個別にご案内しています。</div>`;

/* ---------- LP（index.html） ---------- */
function buildIndex(){
  const latest = jobs.slice(0, 6);
  const counts = Object.fromEntries(CATEGORIES.map(c => [c, jobs.filter(j => (j.categories || []).includes(c)).length]));
  const faq = [
    ['登録にお金はかかりますか？', 'ご登録・ご利用で、フリーランスの方にお支払いいただく費用はありません。案件をご案内するときは、お受け取りになる金額（月額の目安）でお伝えします。'],
    ['登録すると、経歴がすぐ企業に送られますか？', '送りません。案件ごとに内容をご案内し、ご本人の「応募したい」というお返事をいただいてから、氏名や連絡先を伏せた経歴で企業にご提案します。'],
    ['契約の形はどうなりますか？', '当社とフリーランスの方との業務委託契約（準委任）です。ご登録の際に基本契約へWebで同意いただき、参画が決まった案件ごとに個別契約を結びます。電子署名などのお手間はかかりません。'],
    ['報酬の支払いはいつですか？', '月末締め・翌々月5日払いです。支払期日などの取引条件は、個別契約で書面（メール）にてお示しします。'],
    ['リモートや週3日の案件はありますか？', 'あります。案件ごとに稼働日数・リモート可否を記載しています。ご希望の条件を先に伺い、合う案件だけをご案内します。'],
    ['正社員への転職も相談できますか？', 'できます。運営会社のエージェントベストは人材紹介（有料職業紹介）の許可を持っています。業務委託と正社員の両方を比べながらご相談いただけます。'],
  ];
  const html = head({
    title: `${SITE_NAME}｜フリーランスのエンジニア・コンサル向け案件紹介`,
    desc: 'フリーランスのエンジニア・ITコンサル・PM/PMO向けの業務委託案件をご紹介します。案件ごとにご本人の了承を得てから提案。取引先の信用と支払条件を確かめた案件だけを扱います。',
    canonical: '/'
  }) + `<main>
<section class="hero">
  <div class="wrap">
    <span class="eyebrow">フリーランスのエンジニア・コンサルの方へ</span>
    <h1>条件に合う案件を、<br>ひとつずつ確かめてご紹介します。</h1>
    <p class="lead">PM・PMO、ITコンサル、SAP・ERP、開発・インフラなどの業務委託案件をご案内します。経歴を勝手に出すことはありません。取引先と支払条件を確かめた案件だけを扱います。</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
      <a class="btn btn-ghost" href="/jobs/">案件を探す</a>
    </div>
    <ul class="hero-points"><li>登録・利用は無料</li><li>案件ごとにご本人の了承を得てから提案</li><li>リモート・週3日からの案件も</li></ul>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>こんな方に</h2>
    <p class="sub">独立したばかりの方も、次の案件を探している方も。</p>
    <div class="grid g3">
      <div class="card"><h3>営業に時間を割きたくない</h3><p>案件探しと条件のすり合わせは当社が行います。ご本人は本業に集中できます。</p></div>
      <div class="card"><h3>条件の合う案件だけ知りたい</h3><p>稼働日数・リモート・ご希望の金額を先に伺い、合わない案件は送りません。</p></div>
      <div class="card"><h3>取引先の信用が気になる</h3><p>取引先の会社情報と支払条件を確かめた案件だけをご案内します。</p></div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>エージェントベストの進め方</h2>
    <p class="sub">数を送るより、一件ずつの確かさを大切にしています。</p>
    <div class="grid g2">
      <div class="card"><span class="num">1</span><h3>応募の前に、必ずご本人に確認</h3><p>案件の内容をお伝えし、「応募したい」とお返事をいただいてから提案します。氏名・連絡先は伏せた経歴で出します。</p></div>
      <div class="card"><span class="num">2</span><h3>取引先と支払条件を確かめる</h3><p>取引先の会社の実態や、上流からの支払いの流れを確かめ、支払いが遅れやすい案件は扱いません。</p></div>
      <div class="card"><span class="num">3</span><h3>契約の条件をはっきり示す</h3><p>業務の範囲・報酬・支払期日・契約期間を個別契約に書いてお渡しします。フリーランス新法に沿った契約です。</p></div>
      <div class="card"><span class="num">4</span><h3>正社員の選択肢も一緒に</h3><p>人材紹介の許可を持つ会社なので、業務委託と正社員の両方を比べてご相談いただけます。</p></div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>扱っている案件</h2>
    <p class="sub">エンジニアとコンサル、どちらの案件もご紹介しています。</p>
    <div class="cat-list">
      ${CATEGORIES.filter(c => c !== 'その他').map(c => `<a class="cat" href="/jobs/?cat=${encodeURIComponent(c)}">${esc(c)}${counts[c] ? `（${counts[c]}）` : ''}</a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>新着の案件</h2>
    <p class="sub">金額は、お受け取りになる月額の目安です。</p>
    ${latest.length ? `<div class="grid g2">${latest.map(jobCard).join('\n')}</div>
    <p style="margin-top:20px"><a class="btn btn-ghost" href="/jobs/">すべての案件を見る</a></p>` : EMPTY_HTML}
  </div>
</section>

<section class="block" id="flow">
  <div class="wrap">
    <h2>ご利用の流れ</h2>
    <p class="sub">ご登録から参画まで、メールで進められます。</p>
    <div class="steps">
      <div class="card"><span class="num">1</span><h3>ご登録</h3><p>フォームで業務委託基本契約に同意いただきます（数分で終わります）。</p></div>
      <div class="card"><span class="num">2</span><h3>経歴とご希望の共有</h3><p>スキルシートと、稼働日数・金額などのご希望をメールでお送りください。</p></div>
      <div class="card"><span class="num">3</span><h3>案件のご案内</h3><p>条件に合う案件をメールでご案内します。気になる案件だけお返事ください。</p></div>
      <div class="card"><span class="num">4</span><h3>提案・面談</h3><p>ご了承いただいた案件だけを企業に提案し、面談の日程を調整します。</p></div>
      <div class="card"><span class="num">5</span><h3>契約・参画</h3><p>個別契約にメールで同意いただき、参画が始まります。</p></div>
    </div>
  </div>
</section>

<section class="block faq">
  <div class="wrap narrow">
    <h2>よくあるご質問</h2>
    ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="cta-band">
      <h2>次の案件探しを、任せてみませんか。</h2>
      <p>ご登録は無料です。まず話を聞いてみたい方は、オンライン面談もご予約いただけます。</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
        <a class="btn btn-ghost" href="${TALK_URL}" target="_blank" rel="noopener">面談を予約する</a>
      </div>
    </div>
  </div>
</section>

<section class="block company">
  <div class="wrap narrow">
    <h2>運営会社</h2>
    <div class="card"><dl>
      <dt>会社名</dt><dd>株式会社エージェントベスト</dd>
      <dt>所在地</dt><dd>〒106-0032 東京都港区六本木4-8-7 嶋田ビル5階</dd>
      <dt>代表者</dt><dd>松岡 良次</dd>
      <dt>許可番号</dt><dd>有料職業紹介事業 13-ユ-316964</dd>
      <dt>事業内容</dt><dd>人材紹介、フリーランス（業務委託）案件の紹介、採用支援</dd>
    </dl></div>
  </div>
</section>
</main>
` + foot();
  write('index.html', html);
}

/* ---------- 案件一覧（jobs/index.html） ---------- */
function buildList(){
  // 一覧の絞り込みは JS でする。埋め込むのは公開用の値だけ
  const data = jobs.map(j => ({
    u: jobPath(j), t: j.title, c: j.categories || [], p: payText(j),
    pmin: j.payMin || j.payMax || 0, pmax: j.payMax || j.payMin || 0,
    r: j.remote || '', d: j.days || '', a: j.area || '',
    k: [j.title, j.content, j.must, j.welcome, ...(j.categories || [])].join(' ')
  }));
  const opts = arr => arr.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  const html = head({
    title: `フリーランス案件を探す｜${SITE_NAME}`,
    desc: 'フリーランスのエンジニア・コンサル向け業務委託案件の一覧。職種・リモート・稼働日数・金額で絞り込めます。',
    canonical: '/jobs/'
  }) + `<main class="wrap">
  <p class="crumbs"><a href="/">トップ</a> › 案件を探す</p>
  <h1 style="font-size:clamp(22px,3.6vw,30px);margin:4px 0 16px">フリーランス案件を探す</h1>
  <form class="filters" id="filters" onsubmit="return false">
    <div><label for="q">キーワード</label><input id="q" type="search" placeholder="例：SAP、PMO、AWS"></div>
    <div><label for="cat">職種</label><select id="cat"><option value="">すべて</option>${opts(CATEGORIES)}</select></div>
    <div><label for="remote">リモート</label><select id="remote"><option value="">指定なし</option>${opts(['フルリモート', '一部リモート', '常駐', '応相談'])}</select></div>
    <div><label for="days">稼働日数</label><select id="days"><option value="">指定なし</option>${opts(['週5日', '週4日', '週3日', '週2日', '週1日', '応相談'])}</select></div>
    <div><label for="pay">お受け取り額（月）</label><select id="pay"><option value="">指定なし</option>${[60, 80, 100, 120, 150].map(v => `<option value="${v}">${v}万円以上</option>`).join('')}</select></div>
  </form>
  <p class="result-count" id="count"></p>
  <div class="grid g2" id="list"></div>
  <div id="empty" hidden>${EMPTY_HTML}<p style="text-align:center;margin-top:16px"><a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録して案件の案内を受け取る</a></p></div>
  <p class="note" style="margin-top:24px">金額は、お受け取りになる月額の目安です（消費税・経費の扱いは案件ごとにご案内します）。</p>
</main>
<script>
const JOBS = ${JSON.stringify(data).replace(/</g, '\\u003c')};
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params = new URLSearchParams(location.search);
['q','cat','remote','days','pay'].forEach(k => { if(params.get(k)) $(k).value = params.get(k); });
function render(){
  const q = $('q').value.trim().toLowerCase(), cat = $('cat').value, rm = $('remote').value, dy = $('days').value, pay = +$('pay').value || 0;
  const hit = JOBS.filter(j => (!q || j.k.toLowerCase().includes(q)) && (!cat || j.c.includes(cat)) &&
    (!rm || j.r === rm) && (!dy || j.d === dy) && (!pay || j.pmax >= pay));
  $('count').textContent = JOBS.length ? hit.length + '件の案件' : '';
  $('list').innerHTML = hit.map(j => '<a class="card job-card" href="' + j.u + '"><h3>' + esc(j.t) + '</h3><div class="pay">' + esc(j.p) +
    '<small> / 月（お受け取り額の目安）</small></div><ul class="tags">' + [...j.c, j.r, j.d, j.a].filter(Boolean).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></a>').join('');
  $('empty').hidden = hit.length > 0;
  const sp = new URLSearchParams();
  ['q','cat','remote','days','pay'].forEach(k => { if($(k).value) sp.set(k, $(k).value); });
  history.replaceState(null, '', location.pathname + (sp.toString() ? '?' + sp : ''));
}
['q','cat','remote','days','pay'].forEach(k => $(k).addEventListener('input', render));
render();
</script>
` + foot();
  write('jobs/index.html', html);
}

/* ---------- 案件ページ（job/<番号>/index.html） ---------- */
function buildJob(j){
  const rows = [
    ['お受け取り額の目安（月）', payText(j)],
    ['職種', (j.categories || []).join('、')],
    ['稼働日数', j.days], ['リモート', j.remote], ['勤務地', j.area],
    ['開始時期', j.start], ['期間', j.term], ['年齢の目安', j.age],
    ['契約形態', '業務委託（準委任）・当社との契約'],
  ].filter(([, v]) => v);
  const section = (h, v) => v ? `<h2 style="font-size:19px;margin:28px 0 8px">${h}</h2><div class="card"><p class="body-text">${esc(v)}</p></div>` : '';
  const html = head({
    title: `${j.title}｜フリーランス案件｜${SITE_NAME}`,
    desc: `${j.title}（${payText(j)}/月の目安${j.remote ? '・' + j.remote : ''}${j.days ? '・' + j.days : ''}）。フリーランスのエンジニア・コンサル向け業務委託案件。`,
    canonical: jobPath(j)
  }) + `<main class="wrap narrow">
  <p class="crumbs"><a href="/">トップ</a> › <a href="/jobs/">案件を探す</a> › ${esc(jobNo(j))}</p>
  <div class="job-head">
    <span class="eyebrow">案件番号 ${esc(jobNo(j))}</span>
    <h1>${esc(j.title)}</h1>
    <div class="pay" style="font-size:20px">${esc(payText(j))}<small> / 月（お受け取り額の目安）</small></div>
  </div>
  <table class="spec"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
  ${section('業務内容', j.content)}
  ${section('必須のご経験・スキル', j.must)}
  ${section('歓迎するご経験・スキル', j.welcome)}
  <div class="cta-band">
    <h2>この案件が気になる方へ</h2>
    <p>ご登録のうえ、案件番号 ${esc(jobNo(j))} をお知らせください。ご本人の了承なく企業へ経歴を出すことはありません。</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
      <a class="btn btn-ghost" href="${TALK_URL}" target="_blank" rel="noopener">面談を予約する</a>
    </div>
  </div>
  <p class="note" style="margin-top:16px">募集状況は日々変わります。掲載中でも募集が終わっている場合があります。</p>
</main>
` + foot();
  write(`job/${jobNo(j)}/index.html`, html);
}

/* ---------- 404・sitemap・robots ---------- */
function buildMisc(){
  write('404.html', head({title: `ページが見つかりません｜${SITE_NAME}`, desc: 'ページが見つかりません。', robots: 'noindex'}) +
    `<main class="wrap narrow" style="padding:64px 16px;text-align:center"><h1 style="font-size:24px">ページが見つかりません</h1>
<p>募集が終わった案件か、URLが変わった可能性があります。</p>
<div class="cta-row" style="justify-content:center"><a class="btn btn-primary" href="/jobs/">案件を探す</a><a class="btn btn-ghost" href="/">トップへ</a></div></main>
` + foot());
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/jobs/', ...jobs.map(jobPath)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

/* ---------- 書き出し（NG語の確認つき） ---------- */
const written = [];
function write(rel, content){
  const hit = NG_WORDS.filter(w => content.includes(w));
  if(hit.length){
    console.error(`✖ ${rel} に載せてはいけない語が入っています: ${hit.join('、')}。Airtable の公開用の列を直してください。`);
    process.exit(1);
  }
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, content);
  written.push(rel);
}

// 募集が終わった案件のページを残さないよう、job/ は毎回作り直す
fs.rmSync(path.join(dir, 'job'), {recursive: true, force: true});
buildIndex();
buildList();
jobs.forEach(buildJob);
buildMisc();
console.log(`案件 ${jobs.length} 件で ${written.length} ファイルを書き出しました。`);
