// 使い方:  node build.js
// data/jobs.json（fetch-jobs.js が書き出す）と _media/（記事原稿）から次のページを作り直します。
//   index.html（LP）／jobs/index.html（案件一覧）／job/<案件番号>/index.html（案件ページ）
//   privacy.html（個人情報の取り扱い）／404.html／sitemap.xml／robots.txt
// 外部ライブラリなし。CSS は assets/site.css。
//
// ★ 載せないもの: 掲載単価・掲載企業・媒体名・手数料。出力に紛れたら NG_WORDS で止まります。

const fs = require('fs'), path = require('path');
const dir = __dirname;

const SITE_URL  = 'https://freelance.agent-best.net';
const SITE_NAME = 'エージェントベストジョブ フリーランス';
const GA_ID     = 'G-1XXMP8Y1B4';
const FORM_URL  = 'https://airtable.com/appYkc36EvioYoL1A/pag6CZC4uJmxUcrXT/form'; // ご登録フォーム（スキルシート・希望条件）→ 求職者（フリーランス）tblDp1w31rRtbgOyc
const LINE_URL  = 'https://line.me/R/ti/p/@697nxhbt?oat_content=url&ts=08302134'; // LINE公式アカウント
const TALK_URL  = 'https://calendly.com/r_matsuoka';
const PRIVACY_URL = '/privacy.html';
// 職種別・勤務地別の一覧／気になる案件（/mypage/）／応募・相談フォームは jobs-pages.js
const jobsPages = require('./jobs-pages.js');
const { inquiryUrl } = jobsPages;

// 職種カテゴリ（Airtable の選択肢と同じ名前）
const CATEGORIES = [
  'PM・PMO', 'ITコンサル', '業務・戦略コンサル', 'SAP・ERP', '開発（バックエンド）', '開発（フロントエンド）',
  'インフラ・クラウド', 'データ・AI', 'セキュリティ', 'QA・テスト', 'その他'
];

