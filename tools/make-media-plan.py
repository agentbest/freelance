# 使い方: python tools/make-media-plan.py
# _media/plan.tsv（記事の企画一覧）を作り直す。企画を足すときはこのファイルに足す（slug は変えない）。
import os

roles = {
    'pm-pmo': [('pm', 'PM（プロジェクトマネージャー）'), ('pmo', 'PMO'), ('pdm', 'PdM（プロダクトマネージャー）')],
    'it-consul': [('it-consultant', 'ITコンサルタント'), ('dx-consultant', 'DXコンサルタント'), ('salesforce', 'Salesforceエンジニア・コンサル')],
    'biz-consul': [('strategy-consultant', '戦略コンサルタント'), ('business-consultant', '業務コンサルタント')],
    'sap-erp': [('sap-fico', 'SAP FI/COコンサル'), ('sap-sdmm', 'SAP SD/MMコンサル'), ('sap-basis', 'SAP Basisエンジニア'), ('s4hana', 'S/4HANA移行')],
    'backend': [('java', 'Javaエンジニア'), ('php', 'PHPエンジニア'), ('ruby', 'Rubyエンジニア'), ('python', 'Pythonエンジニア'), ('go', 'Goエンジニア'), ('csharp', 'C#エンジニア')],
    'frontend': [('react', 'Reactエンジニア'), ('vue', 'Vue.jsエンジニア'), ('typescript', 'TypeScriptエンジニア')],
    'mobile': [('ios', 'iOSエンジニア'), ('android', 'Androidエンジニア'), ('flutter', 'Flutterエンジニア')],
    'infra-cloud': [('aws', 'AWSエンジニア'), ('azure', 'Azureエンジニア'), ('gcp', 'GCPエンジニア'), ('network', 'ネットワークエンジニア'), ('sre', 'SRE')],
    'data-ai': [('data-engineer', 'データエンジニア'), ('data-scientist', 'データサイエンティスト'), ('ml-engineer', '機械学習エンジニア'), ('genai', '生成AIエンジニア')],
    'security': [('security-engineer', 'セキュリティエンジニア'), ('security-consultant', 'セキュリティコンサルタント')],
    'qa': [('qa-engineer', 'QAエンジニア'), ('test-automation', 'テスト自動化エンジニア')],
}
themes = [
    ('rate', '{r}のフリーランス案件｜報酬の決まり方と単価を上げる考え方'),
    ('how-to', '{r}がフリーランスになるには｜必要な経験と独立までの進め方'),
    ('skills', '{r}のフリーランス案件で求められるスキルと経験'),
    ('remote', '{r}のフリーランスはリモートで働ける？案件の傾向と探し方'),
    ('skillsheet', '{r}のスキルシートの書き方｜面談で評価される実績の見せ方'),
    ('future', '{r}のフリーランスの将来性とキャリアの広げ方'),
]
topics = {
    'independence': [
        ('quit-company-steps', '会社員からフリーランスになる手順｜退職前にやっておくこと'),
        ('kaigyo-todoke', '開業届の出し方｜フリーランスが出すタイミングと書き方'),
        ('before-independence-prepare', '独立前に済ませておくべき準備｜クレジットカード・ローン・口座'),
        ('yago', '屋号の決め方｜付けるメリットと注意点'),
        ('independence-timing', 'フリーランスとして独立するタイミングの考え方'),
        ('retirement-procedures', '退職後の手続き｜健康保険・年金・住民税の切り替え'),
        ('business-account', '事業用の銀行口座とクレジットカードの分け方'),
        ('accounting-software', 'フリーランスの会計ソフトの選び方と帳簿の付け方'),
        ('first-project', '独立後の最初の案件をどう決めるか｜失敗しにくい選び方'),
        ('unemployment-benefit-kaigyo', '退職して開業すると失業保険はどうなる？再就職手当との関係'),
    ],
    'find-projects': [
        ('agent-how-to-use', 'フリーランスエージェントの使い方｜登録から参画までの流れ'),
        ('agent-margin', 'フリーランスエージェントのマージンとは｜報酬の内訳の考え方'),
        ('direct-vs-agent', '直接契約とエージェント経由の違い｜それぞれの向き不向き'),
        ('referral', '知人の紹介で案件を得るときの注意点'),
        ('crowdsourcing', 'クラウドソーシングとエージェント案件の違い'),
        ('no-project-gap', '案件が途切れたときにやること｜空白期間を短くする準備'),
        ('shoryu', '商流とは｜エンド直・元請・二次請の違いとフリーランスへの影響'),
        ('check-before-interview', '案件の面談前に確認しておくべき項目チェックリスト'),
        ('contract-renewal', '業務委託の契約更新の仕組み｜更新されないときの理由と対策'),
        ('multi-agent', 'フリーランスエージェントは複数登録してよい？重複応募の注意点'),
    ],
    'skillsheet-interview': [
        ('skillsheet-basics', 'フリーランスのスキルシートの書き方｜基本の構成と例'),
        ('interview-questions', '業務委託の面談でよく聞かれる質問と答え方'),
        ('reverse-questions', '業務委託の面談で聞いておくべき逆質問'),
        ('confidentiality-in-skillsheet', 'スキルシートに書いてよいこと・いけないこと｜守秘義務との付き合い方'),
        ('interview-fail-reasons', '業務委託の面談で見送られる理由と次に生かす方法'),
        ('online-interview', 'オンライン面談で気をつけること｜環境・話し方・資料'),
        ('self-introduction', '面談の自己紹介の組み立て方｜1〜2分で伝える経歴'),
    ],
    'rate': [
        ('rate-mechanism', 'フリーランスの単価はどう決まる？報酬の仕組みを整理'),
        ('rate-negotiation', '単価交渉のタイミングと伝え方'),
        ('raise-rate', 'フリーランスが単価を上げるための考え方'),
        ('seisan-haba', '精算幅（140〜180時間など）とは｜超過・控除の計算方法'),
        ('jouge-chukan-wari', '上下割と中間割の違い｜精算方式で報酬はどう変わる？'),
        ('hourly-convert', '月額単価を時給・年収に換算するときの注意点'),
        ('tax-included', '報酬は税込か税別か｜見積・請求で確認すること'),
        ('transportation-fee', '業務委託の交通費・経費は誰が負担する？'),
    ],
    'contract': [
        ('junin-vs-ukeoi', '準委任契約と請負契約の違い｜フリーランスが知っておくべきこと'),
        ('gisou-ukeoi', '偽装請負とは｜指揮命令の線引きとフリーランスが注意すること'),
        ('contract-checkpoints', '業務委託契約書のチェックポイント'),
        ('basic-and-individual-contract', '基本契約と個別契約の関係｜何がどちらに書かれるか'),
        ('nda', '秘密保持契約（NDA）で確認すること'),
        ('damages-cap', '損害賠償の条項｜上限の考え方と確認ポイント'),
        ('termination', '業務委託契約の中途解約｜予告期間とトラブルを避ける方法'),
        ('payment-terms', '支払サイトとは｜締め日・支払日の確認ポイント'),
        ('copyright', '成果物の著作権は誰のもの？業務委託の知的財産の扱い'),
        ('non-compete', '直接契約の禁止・競業避止の条項をどう読むか'),
        ('subcontract', '再委託とは｜フリーランスが自分で人を使うときの注意点'),
    ],
    'law': [
        ('freelance-act-overview', 'フリーランス新法の要点｜発注側の義務とフリーランスの権利'),
        ('freelance-act-terms', 'フリーランス新法の取引条件の明示｜受け取るべき内容'),
        ('freelance-act-60days', '報酬は60日以内に支払う決まり｜フリーランス新法の支払期日'),
        ('freelance-act-termination-notice', '中途解除の30日前予告｜フリーランス新法のルール'),
        ('freelance-act-harassment', 'フリーランスへのハラスメント対策｜発注側の義務と相談先'),
        ('shitauke-vs-freelance-act', '下請法とフリーランス新法の違い'),
        ('freelance-trouble-consult', 'フリーランスが取引トラブルにあったときの相談先'),
        ('rousai-special', 'フリーランスの労災保険特別加入｜対象と手続き'),
    ],
    'tax': [
        ('kakutei-shinkoku-flow', 'フリーランスの確定申告の流れ｜期限と準備するもの'),
        ('aoiro-shinkoku', '青色申告とは｜65万円控除を受けるための条件'),
        ('keihi-list', 'フリーランスエンジニアが経費にできるもの'),
        ('kaji-anbun', '家事按分の考え方｜家賃・通信費の経費の割合'),
        ('genka-shokyaku', 'パソコンは一括で経費にできる？減価償却の基本'),
        ('juminzei', 'フリーランスの住民税｜計算と支払いのタイミング'),
        ('kojin-jigyozei', '個人事業税とは｜対象になる業種と計算'),
        ('yotei-nouzei', '予定納税とは｜独立2年目に届く通知の意味'),
        ('gensen-choshu', '報酬から引かれる源泉徴収｜対象と確定申告での精算'),
        ('denshi-chobo', '電子帳簿保存法｜フリーランスが対応すること'),
        ('etax', 'e-Taxで確定申告する方法｜準備と流れ'),
    ],
    'invoice': [
        ('invoice-basics', 'インボイス制度の基本｜フリーランスへの影響'),
        ('invoice-register-or-not', 'インボイス登録はすべき？判断の考え方'),
        ('niwari-tokurei', '2割特例とは｜対象と期限'),
        ('kan-i-kazei', '簡易課税制度の仕組みとみなし仕入率'),
        ('keika-sochi', '免税事業者からの仕入れの経過措置｜控除割合の変わり方'),
        ('invoice-format', '適格請求書（インボイス）の書き方と記載事項'),
        ('shohizei-nouzei', 'フリーランスの消費税の納税｜計算と申告の流れ'),
    ],
    'social-insurance': [
        ('kokuho', 'フリーランスの国民健康保険｜保険料の決まり方'),
        ('nini-keizoku', '任意継続と国民健康保険のどちらを選ぶか'),
        ('kokumin-nenkin', '国民年金の保険料と免除・猶予'),
        ('fuka-nenkin', '付加年金とは｜少額で年金を増やす仕組み'),
        ('nenkin-kikin', '国民年金基金とは｜iDeCoとの違い'),
        ('fuyou', 'フリーランスが家族の扶養に入れる条件'),
        ('health-check', 'フリーランスの健康診断｜受け方と費用'),
    ],
    'incorporation': [
        ('incorporation-timing', 'フリーランスが法人化を考えるタイミング'),
        ('micro-corp', 'マイクロ法人とは｜仕組みと注意点'),
        ('incorporation-pros-cons', '法人化のメリットとデメリット'),
        ('godo-vs-kabushiki', '合同会社と株式会社の違い｜フリーランスの法人化で選ぶなら'),
        ('yakuin-hoshu', '役員報酬の決め方｜法人化後の注意点'),
    ],
    'savings': [
        ('shokibo-kyosai', '小規模企業共済とは｜掛金と受け取りの仕組み'),
        ('ideco', 'フリーランスのiDeCo｜掛金の上限と注意点'),
        ('safety-kyosai', '経営セーフティ共済とは｜仕組みと注意点'),
        ('shotoku-hosho', '所得補償保険とは｜働けなくなったときの備え'),
        ('baisho-sekinin', 'フリーランスの賠償責任保険｜IT業務で備えること'),
    ],
    'workstyle': [
        ('full-remote', 'フルリモートのフリーランス案件の探し方と注意点'),
        ('week3', '週3日の業務委託案件｜働き方と探し方'),
        ('kado-ritsu', '稼働率とは｜案件の稼働日数・時間の読み方'),
        ('kakemochi', '複数の案件を掛け持ちするときの注意点'),
        ('jochu', '常駐案件とリモート案件の違い｜選び方の考え方'),
        ('chiho', '地方在住でフリーランス案件を受ける方法'),
    ],
    'career': [
        ('20s', '20代でフリーランスになる前に考えたいこと'),
        ('30s', '30代のフリーランス｜案件選びとキャリアの考え方'),
        ('40s', '40代のフリーランス｜求められる経験と案件の傾向'),
        ('50s', '50代のフリーランス｜経験を生かせる案件と注意点'),
        ('60s', '60代のフリーランス｜シニアが業務委託で働く方法'),
        ('mikeiken', '実務未経験からフリーランスエンジニアになれる？現実的な道筋'),
        ('upper-process', '上流工程の案件に入るために必要な経験'),
    ],
    'side-job': [
        ('fukugyo-gyomu-itaku', '会社員の副業で業務委託案件を受けるときの注意点'),
        ('fukugyo-juminzei', '副業は会社に知られる？住民税の仕組み'),
        ('fukugyo-20man', '副業の確定申告｜所得20万円のルールの正しい理解'),
        ('weekend-freelance', '週末・夜だけの業務委託案件はある？探し方と注意点'),
    ],
    'back-to-employee': [
        ('tedori-hikaku', 'フリーランスと正社員の手取りの違い｜比べるときの考え方'),
        ('back-to-seishain', 'フリーランスから正社員に戻る｜転職で評価されるポイント'),
        ('nenshu-tanka-convert', '正社員の年収とフリーランスの単価の比べ方'),
        ('freelance-vs-seishain', 'フリーランスと正社員のどちらが向いている？判断の軸'),
    ],
}

