# freelance — エージェントベストジョブ フリーランス（freelance.agent-best.net）

フリーランスのエンジニア・コンサル向けの業務委託案件サイト。LP（index.html）＋案件一覧（jobs/）＋案件ページ（job/F0001/）。2026-10-29 作成。

- データ元: Airtable base appYkc36EvioYoL1A の「フリーランス案件（求人票）」tblHqTQ75OOlbd9ZX
- 更新: `node fetch-jobs.js`（公開ステータス＝公開 かつ 転載可否＝OK の行だけ、公開用の列だけ取得）→ `node build.js`
- 自動更新: .github/workflows/update-jobs.yml（毎朝06:20 JST、Secret `AIRTABLE_TOKEN` が必要）
- 生成物（index.html・jobs/・job/・404.html・sitemap.xml・robots.txt）は手で直さない。build.js を直す
- 案件ページのURLは Airtable の「案件番号」（autoNumber）から作る。番号は変えない

## ⚠ 載せないもの
掲載単価・掲載企業・媒体名・商流・手数料（額も率も）。fetch-jobs.js は「（非公開）」列を取らない。build.js の NG_WORDS に当たると書き出しを止める。
金額は「お受け取り額の目安」（本人への支払額）だけを出す。

## 未対応
- 個人情報の取り扱いは jobs.agent-best.net/privacy.html（人材紹介用）にリンクしている。フリーランス案件紹介の利用目的が入っているかは未確認
- OGP画像なし
- 登録ボタンは Googleフォーム「業務委託基本契約 同意フォーム」、面談は Calendly
