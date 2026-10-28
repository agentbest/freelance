// フリーランス向けメディア（/media/）を書き出す。build.js から呼ぶ。
//   原稿: _media/articles/*.md（Jekyll が公開しない _ 始まりのフォルダ）
//   分類: _media/taxonomy.json（グループ → ハブ。ハブを足すときはここに足す）
//   出力: media/index.html／media/hub/<hub>/[<page>/]index.html／media/<slug>/index.html
//         media/search/index.html／media/search.json
// 外部ライブラリなし。Markdown は記事で使う書き方だけを解釈する（見出し・段落・箇条書き・表・引用・強調・リンク・:::view 等）。

const fs = require('fs'), path = require('path');

const PER_PAGE = 30;
const BOX = {
  view: 'エージェントベストの見解',
  point: 'ポイント',
  caution: '注意'
};

module.exports = function buildMedia({dir, SITE_URL, SITE_NAME, FORM_URL, TALK_URL, esc, head, foot, write}){
  const src = path.join(dir, '_media');
  const tax = JSON.parse(fs.readFileSync(path.join(src, 'taxonomy.json'), 'utf8'));
  const HUB = {}; // slug → {label, group}
  tax.groups.forEach(g => g.hubs.forEach(([slug, label]) => { HUB[slug] = {label, group: g.name}; }));

  /* ---------- 原稿の読み込み ---------- */
  const artDir = path.join(src, 'articles');
  const files = fs.existsSync(artDir) ? fs.readdirSync(artDir).filter(f => f.endsWith('.md')) : [];
  const arts = files.map(f => parseArticle(path.join(artDir, f), f.replace(/\.md$/, '')))
    .filter(a => a.status !== 'draft')
    .sort((a, b) => (b.updated || b.pubDate).localeCompare(a.updated || a.pubDate) || a.slug.localeCompare(b.slug));
  const unknown = arts.filter(a => !HUB[a.hub]);
  if(unknown.length){
    console.error(`✖ taxonomy.json にないハブの記事があります: ${unknown.map(a => `${a.slug}（${a.hub}）`).join('、')}`);
    process.exit(1);
  }
  const bySlug = Object.fromEntries(arts.map(a => [a.slug, a]));
  const byHub = {};
  arts.forEach(a => (byHub[a.hub] = byHub[a.hub] || []).push(a));

  fs.rmSync(path.join(dir, 'media'), {recursive: true, force: true});
  const urls = [];
  const artUrl = a => `/media/${a.slug}/`;
  const hubUrl = (h, p = 1) => `/media/hub/${h}/${p > 1 ? p + '/' : ''}`;

  const card = a => `<a class="card art-card" href="${artUrl(a)}">
  <span class="art-hub">${esc(HUB[a.hub].label)}</span>
  <h3>${esc(a.title)}</h3>
  <p>${esc(a.description)}</p>
</a>`;
  const searchBox = `<form class="media-search" action="/media/search/" role="search">
  <input type="search" name="q" placeholder="記事を検索（例：インボイス、PMO 単価、準委任）" aria-label="記事を検索">
  <button class="btn btn-primary btn-sm" type="submit">検索</button>
</form>`;
  const ctaBand = (title = '次の案件探しを、任せてみませんか。') => `<div class="cta-band">
  <h2>${esc(title)}</h2>
  <p>ご登録は無料です。条件に合う案件だけを、ご本人の了承を得てからご提案します。</p>
  <div class="cta-row">
    <a class="btn btn-primary" href="${FORM_URL}" target="_blank" rel="noopener">無料で登録する</a>
    <a class="btn btn-ghost" href="/jobs/">案件を探す</a>
  </div>
</div>`;

  /* ---------- トップ ---------- */
  {
    const groups = tax.groups.map(g => {
      const hubs = g.hubs.map(([h, label]) => `<a class="cat" href="${hubUrl(h)}">${esc(label)}${byHub[h] ? `（${byHub[h].length}）` : ''}</a>`).join('\n        ');
      return `<section class="media-group">
      <h2>${esc(g.name)}</h2>
      <p class="sub">${esc(g.desc)}</p>
      <div class="cat-list">
        ${hubs}
      </div>
    </section>`;
    }).join('\n    ');
    const html = head({
      title: `フリーランスのお役立ち記事｜${SITE_NAME}`,
      desc: 'フリーランスのエンジニア・コンサル向けに、案件の探し方、単価の決まり方、業務委託契約、確定申告・インボイス、社会保険までを解説する記事集です。',
      canonical: '/media/'
    }) + `<main>
<section class="hero media-hero">
  <div class="wrap">
    <span class="eyebrow">フリーランスのエンジニア・コンサルの方へ</span>
    <h1>フリーランスの仕事とお金の<br>「分からない」を、ひとつずつ。</h1>
    <p class="lead">案件の探し方から、契約・税金・社会保険まで。業務委託の案件をご紹介している立場から、実務で役に立つことだけをまとめています。</p>
    ${searchBox}
  </div>
</section>
<div class="wrap">
    ${groups}
  <section class="media-group">
    <h2>新着の記事</h2>
    <div class="grid g2">${arts.slice(0, 12).map(card).join('\n')}</div>
  </section>
  ${ctaBand()}
</div>
</main>
` + foot();
    write('media/index.html', html);
    urls.push('/media/');
  }

  /* ---------- ハブ（ページ送りつき） ---------- */
  for(const [h, info] of Object.entries(HUB)){
    const list = byHub[h] || [];
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    for(let p = 1; p <= pages; p++){
      const items = list.slice((p - 1) * PER_PAGE, p * PER_PAGE);
      const nav = pages > 1 ? `<nav class="pager" aria-label="ページ送り">${Array.from({length: pages}, (_, i) => i + 1)
        .map(n => n === p ? `<span aria-current="page">${n}</span>` : `<a href="${hubUrl(h, n)}">${n}</a>`).join('')}</nav>` : '';
      const html = head({
        title: `${info.label}の記事一覧${p > 1 ? `（${p}ページ目）` : ''}｜フリーランスのお役立ち記事｜${SITE_NAME}`,
        desc: `フリーランス向け「${info.label}」の記事一覧（${list.length}本）。${info.group}に関する実務の疑問をまとめています。`,
        canonical: hubUrl(h, p),
        robots: list.length ? '' : 'noindex'
      }) + `<main class="wrap">
  <p class="crumbs"><a href="/">トップ</a> › <a href="/media/">お役立ち記事</a> › ${esc(info.label)}</p>
  <h1 class="page-title">${esc(info.label)}</h1>
  <p class="note">${esc(info.group)}／${list.length}本の記事</p>
  ${items.length ? `<div class="grid g2">${items.map(card).join('\n')}</div>` : '<div class="empty"><strong>記事を準備しています</strong>公開までしばらくお待ちください。</div>'}
  ${nav}
  ${ctaBand()}
</main>
` + foot();
      write(`media/hub/${h}/${p > 1 ? p + '/' : ''}index.html`, html);
      if(items.length) urls.push(hubUrl(h, p));
    }
  }

  /* ---------- 記事 ---------- */
  for(const a of arts){
    const {html: body, toc, faq} = renderMarkdown(a.body, esc, bySlug);
    const related = [
      ...(a.related || []).map(s => bySlug[s]).filter(Boolean),
      ...(byHub[a.hub] || []).filter(x => x.slug !== a.slug)
    ].filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 6);
    const hub = HUB[a.hub];
    const ld = [{
      '@context': 'https://schema.org', '@type': 'Article',
      headline: a.title, description: a.description,
      datePublished: a.pubDate, dateModified: a.updated || a.pubDate,
      author: {'@type': 'Organization', name: '株式会社エージェントベスト', url: 'https://www.agent-best.net/'},
      publisher: {'@type': 'Organization', name: '株式会社エージェントベスト', logo: {'@type': 'ImageObject', url: `${SITE_URL}/assets/logo.png`}},
      mainEntityOfPage: `${SITE_URL}${artUrl(a)}`
    }, {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'トップ', item: `${SITE_URL}/`},
        {'@type': 'ListItem', position: 2, name: 'お役立ち記事', item: `${SITE_URL}/media/`},
        {'@type': 'ListItem', position: 3, name: hub.label, item: `${SITE_URL}${hubUrl(a.hub)}`},
        {'@type': 'ListItem', position: 4, name: a.title}
      ]
    }];
    if(faq.length) ld.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, ans]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: ans}}))
    });
    const html = head({
      title: `${a.title}｜${SITE_NAME}`,
      desc: a.description,
      canonical: artUrl(a)
    }).replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n</head>`) + `<main class="wrap narrow article">
  <p class="crumbs"><a href="/">トップ</a> › <a href="/media/">お役立ち記事</a> › <a href="${hubUrl(a.hub)}">${esc(hub.label)}</a></p>
  <a class="art-hub" href="${hubUrl(a.hub)}">${esc(hub.label)}</a>
  <h1 class="art-title">${esc(a.title)}</h1>
  <p class="note">公開 ${esc(a.pubDate)}${a.updated && a.updated !== a.pubDate ? `／更新 ${esc(a.updated)}` : ''}　監修：株式会社エージェントベスト</p>
  ${toc.length > 2 ? `<nav class="toc" aria-label="目次"><strong>目次</strong><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></nav>` : ''}
  <div class="art-body">