// 出力に出てはいけない語（媒体名・社内の値）
const NG_WORDS = ['WhiteBox', 'ホワイトボックス', 'チョータツ', 'アサインナビ', 'assign-navi', '掲載単価', '掲載企業', '商流', 'マージン', '手数料', '（非公開）'];
// メディア記事は一般論として「手数料」「商流」などを説明するので、媒体名と社内の値だけを止める
const MEDIA_NG_WORDS = ['WhiteBox', 'ホワイトボックス', 'チョータツ', 'アサインナビ', 'assign-navi', '掲載単価', '掲載企業', '（非公開）'];

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
<meta property="og:image" content="${SITE_URL}/assets/ogp.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}/assets/ogp.png">
<meta name="theme-color" content="#1E3A5F">
<link rel="icon" href="/assets/favicon.ico">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/site.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');
document.addEventListener('click',e=>{const a=e.target.closest('[data-line-cta]');if(a)gtag('event','line_add_friend',{placement:a.dataset.lineCta,page_path:location.pathname});});</script>
</head>
<body>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/"><img src="/assets/mark.png" alt="" width="28" height="28"><span>${SITE_NAME}<small>フリーランスのエンジニア・コンサル向け案件紹介</small></span></a>
    <nav class="head-nav" aria-label="メニュー">
      <a class="link" href="/jobs/">案件を探す</a>
      <a class="link" href="/media/">お役立ち記事</a>
      <a class="link keep" href="/mypage/" aria-label="気になる案件">☆ 気になる<span class="fav-count" data-fav-count hidden></span></a>
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
      <a href="/media/">お役立ち記事</a>
      <a href="${FORM_URL}" target="_blank" rel="noopener">ご登録（スキルシート・ご希望の条件）</a>
      <a href="${LINE_URL}" target="_blank" rel="noopener" data-line-cta="footer">LINEで相談する</a>
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
<script src="/assets/fav.js" defer></script>
</body>
</html>
`;
}

// カード全体がリンク（.job-link::after で広げる）。「気になる」ボタンだけは別に押せる
function jobCard(j){
  return `<div class="card job-card">
  <a class="job-link" href="${jobPath(j)}"><h3>${esc(j.title)}</h3></a>
  <div class="pay">${esc(payText(j))}<small> / 月（お受け取り額の目安）</small></div>
  <ul class="tags">${tagList(j).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
  <button type="button" class="fav-btn" data-fav="${esc(jobNo(j))}">☆ 気になる</button>
</div>`;
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
    ['契約の形はどうなりますか？', '当社とフリーランスの方との業務委託契約（準委任）です。ご登録の時点では契約は発生しません。ご参画が決まった時点で、当社と契約を結びます。'],
    ['報酬の支払いはいつですか？', '支払期日などの取引条件は、参画が決まった案件ごとに、個別契約で書面（メール）にてお示しします。'],
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
    <form class="hero-search" action="/jobs/" method="get" role="search">
      <label class="sr-only" for="hq">キーワード</label>
      <input id="hq" name="q" type="search" placeholder="キーワード（例：PMO、SAP、AWS）">
      <label class="sr-only" for="hcat">職種</label>
      <select id="hcat" name="cat"><option value="">職種すべて</option>${CATEGORIES.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
      <button class="btn btn-primary" type="submit">案件を探す</button>
    </form>
    <div class="quick-links">
      <a href="/jobs/area/remote/">フルリモート</a><a href="/jobs/area/part-time/">週3日以下</a><a href="/jobs/?pay=100">月100万円以上</a><a href="/jobs/c/pm-pmo/">PM・PMO</a><a href="/jobs/c/sap-erp/">SAP・ERP</a>
    </div>
    <div class="cta-row" style="margin-top:20px">
      <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
      <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener" data-line-cta="lp-hero">LINEで相談する</a>
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
      <div class="card"><span class="num">2</span><h3>取引先と支払条件を確かめる</h3><p>取引先の会社の実態を確かめたうえで、案件をご案内します。</p></div>
      <div class="card"><span class="num">3</span><h3>契約の条件をはっきり示す</h3><p>業務の範囲・報酬・支払期日・契約期間を個別契約に書いてお渡しします。フリーランス新法に沿った契約です。</p></div>
      <div class="card"><span class="num">4</span><h3>正社員の選択肢も一緒に</h3><p>人材紹介の許可を持つ会社なので、業務委託と正社員の両方を比べてご相談いただけます。</p></div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>職種から探す</h2>
    <p class="sub">エンジニアとコンサル、どちらの案件もご紹介しています。</p>
    <div class="cat-list">
      ${jobsPages.CAT_PAGES.filter(([c]) => c !== 'その他').map(([c, s]) => `<a class="cat" href="/jobs/c/${s}/">${esc(c)}${counts[c] ? `（${counts[c]}）` : ''}</a>`).join('\n      ')}
    </div>
    <h2 style="margin-top:36px">勤務地・働き方から探す</h2>
    <p class="sub">リモートや週3日からの案件、地域ごとの案件をまとめています。</p>
    <div class="cat-list">
      ${jobsPages.PLACE_PAGES.map(p => { const n = jobs.filter(p.test).length; return `<a class="cat" href="/jobs/area/${p.slug}/">${esc(p.name)}${n ? `（${n}）` : ''}</a>`; }).join('\n      ')}
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
    <p class="sub">ご登録から参画まで、メールかLINEで進められます。</p>
    <div class="steps">
      <div class="card"><span class="num">1</span><h3>ご登録</h3><p>フォームに、スキルシートとご希望の条件をご入力ください（約5分）。</p></div>
      <div class="card"><span class="num">2</span><h3>メールかLINEでご連絡</h3><p>ご登録内容を確認し、ご希望の方法（メールまたはLINE）でご連絡します。</p></div>
      <div class="card"><span class="num">3</span><h3>案件のご案内</h3><p>条件に合う案件をご案内します。気になる案件だけお返事ください。</p></div>
      <div class="card"><span class="num">4</span><h3>提案・面談</h3><p>ご了承いただいた案件だけを企業に提案し、面談の日程を調整します。</p></div>
      <div class="card"><span class="num">5</span><h3>契約・参画</h3><p>当社と業務委託契約を結び、参画が始まります。</p></div>
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
      <p>ご登録は無料です。まず話を聞いてみたい方は、オンライン面談のご予約やLINEでのご相談もできます。</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
        <a class="btn btn-ghost" href="${TALK_URL}" target="_blank" rel="noopener">面談を予約する</a>
        <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener" data-line-cta="lp-cta">LINEで相談する</a>
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
    u: jobPath(j), n: jobNo(j), t: j.title, c: j.categories || [], p: payText(j),
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
  <div class="block-sub">
    <h2 class="mini-h">職種から探す</h2>
    <div class="cat-list">${jobsPages.CAT_PAGES.map(([c, s]) => `<a class="cat" href="/jobs/c/${s}/">${esc(c)}</a>`).join('')}</div>
    <h2 class="mini-h">勤務地・働き方から探す</h2>
    <div class="cat-list">${jobsPages.PLACE_PAGES.map(p => `<a class="cat" href="/jobs/area/${p.slug}/">${esc(p.name)}</a>`).join('')}</div>
  </div>
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
  $('list').innerHTML = hit.map(j => '<div class="card job-card"><a class="job-link" href="' + j.u + '"><h3>' + esc(j.t) + '</h3></a><div class="pay">' + esc(j.p) +
    '<small> / 月（お受け取り額の目安）</small></div><ul class="tags">' + [...j.c, j.r, j.d, j.a].filter(Boolean).map(t => '<li>' + esc(t) + '</li>').join('') +
    '</ul><button type="button" class="fav-btn" data-fav="' + esc(j.n) + '">☆ 気になる</button></div>').join('');
  $('empty').hidden = hit.length > 0;
  document.dispatchEvent(new Event('fav-sync'));
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
  const applyUrl = inquiryUrl({kind: 'この案件に応募したい', jobs: jobNo(j), from: '案件ページ'});
  const askUrl = inquiryUrl({kind: 'まず話を聞きたい・条件を確認したい', jobs: jobNo(j), from: '案件ページ'});
  const cats = j.categories || [];
  const related = jobs.filter(o => o !== j && (o.categories || []).some(c => cats.includes(c))).slice(0, 4);
  const section = (h, v) => v ? `<h2 style="font-size:19px;margin:28px 0 8px">${h}</h2><div class="card"><p class="body-text">${esc(v)}</p></div>` : '';
  const html = head({
    title: `${j.title}｜フリーランス案件｜${SITE_NAME}`,
    desc: `${j.title}（${payText(j)}/月の目安${j.remote ? '・' + j.remote : ''}${j.days ? '・' + j.days : ''}）。フリーランスのエンジニア・コンサル向け業務委託案件。`,
    canonical: jobPath(j)
  }) + `<main class="wrap narrow">
  <p class="crumbs"><a href="/">トップ</a> › <a href="/jobs/">案件を探す</a> › ${esc(jobNo(j))}</p>
  <div class="job-head" data-view-job="${esc(jobNo(j))}">
    <span class="eyebrow">案件番号 ${esc(jobNo(j))}</span>
    <h1>${esc(j.title)}</h1>
    <div class="pay" style="font-size:20px">${esc(payText(j))}<small> / 月（お受け取り額の目安）</small></div>
    <div class="cta-row" style="margin-top:14px">
      <a class="btn btn-primary" href="${esc(applyUrl)}" target="_blank" rel="noopener">この案件に応募・相談する</a>
      <button type="button" class="btn btn-ghost fav-btn-lg" data-fav="${esc(jobNo(j))}">☆ 気になる</button>
    </div>
  </div>
  <table class="spec"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
  ${section('業務内容', j.content)}
  ${section('必須のご経験・スキル', j.must)}
  ${section('歓迎するご経験・スキル', j.welcome)}
  <div class="cta-band">
    <h2>この案件が気になる方へ</h2>
    <p>応募・ご相談は約2分で送れます。案件番号 ${esc(jobNo(j))} は自動で入ります。お返事はメールかLINEでお送りし、ご本人の了承なく企業へ経歴を出すことはありません。</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${esc(applyUrl)}" target="_blank" rel="noopener">この案件に応募・相談する</a>
      <a class="btn btn-ghost" href="${esc(askUrl)}" target="_blank" rel="noopener">条件を確認したい</a>
      <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener" data-line-cta="job">LINEで相談する</a>
    </div>
  </div>
  <p class="note" style="margin-top:16px">募集状況は日々変わります。掲載中でも募集が終わっている場合があります。</p>
  ${related.length ? `<h2 style="font-size:19px;margin:36px 0 12px">似た案件</h2><div class="grid g2">${related.map(jobCard).join('\n')}</div>` : ''}
  <p style="margin-top:20px">${(j.categories || []).map(c => `<a class="cat" href="${jobsPages.catPath(c)}">${esc(c)}の案件一覧</a>`).join(' ')}</p>
</main>
` + foot();
  write(`job/${jobNo(j)}/index.html`, html);
}

/* ---------- 個人情報の取り扱い（privacy.html） ---------- */
// 人材紹介用（jobs.agent-best.net/privacy.html）とは別建て。当社が業務委託の契約当事者になる前提で書く
function buildPrivacy(){
  const sec = (h, body) => `<h2 style="font-size:19px;margin:32px 0 8px">${h}</h2>${body}`;
  const ul = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const html = head({
    title: `個人情報の取り扱い｜${SITE_NAME}`,
    desc: `${SITE_NAME}（フリーランス案件の紹介）における個人情報の取り扱いについて。`,
    canonical: '/privacy.html'
  }) + `<main class="wrap narrow">
  <p class="crumbs"><a href="/">トップ</a> › 個人情報の取り扱い</p>
  <h1 style="font-size:clamp(22px,3.6vw,30px);margin:4px 0 12px">個人情報の取り扱い</h1>
  <p class="note">フリーランス（業務委託）案件の紹介サービス／制定日：2026年10月29日</p>
  <p>株式会社エージェントベスト（以下「当社」）は、当社が運営する「${SITE_NAME}」（以下「本サイト」）および、フリーランスの方に業務委託の案件をご紹介するサービス（以下「本サービス」）の提供にあたり、お預かりする個人情報を以下の方針に基づいて取り扱います。</p>
  <div class="card"><p>本サービスでは、<strong>当社がフリーランスの方と業務委託契約を結び、当社が取引先（案件の発注元）と契約する</strong>形で案件をご紹介します。正社員への転職のご相談（人材紹介）における取り扱いは、<a href="https://jobs.agent-best.net/privacy.html">人材紹介サービスのプライバシーポリシー</a>をご覧ください。両方のサービスをご利用の場合は、両方が適用されます。</p></div>
  ${sec('1. 事業者情報', `<div class="card company"><dl>
    <dt>事業者名</dt><dd>株式会社エージェントベスト</dd>
    <dt>所在地</dt><dd>東京都港区六本木4-8-7 嶋田ビル5階</dd>
    <dt>お問い合わせ</dt><dd><a href="https://www.agent-best.net/contact">www.agent-best.net/contact</a></dd>
  </dl></div>`)}
  ${sec('2. 取得する個人情報', `<p>ご登録フォーム、メール、ご面談などを通じて、次の情報を取得します。</p>` + ul([
    '氏名、住所、屋号（任意）、メールアドレス、電話番号',
    'スキルシート・経歴書その他ご提出いただく書類に記載された情報（職歴・経験したプロジェクト・保有スキル・資格等）',
    '案件に関するご希望（稼働日数、リモートの可否、金額、開始時期など）',
    '事業形態、適格請求書発行事業者の登録番号など、契約と支払いに必要な情報',
    'ご紹介した案件、企業への提案・面談・参画の履歴',
    'ご相談の内容、当社担当者とのやりとりの記録（メール・LINEでのやりとりを含みます）',
    'LINEでのご連絡をご希望の場合は、LINEの表示名'
  ]))}
  ${sec('3. 利用目的', ul([
    'ご経験・ご希望に合う案件のご紹介、ご相談への対応、面談の日程調整',
    'ご本人の了承を得た案件の取引先への提案',
    '業務委託契約（基本契約・個別契約）の締結と履行、報酬のお支払い、請求書の受領など取引に必要な事務',
    '参画中のフォローアップ、契約更新・終了に関するご連絡',
    'サービス品質の向上、統計的な分析（個人を特定しない形で行います）'
  ]) + `<p>取得した個人情報は、上記の目的の範囲を超えて利用しません。</p>`)}
  ${sec('4. 収集しない情報', `<p>業務の目的の達成に必要な範囲内でのみ個人情報を収集し、次の情報は、特別な業務上の必要があり、ご本人の同意を得た場合を除いて収集しません。</p>` + ul([
    '人種、民族、社会的身分、門地、本籍、出生地その他社会的差別の原因となるおそれのある事項',
    '思想および信条',
    '労働組合への加入状況'
  ]))}
  ${sec('5. 取引先への提供について', `<p>案件ごとに内容をご案内し、<strong>ご本人の了承を得た案件の取引先に限り</strong>、提案に必要な範囲で経歴等を提供します。提案の段階では、氏名・連絡先など個人を特定できる情報を伏せた経歴でお伝えします。面談や参画が決まり、取引先との手続きに必要な場合は、その都度ご本人の了承を得て氏名等をお伝えします。ご了承のない取引先へ情報を提供することはありません。</p>`)}
  ${sec('6. 業務委託・外部サービスの利用', `<p>個人情報の保管および業務の遂行にあたり、当社は外部のクラウドサービス（顧客管理、メール、フォーム、日程調整、ファイル保管、社内通知等）を利用します。委託先の選定にあたっては安全管理体制を確認し、契約により個人情報の適正な取り扱いを義務付けます。</p>`)}
  ${sec('7. 保管期間', `<p>契約に関する記録は、法令で定められた期間保管します。それ以外の情報は、ご相談・参画の終了後も、再度のご紹介や重複した提案の防止のため一定期間保管し、必要がなくなった情報は適切に削除します。削除をご希望の場合は、いつでもお申し出いただけます（第9項）。</p>`)}
  ${sec('8. 安全管理措置', `<p>個人情報への不正アクセス、紛失、破壊、改ざん、漏えいを防止するため、アクセス権限の管理、通信の暗号化、取扱担当者の限定等の措置を講じます。</p>`)}
  ${sec('9. 開示・訂正・削除、ご案内の停止', `<p>ご本人からのお申し出により、個人情報の開示、訂正、追加、削除、利用停止に対応します。案件のご案内の停止も同様に受け付けます。お問い合わせ窓口（第1項）または担当者へご連絡ください。ご本人であることを確認のうえ、速やかに対応します。</p>`)}
  ${sec('10. Cookie・アクセス解析', `<p>本サイトでは、サービス改善のためGoogle社の提供する「Google アナリティクス」を利用しています。同ツールはCookieを利用して匿名の利用情報（閲覧したページ、滞在時間、参照元、利用端末の種類など）を収集します。氏名やメールアドレスなど個人を特定する情報は含まれません。Cookieの利用は、ご利用のブラウザの設定で拒否することができます。</p>`)}
  ${sec('11. 本ポリシーの変更', `<p>法令の改正やサービス内容の変更に応じて、本ポリシーを改定する場合があります。重要な変更を行う場合は本サイト上でお知らせします。</p>`)}
</main>
` + foot();
  write('privacy.html', html);
}

/* ---------- 404・sitemap・robots ---------- */
function buildMisc(){
  write('404.html', head({title: `ページが見つかりません｜${SITE_NAME}`, desc: 'ページが見つかりません。', robots: 'noindex'}) +
    `<main class="wrap narrow" style="padding:64px 16px;text-align:center"><h1 style="font-size:24px">ページが見つかりません</h1>
<p>募集が終わった案件か、URLが変わった可能性があります。</p>
<div class="cta-row" style="justify-content:center"><a class="btn btn-primary" href="/jobs/">案件を探す</a><a class="btn btn-ghost" href="/">トップへ</a></div></main>
` + foot());
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/jobs/', '/privacy.html', ...listUrls, ...jobs.map(jobPath), ...mediaUrls];
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
  const ng = rel.startsWith('media/') ? MEDIA_NG_WORDS : NG_WORDS;
  const hit = ng.filter(w => content.includes(w));
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
buildPrivacy();
jobs.forEach(buildJob);
const mediaUrls = require('./media.js')({dir, SITE_URL, SITE_NAME, FORM_URL, TALK_URL, esc, head, foot, write});
const listUrls = jobsPages({jobs, SITE_NAME, FORM_URL, LINE_URL, esc, head, foot, write, jobCard, jobNo, jobPath, payText, EMPTY_HTML}).urls;
buildMisc();
console.log(`案件 ${jobs.length} 件で ${written.length} ファイルを書き出しました。`);