# 2026-10-29 追加（第10弾〜）。職種×テーマは増やさず、1ページ1問で答えられる話題だけを足す
extra_topics = {
    'independence': [
        ('freelance-merit-demerit', 'フリーランスエンジニアのメリットとデメリット｜独立前に知っておくこと'),
        ('seikatsu-hi-junbi', '独立前に用意しておく生活費の考え方｜何か月分を目安にするか'),
        ('family-consent', '家族に独立を相談するときに伝えておきたいこと'),
        ('jitaku-office', '自宅を仕事場にするときの環境づくり｜机・回線・セキュリティ'),
        ('ex-employer-project', '退職した会社から業務委託で仕事を受けるときの注意点'),
        ('coworking', 'コワーキングスペースを使うときの経費と注意点'),
    ],
    'find-projects': [
        ('project-selection', '案件の選び方｜条件だけで決めないための確認ポイント'),
        ('decline-offer', '案件の参画を辞退するときの伝え方とタイミング'),
        ('start-date-adjust', '参画開始日の調整｜退職日や前の案件との重なり'),
        ('long-term-project', '長期案件と短期案件のどちらを選ぶか'),
        ('project-info-read', '案件票の読み方｜必須スキル・歓迎スキル・稼働条件の見方'),
        ('portfolio-github', 'ポートフォリオやGitHubは必要？業務委託で実績を示す方法'),
        ('agent-erabikata', 'フリーランスエージェントの選び方｜比べるときの観点'),
    ],
    'skillsheet-interview': [
        ('interview-flow', '業務委託の面談の流れ｜顔合わせから参画決定まで'),
        ('interview-after', '面談後の連絡と結果を待つ間にすること'),
        ('multiple-interviews', '複数の面談が重なったときの進め方'),
        ('blank-period-explain', '空白期間の説明の仕方｜面談で聞かれたとき'),
        ('skillsheet-update', 'スキルシートを更新するタイミングと続け方'),
    ],
    'rate': [
        ('rate-down', '単価を下げてほしいと言われたときの対応'),
        ('kado-houkoku', '稼働報告書（作業報告書）の書き方と提出の注意点'),
        ('seikyusho-flow', '業務委託の請求書の出し方｜締めから入金までの流れ'),
        ('payment-delay', '報酬が支払われないときの対処｜確認から相談まで'),
    ],
    'contract': [
        ('keiyaku-period', '業務委託の契約期間の決め方｜1か月更新と3か月更新の違い'),
        ('denshi-keiyaku', '電子契約で業務委託契約を結ぶときの注意点'),
        ('kenshu', '検収とは｜請負で報酬が確定するタイミング'),
        ('keiyaku-futekigo', '契約不適合責任とは｜請負で負う責任の範囲'),
        ('kojin-joho-itaku', '業務で個人情報を扱うときの契約と注意点'),
        ('scope-change', '作業範囲が広がったときの契約の扱い'),
        ('hansha-joko', '反社会的勢力の排除条項とは｜契約書で求められること'),
    ],
    'law': [
        ('freelance-act-boshu', '募集情報の的確表示｜フリーランス新法の募集のルール'),
        ('freelance-act-ikuji', '育児・介護とフリーランス新法の配慮義務'),
        ('freelance-act-kinshi', 'フリーランス新法で禁止される7つの行為'),
        ('toritekiho', '取適法（旧下請法）とは｜改正のポイントとフリーランスへの影響'),
        ('kojinjoho-hogo', 'フリーランスと個人情報保護法｜事業者として守ること'),
    ],
    'tax': [
        ('kigo-shinkoku', '確定申告の期限に遅れたとき｜期限後申告と加算税'),
        ('shusei-shinkoku', '確定申告の間違いに気づいたとき｜修正申告と更正の請求'),
        ('zeimu-chosa', '税務調査とは｜フリーランスが備えておくこと'),
        ('iryouhi-koujo', 'フリーランスの医療費控除とセルフメディケーション税制'),
        ('furusato-nouzei', 'フリーランスのふるさと納税｜上限の考え方と確定申告'),
        ('kaigihi-kosaihi', '会議費・交際費はどこまで経費になる？'),
        ('shotokuzei-keisan', '所得税の計算の流れ｜売上から税額まで'),
    ],
    'invoice': [
        ('invoice-touroku-tetsuzuki', 'インボイス登録の手続き｜申請から登録通知まで'),
        ('kazei-jigyosha-todoke', '消費税の届出書の種類｜課税事業者になるとき・やめるとき'),
        ('nouzei-gimu-hantei', '消費税の納税義務はいつから？基準期間と特定期間'),
    ],
    'social-insurance': [
        ('kokuho-keigen', '国民健康保険料の軽減と減免'),
        ('nenkin-mikomi', 'フリーランスの年金の見込み額の調べ方'),
        ('sanzen-sango', 'フリーランスの出産・育児で使える制度'),
        ('shobyo-seido', 'フリーランスが病気やけがで働けないときに使える制度'),
    ],
    'incorporation': [
        ('houjin-setsuritsu-flow', '法人設立の流れ｜フリーランスが会社を作る手順'),
        ('houjin-shakai-hoken', '法人化したときの社会保険｜加入義務と保険料'),
        ('houjin-keiyaku-kirikae', '法人化後に取引先との契約を切り替える手順'),
    ],
    'savings': [
        ('rougo-shikin', 'フリーランスの老後資金の考え方｜公的年金と自分で備える制度'),
        ('nisa', 'フリーランスのNISA｜iDeCo・小規模企業共済との使い分け'),
        ('emergency-fund', '収入が途切れたときに備える貯蓄の考え方'),
    ],
    'workstyle': [
        ('time-management', 'フリーランスの時間管理｜稼働の記録と休みの取り方'),
        ('taichou-kanri', '働きすぎを防ぐ｜フリーランスの体調管理'),
        ('benkyo-jikan', '案件と並行した学習時間の作り方'),
        ('kyuka', '長期休暇を取りたいときの案件の調整'),
        ('home-security', '自宅で働くときの情報セキュリティ対策'),
    ],
    'career': [
        ('career-plan', 'フリーランスのキャリアプランの立て方'),
        ('specialist-generalist', 'スペシャリストとジェネラリストのどちらを目指すか'),
        ('shikaku', '資格はフリーランスの案件獲得に役立つ？'),
        ('manager-to-freelance', '管理職からフリーランスになるときに考えること'),
        ('kosodate-freelance', '子育てしながらフリーランスとして働く｜案件選びと制度'),
        ('eigo-project', '英語を使うフリーランス案件｜求められる英語力の考え方'),
    ],
    'side-job': [
        ('fukugyo-kinshi', '副業禁止の会社で業務委託を受けるリスク'),
        ('fukugyo-kaigyo', '副業でも開業届は出すべき？判断の考え方'),
        ('fukugyo-to-dokuritsu', '副業から独立へ移る進め方'),
    ],
    'back-to-employee': [
        ('freelance-keireki-kaku', '転職の職務経歴書でフリーランス期間をどう書くか'),
        ('seishain-offer', '取引先から正社員に誘われたときの考え方'),
        ('seishain-gyomu-itaku-kakemochi', '正社員と業務委託の掛け持ち｜両立の注意点'),
    ],
}
# 2026-10-29 追加その2（第12弾〜）。既存403本と問いが重ならないものだけ
extra_topics2 = {
    'independence': [
        ('dokuritsu-koukai', '独立して後悔しやすいパターンと避け方'),
        ('taishoku-tsutaekata', '会社に退職と独立を伝えるときの順番と伝え方'),
        ('yuukyuu-shouka', '退職前の有給休暇の使い方と独立の準備'),
        ('kaigyo-shoki-hiyou', '独立にかかる初期費用の内訳と考え方'),
        ('jigyo-jusho', '自宅住所を出したくないときの事業用住所の考え方'),
        ('meishi-website', 'フリーランスに名刺やWebサイトは必要？'),
    ],
    'find-projects': [
        ('gyomu-itaku-miwake', '正社員求人と業務委託案件の見分け方'),
        ('spot-anken', 'スポット・単発の案件を受けるときの注意点'),
        ('shinki-vs-hoshu', '新規開発案件と保守運用案件の違い'),
        ('sns-eigyo', 'SNSや交流会で案件を得るときの注意点'),
        ('jutaku-kaisha', '受託開発会社から仕事を受ける場合の特徴'),
        ('torihikisaki-chousa', '取引先の会社を調べる方法｜参画前に確かめること'),
        ('sankaku-chokuzen-cancel', '参画直前に案件がなくなったときの対応'),
        ('anken-shuryo-tsutaekata', '案件を自分から終えるときの伝え方と時期'),
        ('heikou-katsudou', '転職活動と案件探しを並行するときの注意点'),
    ],
    'skillsheet-interview': [
        ('skillsheet-format', 'スキルシートのファイル形式と送り方'),
        ('nenrei-shitsumon', '面談で年齢やキャリアの長さについて聞かれたとき'),
        ('tech-test', '技術面談・コーディングテストへの備え方'),
        ('jiko-pr', 'スキルシートの自己PR欄の書き方'),
        ('mushou-kadai', '面談で課題の提出を求められたとき｜無償作業の線引き'),
        ('eibun-resume', '英文のスキルシート（レジュメ）の書き方'),
    ],
    'rate': [
        ('kibou-tanka-gap', '希望単価と提示額が合わないときの考え方'),
        ('jikyu-nichigaku', '時給制・日額制の案件の報酬の考え方'),
        ('furikomi-tesuryo', '報酬の振込手数料は誰が負担する？'),
    ],
    'contract': [
        ('keiyakusho-shusei', '契約書のひな形に修正を求めるときの考え方'),
        ('chosakusha-jinkakuken', '著作者人格権の不行使条項とは'),
        ('oss-license', '納品物にOSSを使うときのライセンスの注意点'),
        ('kankatsu-junkyoho', '合意管轄・準拠法の条項とは'),
        ('ai-riyou-keiyaku', '業務での生成AIの利用に関する契約条項'),
        ('hoken-kanyu-youkyu', '取引先から賠償責任保険への加入を求められたとき'),
        ('mitsumorisho', '見積書の作り方｜請負案件で見積もるときの考え方'),
        ('iyakukin', '違約金・損害賠償額の予定の条項とは'),
    ],
    'law': [
        ('yuetsuteki-chii', '優越的地位の濫用とは｜フリーランスとの取引で問題になる行為'),
        ('roudousha-sei', '労働者性とは｜業務委託でも労働者と判断される場合'),
        ('inshizei', '業務委託契約書の印紙税｜かかる場合とかからない場合'),
        ('roei-taiou', '個人情報や機密情報を漏えいしてしまったときの対応'),
    ],
    'tax': [
        ('junsonshitsu-kurikoshi', '赤字のときの純損失の繰越し｜青色申告の特典'),
        ('senjusha-kyuyo', '青色事業専従者給与とは｜家族に給与を払うとき'),
        ('shakai-hoken-koujo', '社会保険料控除と確定申告｜国保・国民年金の扱い'),
        ('shotoku-koujo-ichiran', '確定申告で使える所得控除の一覧'),
        ('shorui-hozon', '確定申告で保存しておく書類と保存期間'),
        ('uriage-shotoku', '売上・所得・手取りの違い｜フリーランスのお金の言葉'),
        ('zeirishi', '税理士に頼むかどうかの判断と依頼の流れ'),
        ('kaigyo-hi', '開業費とは｜独立前の支出の扱い'),
        ('nouzei-houhou', '税金の納め方｜振替・クレジットカード・スマホ決済'),
    ],
    'invoice': [
        ('invoice-bango-kikareta', '取引先から登録番号を聞かれたときの対応'),
        ('invoice-shuusei', 'インボイスの記載を間違えたとき｜修正の方法'),
    ],
    'social-insurance': [
        ('hikkoshi-tetsuzuki', '引っ越したときの国民健康保険と国民年金の手続き'),
        ('kokunen-tsuino', '国民年金を払い忘れたとき｜後納と追納'),
        ('kokuho-kumiai', '国民健康保険組合とは｜フリーランスが入れる場合'),
        ('kaigo-hoken', '40歳からの介護保険料｜フリーランスの払い方'),
        ('kokuho-kani-shinkoku', '所得がなくても国保の申告が必要な理由'),
    ],
    'incorporation': [
        ('houjin-kaisan', '法人をたたむときの手続き｜解散と清算'),
        ('houjin-kessan', '法人の決算と申告の流れ'),
    ],
    'savings': [
        ('hoken-erabi', 'フリーランスの生命保険・医療保険の考え方'),
        ('jutaku-loan', 'フリーランスの住宅ローン審査で見られること'),
        ('nouzei-junbi', '税金と保険料の積み立て方｜納付に困らないための準備'),
    ],
    'workstyle': [
        ('kaigai-remote', '海外から日本の案件をリモートで受けられる？注意点'),
        ('shigoto-dougu', '仕事道具（PC・回線・ソフト）の選び方と費用の考え方'),
        ('taiyo-pc', '取引先から貸与PCを使うときの注意点'),
        ('tsuika-irai-kotowari', '参画中に追加の依頼を断るときの伝え方'),
        ('shuho', '週報・進捗報告の書き方'),
    ],
    'career': [
        ('keiken-nensu', '経験年数の数え方｜面談で伝える年数の考え方'),
        ('dev-to-pm', '開発者からPM・PMOへ役割を移す進め方'),
        ('eng-to-consul', 'エンジニアからITコンサルへ役割を広げる進め方'),
        ('ai-shigoto-henka', '生成AIの普及でフリーランスエンジニアの仕事はどう変わる？'),
        ('fukki', '育児・介護などで離れたあとに案件へ復帰する方法'),
        ('jinmyaku', 'フリーランスの人脈づくり｜案件につながる関係の育て方'),
        ('kaigo-ryouritsu', '介護と仕事の両立｜フリーランスが使える制度'),
    ],
    'side-job': [
        ('fukugyo-jikan', '副業に使える時間の見積もり方'),
        ('koumuin-fukugyo', '公務員は業務委託の副業ができる？'),
    ],
    'back-to-employee': [
        ('seishain-modoru-tetsuzuki', '正社員に戻ったときの社会保険・税金の切り替え'),
    ],
}
# 2026-10-29 追加その3（第14弾〜）。数合わせはせず、既存475本と問いが重ならないものだけ
extra_topics3 = {
    'independence': [
        ('kojin-jigyonushi-chigai', '個人事業主とフリーランスの違い｜呼び方と手続きの関係'),
        ('dokuritsu-1nenme-okane', '独立1年目のお金の流れ｜税金・保険料の支払い時期'),
        ('dokuritsu-2nenme', '独立2年目に増える支払いと備え方'),
        ('jitaku-chintai', '賃貸住宅で事業をするときの注意点'),
    ],
    'find-projects': [
        ('tantousha-yaritori', 'エージェントの担当者とのやりとりで伝えておきたいこと'),
        ('sankaku-junbi', '参画が決まってから開始日までにやること'),
        ('sankaku-shoki', '参画初日から最初の1週間でやること'),
        ('genba-tachiichi', '常駐先での立ち位置と人間関係の考え方'),
        ('hikitsugi', '契約終了時の引き継ぎの進め方'),
        ('hyouka-tsunageru', '取引先からの評価を次の案件につなげる方法'),
        ('enchou-dashin', '契約延長の打診が来たときの考え方'),
    ],
    'skillsheet-interview': [
        ('mensetsu-ng', '業務委託の面談で避けたい受け答え'),
        ('mensetsu-tanka', '面談で希望単価を聞かれたときの答え方'),
        ('tanki-keireki', '短期案件が多い経歴の見せ方'),
        ('skillsheet-shippai', 'スキルシートでよくある失敗と直し方'),
    ],
    'rate': [
        ('tanka-fukumu', '単価に含まれるもの・含まれないもの'),
        ('hiwari', '月の途中から参画したときの報酬｜日割りの考え方'),
        ('kyujitsu-sagyo', '休日・深夜に作業したときの報酬の扱い'),
        ('taiki-houshu', '取引先の都合で作業が止まったときの報酬'),
    ],
    'contract': [
        ('keiyakusho-nashi', '契約書がないまま作業を始めるリスク'),
        ('sansha-kankei', 'エージェント経由の契約の相手は誰？三者の関係'),
        ('factoring', '債権譲渡の禁止条項とファクタリングの注意点'),
        ('jikou', '報酬を請求できる期間｜消滅時効の考え方'),
        ('data-henkyaku', '契約終了後のデータの返却・削除の義務'),
        ('torihikisaki-kitei', '取引先の就業規則やセキュリティ規程に従う必要はある？'),
    ],
    'law': [
        ('freelance-act-moushide', 'フリーランス法違反を申し出る方法と不利益な扱いの禁止'),
        ('rousai-jiko', '業務中にけがをしたとき｜労災の特別加入と手続き'),
        ('harassment-taiou', 'ハラスメントを受けたときの具体的な対応'),
    ],
    'tax': [
        ('benkyou-keihi', '書籍・セミナー・資格の費用は経費になる？'),
        ('ryohi', '出張の旅費・宿泊費の経費の考え方'),
        ('kaigai-torihikisaki', '海外の取引先から報酬を受け取るときの税金'),
        ('nouzei-yuuyo', '税金を払えないとき｜納税の猶予と分割'),
        ('shoumeisho', '所得証明・課税証明・納税証明の取り方'),
        ('kanjou-kamoku', '勘定科目の選び方｜フリーランスがよく使う科目'),
        ('jigyonushi-kashi', '事業主貸・事業主借とは'),
    ],
    'invoice': [
        ('menzei-gaichu', '免税事業者に仕事を外注するときの注意点'),
        ('denshi-invoice', '電子インボイス（デジタルインボイス）とは'),
    ],
    'social-insurance': [
        ('kokuho-tainou', '国民健康保険料を滞納するとどうなる？'),
        ('kougaku-ryouyouhi', '高額療養費の仕組みと手続き'),
    ],
    'incorporation': [
        ('houjin-kouza', '法人口座の開設｜準備するものと注意点'),
        ('jigyou-mokuteki', '定款の事業目的の決め方'),
        ('houjin-zei', '法人税・法人住民税・法人事業税の仕組み'),
        ('houjin-gensen', '法人化後の源泉徴収と年末調整'),
    ],
    'workstyle': [
        ('online-kaigi', 'オンライン会議で信頼される準備と話し方'),
        ('chat-houkoku', 'チャットでの報告・相談の書き方'),
        ('renraku-jikan', '稼働時間外の連絡にどう対応するか'),
        ('document', '設計書・手順書を残す習慣｜引き継げる仕事の残し方'),
        ('gijiroku', '議事録の書き方｜決まったことを残すコツ'),
    ],
    'career': [
        ('tanaoroshi', 'キャリアの棚卸しの方法'),
        ('nagaku-tsuzukeru', 'フリーランスを長く続けるために意識したいこと'),
        ('tech-lead', 'テックリードとして参画するには'),
        ('architect', 'アーキテクトとして参画するには'),
        ('shokushu-tenkan', '職種を変えたいときの進め方'),
        ('gyoukai-chishiki', '業界知識（金融・製造など）を強みにする方法'),
    ],
    'side-job': [
        ('hongyo-torihikisaki', '本業の取引先から副業を頼まれたとき'),
    ],
    'back-to-employee': [
        ('tenshoku-mensetsu', 'フリーランスの経験を転職面接でどう話すか'),
        ('nenshu-koushou', '正社員に戻るときの年収交渉'),
        ('keiyaku-haken-hikaku', '契約社員・派遣・業務委託の違いと選び方'),
    ],
}
for d in (extra_topics, extra_topics2, extra_topics3):
    for hub, ts in d.items():
        topics[hub] = topics[hub] + ts

rows = []
for hub, rs in roles.items():
    for code, name in rs:
        for t, tt in themes:
            rows.append((hub, f'{code}-{t}', tt.format(r=name)))
for hub, ts in topics.items():
    rows += [(hub, s, t) for s, t in ts]
slugs = [r[1] for r in rows]
assert len(slugs) == len(set(slugs)), 'slug が重複しています'

out = os.path.join(os.path.dirname(__file__), '..', '_media', 'plan.tsv')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    f.write('no\thub\tslug\ttitle\n')
    for i, (h, s, t) in enumerate(rows, 1):
        f.write(f'{i}\t{h}\t{s}\t{t}\n')
print(f'{len(rows)} 件の企画を書き出しました')