${body}
  </div>
  ${a.sources && a.sources.length ? `<section class="sources"><h2>参考にした公的情報・資料</h2><ul>${a.sources.map(s => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener nofollow">${esc(s.t)}</a></li>`).join('')}</ul>
  <p class="note">記事の内容は公開日時点の情報にもとづきます。制度や税率は変わることがあるため、手続きの前に必ず各機関の最新情報をご確認ください。</p></section>` : ''}
  ${ctaBand('条件に合う案件だけ、知りたい方へ')}
  ${related.length ? `<section class="related"><h2>あわせて読みたい</h2><div class="grid g2">${related.map(card).join('\n')}</div></section>` : ''}
</main>
` + foot();
    write(`media/${a.slug}/index.html`, html);
    urls.push(artUrl(a));
  }

  /* ---------- 検索 ---------- */
  write('media/search.json', JSON.stringify(arts.map(a => ({
    u: artUrl(a), t: a.title, d: a.description, h: HUB[a.hub].label, k: (a.tags || []).join(' ')
  }))));
  write('media/search/index.html', head({
    title: `記事を検索｜${SITE_NAME}`, desc: 'フリーランス向けのお役立ち記事を検索できます。', canonical: '/media/search/', robots: 'noindex'
  }) + `<main class="wrap narrow">
  <p class="crumbs"><a href="/">トップ</a> › <a href="/media/">お役立ち記事</a> › 検索</p>
  <h1 class="page-title">記事を検索</h1>
  ${searchBox}
  <p class="result-count" id="count"></p>
  <div class="grid" id="list"></div>
</main>
<script>
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q = new URLSearchParams(location.search).get('q') || '';
document.querySelector('.media-search input').value = q;
fetch('/media/search.json').then(r => r.json()).then(all => {
  const words = q.toLowerCase().split(/\\s+/).filter(Boolean);
  const hit = words.length ? all.filter(a => words.every(w => (a.t + ' ' + a.d + ' ' + a.h + ' ' + a.k).toLowerCase().includes(w))) : [];
  document.getElementById('count').textContent = words.length ? '「' + q + '」の記事 ' + hit.length + '本' : 'キーワードを入れて検索してください';
  document.getElementById('list').innerHTML = hit.slice(0, 100).map(a => '<a class="card art-card" href="' + a.u + '"><span class="art-hub">' + esc(a.h) + '</span><h3>' + esc(a.t) + '</h3><p>' + esc(a.d) + '</p></a>').join('');
});
</script>
` + foot());

  console.log(`メディア: 記事 ${arts.length} 本・ハブ ${Object.keys(HUB).length} 件を書き出しました。`);
  return urls;
};

