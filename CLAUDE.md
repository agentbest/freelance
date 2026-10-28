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
- 個人情報の取り扱いは /privacy.html（フリーランス用・build.js の buildPrivacy）。Googleの同意フォームはまだ jobs の privacy.html にリンクしている
- OGP画像は assets/ogp.png。原本 tools/ogp/src.html を Chrome ヘッドレスで 1200×630 に出力
- 登録ボタンは Googleフォーム「業務委託基本契約 同意フォーム」、面談は Calendly

## お役立ち記事（/media/）— 2026-10-29 追加
- jobs.agent-best.net/media を参考にした記事サイト。build.js が media.js を呼んで media/ を毎回作り直す（media/ は手で直さない）
- 原稿: `_media/articles/{slug}.md`（`_` 始まりなので Jekyll は公開しない）。企画一覧: `_media/plan.tsv`（`python tools/make-media-plan.py` で再生成。slug は変えない）
- 分類: `_media/taxonomy.json`（グループ→ハブ。ハブを足すときはここ）
- 書き方: `_media/RULES.md`（必読。:::view＝エージェントベストの見解を2箇所、最後は「## よくある質問」）
- 検査: `node tools/check-media.js [slug]` → 警告ゼロ → `node build.js`
- 記事では「手数料」「商流」を一般論として書けるよう、media/ だけ NG 語を緩めている（媒体名・掲載単価などは止める）。当社の手数料・支払サイトは書かない
- 上限の目安は1ドメイン約2,000本（量→質の方針）
