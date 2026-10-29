---
title: SAP BTPエンジニアのフリーランス案件で求められるスキルと経験
description: SAP BTPの案件では、CAPやFioriでの拡張開発、Integration Suiteでの連携、SAP Buildでのローコード、AIの組み込み、権限と接続の設定、SAPの業務データの理解が見られます。分野ごと・経験の段階ごとに整理します。
hub: sap-erp
pubDate: 2026-10-29
tags: ["SAP","SAP BTP","CAP","Integration Suite","SAP Build"]
related: ["sap-btp-how-to","sap-btp-rate","sap-btp-skillsheet","sap-btp-remote","sap-btp-future","sap-btp-shikaku","sap-btp-interview","sap-abap-skills","s4hana-skills","sap-basis-skills","typescript-skills","java-skills"]
sources: [{"t":"Getting Started（SAP Cloud Application Programming Model）","u":"https://cap.cloud.sap/docs/get-started/"},{"t":"SAP Certified - Backend Developer - SAP Cloud Application Programming Model（SAP Learning）","u":"https://learning.sap.com/certifications/sap-certified-associate-backend-developer-sap-cloud-programming-model"},{"t":"Understanding Capabilities - Administering SAP Integration Suite（SAP Learning）","u":"https://learning.sap.com/courses/administering-sap-integration-suite/understanding-capabilities"},{"t":"Introducing Connectivity - Administering SAP Integration Suite（SAP Learning）","u":"https://learning.sap.com/courses/administering-sap-integration-suite/introduction-to-connectivity"},{"t":"SAP Build（SAP Community）","u":"https://pages.community.sap.com/topics/build"}]
---
SAP BTPのフリーランス案件では、**CAPやFioriでの拡張開発、Integration Suiteでのシステム連携、SAP Buildでのローコードや自動化、AIの組み込みのうち、どれを本番で担えるか**が見られます。どの分野でも共通して問われるのが、**権限と接続の設定、そしてつなぐ先のS/4HANAなどのデータと業務の理解**です。

サービスの名前を並べられることより、その分野で何を判断し、どう失敗を防いだかを説明できるかが、任される範囲を決めます。この記事では、案件で問われやすいスキルを分野ごとに整理し、経験の段階ごとに見られる点をまとめます。独立の準備や経験の棚卸しの方法は[SAP BTPエンジニアがフリーランスになるには](/media/sap-btp-how-to/)で扱っているので、ここではスキルの中身に絞ります。

## 分野ごとに問われるスキル

### 拡張アプリの開発（CAP・Fiori）

BTPの上で業務アプリやAPIを作る分野です。中心になるのは、SAPのCloud Application Programming Model（CAP）です。CAPの認定資格の案内では、Node.js／JavaScriptまたはJavaに加え、Core Data Services（CDS）とFiori elementsを使う開発者が対象とされています（2026年10月時点）。

- **データのモデル**：CDSでエンティティと関係を定義し、初期データを用意する
- **サービスの公開**：ODataなどでサービスを公開し、権限をかける
- **業務の処理**：Node.jsやJavaで、登録や更新の前後の処理を書く
- **画面**：Fiori elementsで標準の型に沿った画面を作る、必要に応じてSAPUI5で作り込む
- **デプロイ**：Cloud FoundryやKymaの環境に載せる。CAPの手引きにも両方への手順が示されている

面談で見られやすいのは、標準の型（Fiori elements）で済ませるか、作り込むかの判断です。作り込むほど保守の負担が増えるため、その線をどう引いたかを話せると評価されます。

### システム連携（Integration Suite）

SAP Learningでは、Integration Suiteの機能として、クラウドとオンプレミスのシステムをつなぐCloud Integration、APIを作成・公開・監視するAPI Management、イベントで連携するEvent Mesh、連携の作成を助けるIntegration Advisor、既存の連携の移行を評価するMigration Assessmentなどが挙げられています（2026年10月時点）。

- **連携フローの設計**：データの変換、宛先の振り分け、エラー時の扱いを決める
- **方式の選択**：同期のAPI、ファイル、イベントのどれでつなぐかを決める
- **APIの管理**：外部に公開するAPIの認証、利用の制限、監視を設定する
- **運用**：失敗したメッセージを見つけ、原因を切り分け、再処理する

連携の案件で差がつくのは、エラー処理と運用の設計です。正常に流れるフローは作れても、相手先が止まっていたとき、データが壊れていたときにどう動くかを決めていないと、本番で問い合わせが増えます。

### ローコード・自動化（SAP Build）

SAP Buildには、業務の自動化を担うSAP Build Process Automation、業務のポータルを作るSAP Build Work Zone、ローコードとCAPなどを組み合わせて開発するSAP Build Code、ローコードでアプリを作るSAP Build Appsがあります。SAPのコミュニティのページでは、Process AutomationはドラッグアンドドロップのツールやRPAのボット、コネクタで業務を自動化するもの、Work Zoneはアプリや情報への入口をまとめたサイトを作るものと説明されています。

この分野では、ツールの操作より、**利用部門が作ったものを誰が保守し、どんな権限でどのデータに触れてよいかのルール**を決められるかが見られます。

### AIの組み込み

