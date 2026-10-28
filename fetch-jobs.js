// 使い方: このフォルダで  node fetch-jobs.js  を実行すると、
// Airtable「フリーランス案件（求人票）」から公開してよい案件だけを取得して data/jobs.json を書き出します。
// そのあと  node build.js  でサイトに反映されます。
//
// ★ このリポジトリは Public です。トークンをこのファイルに書かないでください。
//    トークンは 1) 環境変数 AIRTABLE_TOKEN  2) airtable.local.json（.gitignore 済み）の順で探します。
//
// ★ 「（非公開）」の列（媒体・掲載企業・掲載単価・商流など）は取得しません。
//    下の F に書いた公開用の列だけを fields[] で指定して取りに行きます。列を足すときも公開用だけにすること。

const fs = require('fs'), path = require('path');

const BASE_ID  = 'appYkc36EvioYoL1A';   // base「人材紹介事業」
const TABLE_ID = 'tblHqTQ75OOlbd9ZX';   // table「フリーランス案件（求人票）」
const dir = __dirname;

function findToken(){
  if(process.env.AIRTABLE_TOKEN) return process.env.AIRTABLE_TOKEN;
  const local = path.join(dir, 'airtable.local.json');
  if(fs.existsSync(local)){
    try{ const t = JSON.parse(fs.readFileSync(local, 'utf8')).token; if(t) return t.trim(); }catch(e){}
  }
  return null;
}
const TOKEN = findToken();
if(!TOKEN){
  console.error('Airtableのトークンが見つかりません。airtable.local.json に {"token":"pat..."} を置いてください。');
  process.exit(1);
}

/* ---------- 公開用の列だけ（fieldId → jobs.json のキー） ---------- */
const F = {
  no:         'fld4vbX2MZaaPlJzD', // 案件番号（URLに使う）
  title:      'fldkT1n4Kcig7rnhv', // 案件名（公開用）
  categories: 'fldwXbOrIu8vqWPO7', // 職種カテゴリ
  content:    'fldYSv0BmEjJqNmTk', // 業務内容（公開用）
  must:       'fld9eOy81ZZiQC1VY', // 必須スキル
  welcome:    'fldMbXNQO9bRAwPHL', // 歓迎スキル
  payMin:     'fldT12zSvLyz47NZR', // 支払額の目安・下限（万円/月）
  payMax:     'fldsWQ79sOYxLMbAY', // 支払額の目安・上限（万円/月）
  days:       'fldut9mQnHlJZlmRq', // 稼働日数
  remote:     'fldMobSTxprGkn8dS', // リモート
  area:       'fldxNXxZFKfYBPpiD', // 勤務地（エリア）
  start:      'fldTIJotb3JMe4XBa', // 開始時期
  term:       'fld3z8zXg0gKWXPCG', // 期間
  age:        'fldTVP2Npyrt7YKzv', // 年齢の目安
  fetchedAt:  'fldb2h16ZRc5fIoVC', // 取得日（新着順に使う）
};

// 公開ステータス＝公開 かつ 転載可否＝OK の行だけ
const FILTER = "AND({公開ステータス}='公開',{転載可否（非公開）}='OK')";

async function fetchAll(){
  const out = [];
  let offset;
  do{
    const qs = new URLSearchParams();
    Object.values(F).forEach(id => qs.append('fields[]', id));
    qs.set('returnFieldsByFieldId', 'true');
    qs.set('filterByFormula', FILTER);
    qs.set('pageSize', '100');
    if(offset) qs.set('offset', offset);
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${qs}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if(!res.ok){ throw new Error(`Airtable ${res.status}: ${await res.text()}`); }
    const json = await res.json();
    out.push(...json.records);
    offset = json.offset;
  }while(offset);
  return out;
}

(async () => {
  const records = await fetchAll();
  const jobs = records.map(r => {
    const f = r.fields, o = {};
    for(const [key, id] of Object.entries(F)){
      if(f[id] !== undefined && f[id] !== null && f[id] !== '') o[key] = f[id];
    }
    return o;
  }).filter(j => j.no && j.title);
  jobs.sort((a, b) => String(b.fetchedAt || '').localeCompare(String(a.fetchedAt || '')) || b.no - a.no);
  fs.writeFileSync(path.join(dir, 'data', 'jobs.json'), JSON.stringify(jobs, null, 2) + '\n');
  console.log(`公開する案件 ${jobs.length} 件を data/jobs.json に書き出しました（取得 ${records.length} 件）。`);
})().catch(e => { console.error(e.message); process.exit(1); });