/* ---------- 原稿のパース ---------- */
// frontmatter は「key: value」。配列・オブジェクトは JSON で書く（tags: ["a","b"] / sources: [{"t":"…","u":"…"}]）
function parseArticle(file, slug){
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!m){ console.error(`✖ frontmatter がありません: ${file}`); process.exit(1); }
  const a = {slug, body: m[2]};
  for(const line of m[1].split('\n')){
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if(!kv) continue;
    let v = kv[2].trim();
    if(/^[\[{]/.test(v)){
      try{ v = JSON.parse(v); }catch(e){ console.error(`✖ ${file} の ${kv[1]} が JSON として読めません`); process.exit(1); }
    }else v = v.replace(/^"(.*)"$/, '$1');
    a[kv[1]] = v;
  }
  for(const k of ['title', 'description', 'hub', 'pubDate']){
    if(!a[k]){ console.error(`✖ ${file} に ${k} がありません`); process.exit(1); }
  }
  return a;
}

/* ---------- Markdown（記事で使う範囲だけ） ---------- */
// まだ書かれていない記事へのリンクは、文字だけにする（書かれた時点で自動でリンクになる）
function renderMarkdown(md, esc, bySlug){
  const toc = [], faq = [];
  let n = 0;
  const inline = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      const own = u.match(/^\/media\/([a-z0-9-]+)\/$/);
      if(own && !bySlug[own[1]] && !['search', 'hub'].includes(own[1])) return t;
      const ext = /^https?:/.test(u) && !u.startsWith('https://freelance.agent-best.net');
      return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
    });
  const lines = md.split('\n');
  const out = [];
  let i = 0, inFaq = false, faqQ = null, faqA = [];
  const flushFaq = () => { if(faqQ){ faq.push([faqQ, faqA.join(' ').replace(/<[^>]+>/g, '')]); } faqQ = null; faqA = []; };

  function block(stopAt){
    const html = [];
    while(i < lines.length){
      const line = lines[i];
      if(stopAt && line.trim() === ':::') { i++; break; }
      if(!line.trim()){ i++; continue; }
      let mm;
      if((mm = line.match(/^:::(\w+)\s*(.*)$/))){
        i++;
        const kind = mm[1], label = mm[2] || BOX[kind] || '';
        const inner = block(true);
        html.push(`<aside class="box box-${kind}">${label ? `<p class="box-label">${esc(label)}</p>` : ''}${inner}</aside>`);
        continue;
      }
      if((mm = line.match(/^(#{2,4})\s+(.+)$/))){
        const lv = mm[1].length, text = mm[2].trim();
        i++;
        if(lv === 2){
          flushFaq();
          inFaq = /よくある(ご)?質問|FAQ/.test(text);
          const id = 's' + (++n);
          toc.push([id, text]);
          html.push(`<h2 id="${id}">${inline(text)}</h2>`);
        }else{
          if(inFaq && lv === 3){ flushFaq(); faqQ = text.replace(/^Q[.．:：]?\s*/, ''); }
          html.push(`<h${lv}>${inline(text)}</h${lv}>`);
        }
        continue;
      }
      if(/^\s*[-*]\s+/.test(line)){
        const items = [];
        while(i < lines.length && /^\s*[-*]\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
        html.push(`<ul>${items.map(t => `<li>${inline(t)}</li>`).join('')}</ul>`);
        continue;
      }
      if(/^\s*\d+[.)]\s+/.test(line)){
        const items = [];
        while(i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])){ items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i++; }
        html.push(`<ol>${items.map(t => `<li>${inline(t)}</li>`).join('')}</ol>`);
        continue;
      }
      if(/^\|/.test(line)){
        const rows = [];
        while(i < lines.length && /^\|/.test(lines[i])){ rows.push(lines[i]); i++; }
        const cells = r => r.replace(/^\||\|\s*$/g, '').split('|').map(c => c.trim());
        const hasHead = rows[1] && /^\|?\s*:?-{2,}/.test(rows[1]);
        const headRow = hasHead ? cells(rows[0]) : null;
        const bodyRows = (hasHead ? rows.slice(2) : rows).map(cells);
        html.push(`<div class="table-wrap"><table>${headRow ? `<thead><tr>${headRow.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>` : ''}<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      if(/^>\s?/.test(line)){
        const q = [];
        while(i < lines.length && /^>\s?/.test(lines[i])){ q.push(lines[i].replace(/^>\s?/, '')); i++; }
        html.push(`<blockquote><p>${q.map(inline).join('<br>')}</p></blockquote>`);
        continue;
      }
      // 段落
      const p = [];
      while(i < lines.length && lines[i].trim() && !/^(#{2,4}\s|:::|\s*[-*]\s+|\s*\d+[.)]\s+|\||>)/.test(lines[i])){ p.push(lines[i].trim()); i++; }
      const ph = `<p>${p.map(inline).join('<br>')}</p>`;
      if(inFaq && faqQ) faqA.push(ph);
      html.push(ph);
    }
    return html.join('\n');
  }
  const html = block(false);
  flushFaq();
  return {html, toc, faq};
}