SAPはBTPの上でAIのエージェントや業務AIを作る道具を広げています。動向は[SAP BTPエンジニアの将来性の記事](/media/sap-btp-future/)にまとめていますが、スキルの面で問われるのは、生成AIの使い方そのものより、**どの業務データをAIに渡してよいか、AIの出した結果を誰が確かめるか**を設計できるかです。生成AIの開発全般のスキルは[生成AIエンジニアのスキルの記事](/media/genai-skills/)も参考になります。

### 権限と接続（どの分野でも問われる）

BTPの案件では、開発の分野を問わず、次の設定に触れることがよくあります。

- **アカウントの構成**：開発・検証・本番の環境をどう分け、サービスをどう割り当てるか
- **利用者と権限**：ロールの設計、社内のID管理との連携
- **オンプレミスとの接続**：SAP Learningでは、Cloud Connectorや宛先（destination）の設定を使って接続を構成することが示されている
- **資格情報の管理**：接続先のパスワードや証明書を安全に保管する

この部分は、Basisやインフラの担当と分担することもあります。どこまでを自分で担ったかを説明できるようにしておきましょう。

### SAPの業務とデータの理解

BTPの上の仕事は、ほとんどがSAPのデータを読む、書く、つなぐ仕事です。受注、出荷、請求、購買、仕訳などの流れと、それがS/4HANAのどのデータとAPIにあたるかを知っていると、業務コンサルとの会話が早く進みます。モジュールの設定までは求められないことが多いものの、[S/4HANA移行のスキルの記事](/media/s4hana-skills/)にあるような業務の全体像は押さえておきたい知識です。

:::view
BTPの案件紹介の現場では、面談で「標準の機能やAPIで足りない部分を、どう見分けましたか」と問われる場面をよく見ます。評価されやすいのは、作り込んだ量より、標準で済ませた部分と作り込んだ部分の線を理由とともに話せる方です。一つの分野に深い方も、つなぐ先のSAPのデータについて一言添えられると、設計の会話に入れる人として受け止められやすくなります。
:::

## 経験の段階ごとに見られること

| 段階 | 主に任される仕事 | 面談で見られやすい点 |
|---|---|---|
| 実装が中心 | 設計に沿った開発、連携フローの作成、テスト | 作ったものを本番に出した経験、エラー時の対応 |
| 設計を任される | データのモデル、APIの形、エラー処理の方針 | 標準と作り込みの線引き、運用まで考えた設計 |
| 全体をまとめる | 拡張の置き場所、連携方式、環境と権限の構成 | 費用・保守・セキュリティを含めた判断の説明 |

実装が中心の段階でも、エラー処理や運用の手順を自分で決めた経験があると、設計の段階の案件に応募しやすくなります。全体をまとめる段階では、技術の判断を業務部門や情報システム部門に説明する力が求められます。考え方は[アーキテクトの記事](/media/architect/)も参考になります。

## 分野をまたいで役立つスキル

- **Gitとデプロイの自動化**：複数人での開発と、環境ごとの配布の手順を整える
- **テストの書き方**：サービスや連携フローを自動で確かめる
- **TypeScriptやJavaの基礎**：CAPやSAP Build Codeでの開発の土台になる。[TypeScriptエンジニアのスキルの記事](/media/typescript-skills/)、[Javaエンジニアのスキルの記事](/media/java-skills/)も参考になります
- **英語の資料を読む力**：SAPの公式のドキュメントや更新の情報は英語で先に出ることが多い

:::caution
BTPのサービスは、名前や提供の形が変わることがあります。古い名前のまま経歴やスキルを書くと、最新の動向を追っていないように見えることがあります。名前を書くときは、当時の名前と今の名前を併記するか、何をするサービスかを一言添えておきましょう。
:::

:::view
当社では、ご経歴は、ご本人の了承を得た案件にだけ、氏名・連絡先を伏せてご提案しています。BTPの案件は、同じ「BTP」でも求める分野と段階が案件ごとに違うため、分野ごとに本番で担った範囲をそろえておくことをおすすめします。案件で求められている分野や段階は、ご質問いただければ確認します。
:::

:::point
- 分野は、拡張開発（CAP・Fiori）、連携（Integration Suite）、ローコード・自動化（SAP Build）、AIの組み込みに分かれる
- どの分野でも、権限と接続の設定、SAPの業務とデータの理解が問われる
- 段階が上がるほど、標準と作り込みの線引き、方式の判断を説明する力が見られる
:::

## よくある質問

### CAPはNode.jsとJavaのどちらで覚えるべきですか？

案件によって使う言語が違うため、どちらがよいとは言い切れません。CAPの手引きでは最小の準備がNode.jsとされており、入口としては始めやすい言語です。Javaの経験が長い方は、Javaの案件に絞って探す方法もあります。

### Integration Suiteの経験だけで案件はありますか？

連携だけを担う案件もあります。ただ、条件のよい案件ほど、つなぐ先のSAPのデータや、APIの設計、運用の手順まで含めて見られます。旧来の連携基盤からの移行の経験があると、応募できる案件が広がります。

### ABAPのスキルもBTPの案件で問われますか？

案件によります。S/4HANAの中で作る拡張と、BTPの上で作る拡張を組み合わせる案件では、ABAPの知識があると設計の話が早く進みます。ABAPでの開発のスキルは、SAP ABAPエンジニアの記事で別に扱います。
