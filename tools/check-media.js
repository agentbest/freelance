// 使い方: node tools/check-media.js [slug ...]
// _media/articles/*.md を _media/RULES.md のルールで検査する。警告が1件でもあれば終了コード1。
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '_media');
const tax = JSON.parse(fs.readFileSync(path.join(root, 'taxonomy.json'), 'utf8'));
const hubs = new Set(tax.groups.flatMap(g => g.hubs.map(h => h[0])));
const plan = Object.fromEntries(fs.readFileSync(path.join(root, 'plan.tsv'), 'utf8').trim().split('\n').slice(1)
  .map(l => l.split('\t')).map(([no, hub, slug, title]) => [slug, {hub, title}]));

// 制度の数字を扱うハブは、公的な出典を必須にする
const NEED_SOURCES = new Set(['contract', 'law', 'tax', 'invoice', 'social-insurance', 'incorporation', 'savings', 'independence', 'side-job', 'industry', 'certification']);
const NG = [
  [/(?<!「)必ず(?!しも|ご確認|確認|ご相談)/, '「必ず」（「必ずしも」「必ずご確認ください」は可）'],
  [/確実に/, '「確実に」'], [/絶対(?!に避け)/, '「絶対」'], [/圧倒的/, '「圧倒的」'],
  [/ではないでしょうか/, '「〜ではないでしょうか」'], [/いかがでしょうか/, '「いかがでしょうか」'],
  [/WhiteBox|ホワイトボックス|チョータツ|アサインナビ|assign-?navi/i, '案件媒体の名前'],
  [/レバテック|ITプロパートナーズ|Midworks|ミッドワークス|PE-BANK|ギークスジョブ|フリーランスボード|ハイパフォーマー|HiPro|ビズリーチ|クラウドワークス|ランサーズ|ココナラ|フォスターフリーランス|テクフリ|ポテパン|Workship|SOKUDAN/i, '他社サービスの名前'],
  [/当社の手数料|弊社の手数料|手数料は\d|支払サイトは\d|翌々月/, '当社の手数料・支払条件'],
];

const targets = process.argv.slice(2);
const dir = path.join(root, 'articles');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && (!targets.length || targets.includes(f.replace(/\.md$/, ''))));
let warn = 0;
for(const f of files){
  const slug = f.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
  const msgs = [];
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!m){ console.log(`✖ ${slug}: frontmatter がない`); warn++; continue; }
  const fm = {};
  for(const line of m[1].split('\n')){
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if(kv) fm[kv[1]] = kv[2].trim();
  }
  const body = m[2];
  const parse = k => { try{ return JSON.parse(fm[k] || '[]'); }catch(e){ msgs.push(`${k} が JSON として読めない`); return []; } };
  const sources = parse('sources'), tags = parse('tags'); parse('related');
  if(!plan[slug]) msgs.push('plan.tsv にない slug');
  else if(plan[slug].hub !== fm.hub) msgs.push(`hub が plan.tsv（${plan[slug].hub}）と違う`);
  if(!hubs.has(fm.hub)) msgs.push(`taxonomy.json にない hub: ${fm.hub}`);
  for(const k of ['title', 'description', 'pubDate']) if(!fm[k]) msgs.push(`${k} がない`);
  const dl = (fm.description || '').length;
  if(dl < 60 || dl > 140) msgs.push(`description の長さ ${dl}字（60〜140字）`);
  if(!tags.length) msgs.push('tags が空');
  if(/^#\s/m.test(body)) msgs.push('本文に H1（# 見出し）がある');
  const views = (body.match(/^:::view/gm) || []).length;
  if(views < 2) msgs.push(`エージェントベストの見解（:::view）が ${views} 箇所（2箇所必要）`);
  const opens = (body.match(/^:::\w+/gm) || []).length, closes = (body.match(/^:::\s*$/gm) || []).length;
  if(opens !== closes) msgs.push(`::: の開きと閉じの数が合わない（${opens}/${closes}）`);
  const faqIdx = body.search(/^## よくある(ご)?質問/m);
  if(faqIdx < 0) msgs.push('「## よくある質問」がない');
  else if((body.slice(faqIdx).match(/^### /gm) || []).length < 3) msgs.push('よくある質問の ### が3つ未満');
  const toha = body.split('\n').find(l => /^## [^｜|？?]{1,20}とは(\s|$|｜|\|)/.test(l));
  if(toha) msgs.push(`H2 が「〜とは」で始まる: ${toha}`);
  const len = body.replace(/^:::.*$/gm, '').replace(/[#|*\-\s>`]/g, '').length;
  if(len < 3500) msgs.push(`本文が短い（約${len}字・3,500字以上）`);
  if(NEED_SOURCES.has(fm.hub) && !sources.length) msgs.push('sources が空（制度を扱うハブは公的な出典が必要）');
  for(const s of sources) if(!s.t || !/^https:\/\//.test(s.u || '')) msgs.push(`sources の形が不正: ${JSON.stringify(s)}`);
  const text = m[1] + '\n' + body;
  for(const [re, label] of NG){ const hit = text.match(re); if(hit) msgs.push(`使わない表現: ${label}（…${text.slice(Math.max(0, hit.index - 10), hit.index + 15).replace(/\n/g, ' ')}…）`); }
  if(msgs.length){ warn += msgs.length; console.log(`✖ ${slug}\n  - ${msgs.join('\n  - ')}`); }
  else console.log(`✓ ${slug}（約${len}字）`);
}
console.log(`\n${files.length} 本を検査、警告 ${warn} 件`);
process.exit(warn ? 1 : 0);
