---
title: Dynamics 365コンサルのフリーランス案件で求められるスキルと経験
description: Dynamics 365の案件では、会計・物流・営業などの業務知識、標準機能との差を見極める力、データとセキュリティの設計、移行と連携、更新への対応が見られます。ERP系とCRM系の違い、経験の段階ごとの求められ方を解説します。
hub: it-consul
pubDate: 2026-10-29
tags: ["Dynamics 365","フリーランス","スキル","ERP","認定資格"]
related: ["dynamics365-how-to","dynamics365-rate","dynamics365-skillsheet","dynamics365-remote","dynamics365-future","dynamics365-shikaku","dynamics365-interview","it-consultant-skills","sap-fico-skills","salesforce-skills","cert-azure","cert-power-bi","skillsheet-basics"]
sources: [{"t":"Microsoft Certified: Dynamics 365 Finance Functional Consultant Associate（Microsoft Learn）","u":"https://learn.microsoft.com/en-us/credentials/certifications/d365-functional-consultant-financials/"},{"t":"Microsoft Certified: Dynamics 365 Supply Chain Management Functional Consultant Associate（Microsoft Learn）","u":"https://learn.microsoft.com/en-us/credentials/certifications/d365-functional-consultant-supply-chain-management/"},{"t":"Microsoft Certified: Dynamics 365 Customer Service Functional Consultant Associate（Microsoft Learn）","u":"https://learn.microsoft.com/en-us/credentials/certifications/d365-functional-consultant-customer-service/"},{"t":"Microsoft Certified: Dynamics 365: Finance and Operations Apps Developer Associate（Microsoft Learn）","u":"https://learn.microsoft.com/en-us/credentials/certifications/exams/mb-500/"},{"t":"Microsoft Certified: Dynamics 365 Customer Experience Analyst Associate（Microsoft Learn）","u":"https://learn.microsoft.com/en-us/credentials/certifications/exams/mb-280/"},{"t":"Microsoft Certified: Dynamics 365: Finance and Operations Apps Solution Architect Expert（Microsoft Learn）","u":"https://learn.microsoft.com/en-us/credentials/certifications/d365-finance-and-operations-apps-solution-architect-expert/"}]
---
Dynamics 365のフリーランス案件で求められるのは、**会計・物流・営業・サービスなどの業務知識、業務と標準機能の差を見極める力、データとセキュリティの設計、データ移行と連携、定期的な更新への対応**です。ERP系（Finance・Supply Chain Managementなど）とCRM系（Sales・Customer Serviceなど）で中心になるスキルが違い、経験の段階によって求められる深さも変わります。

この記事では、案件で問われるスキルを分野ごとに整理し、経験の段階ごとの求められ方と、認定資格の位置づけを解説します。独立の進め方は[Dynamics 365コンサルがフリーランスになるには](/media/dynamics365-how-to/)にまとめています。

## ERP系とCRM系で中心になるスキル

| 分野 | ERP系（財務と運用） | CRM系（顧客対応） |
|---|---|---|
| 業務知識 | 会計、債権債務、固定資産、販売・購買、在庫、倉庫、生産計画 | 営業の案件管理、問い合わせの受付と振り分け、SLA、ナレッジ |
| 設定と設計 | 法人・勘定科目などの財務の土台、品目と在庫のマスタ | データの持ち方、セキュリティ、業務の流れに沿った画面 |
| 開発の基盤 | X++による拡張、帳票、外部連携 | Dataverseとモデル駆動型アプリの拡張、外部連携 |
| 移行の論点 | 残高と未決済の取引の照合 | 顧客データの重複と名寄せ |

Microsoftの認定資格の説明を見ても、違いがわかります。Finance の機能コンサル向け資格は、総勘定元帳、現金・銀行、税、債権、債務、予算、固定資産、原価計算、連結などを扱う力を求めています。Supply Chain Management の資格は、製品情報、販売・購買、在庫、品質、倉庫、倉庫のモバイルアプリ、マスタ計画、輸送などを挙げています。Customer Service の資格は、ケース管理、ナレッジ管理、キュー、SLA、ルーティングの理解を求めています（いずれもMicrosoft Learn、2026年10月時点）。

## 案件でよく問われるスキル

### 業務知識と、標準機能との差を見極める力

Dynamics 365の導入は、製品の標準の動きに業務をどこまで合わせ、どこを設定や開発で補うかを決める仕事です。そのため、業務の流れを理解し、標準の機能で足りる部分と足りない部分を切り分ける力（Fit&Gap）が、どの役割でも中心になります。

ERP系では、仕訳がどう作られ、どの勘定に転記されるかを説明できることが前提です。販売や在庫の担当でも、出荷や入庫が会計にどうつながるかを理解していないと、他のモジュールの担当者と話がかみ合いません。CRM系では、営業の段階の定義や問い合わせの振り分けのルールを、利用部門と合意できる言葉に直す力が問われます。

### データとセキュリティの設計

ERP系では、法人、勘定科目、品目、取引先などのマスタの設計が、後から変えにくい部分です。複数の法人や通貨を扱う導入では、共通にする設定と法人ごとに分ける設定の線引きが論点になります。

CRM系では、Dataverse上のデータの持ち方と、誰がどのデータを見て編集できるかのセキュリティの設計が中心です。営業部門ごと、地域ごとに見せる範囲が違う組織では、設計の考え方を説明できる人が頼りにされます。

### 拡張開発

標準機能と設定で足りない部分は開発で補います。Finance and Operations系の開発者向け資格は、X++による業務ロジックの開発、帳票やワークスペースの作成、画面の調整、Power Platformや外部システム向けのAPIの提供、テスト、性能の監視、アプリケーションライフサイクル管理（ALM）を挙げています。使う道具として、Visual Studio、Azure DevOps、Lifecycle Services、SQL Server Reporting Services、Power BIなどが並んでいます（Microsoft Learn、2026年10月時点）。

機能コンサルが自分で開発することは多くありません。ただ、開発で何ができ、どこに保守の負担が出るかを理解していると、開発の範囲を絞る提案に説得力が出ます。

### データ移行と連携

ERP系の移行では、マスタに加えて、期首の残高、未決済の債権債務、在庫の数量と評価額など、数字が合っていることを確かめる作業が重くなります。CRM系では、取引先や担当者の重複を整え、活動の履歴をどこまで移すかを決めることが論点です。

連携では、ERP系とCRM系の間で顧客や受注のデータをどちらで持ち、どちらからどちらへ流すかの設計が問われます。Power Platform側の機能を組み合わせる場面もありますが、それ自体の作り込みは別の専門領域として扱われることが多くあります。

### 更新への対応

Dynamics 365は、定期的な更新を前提に運用する製品です。更新のたびに、新しい機能を使うか、既存の設定や拡張に影響がないかを確かめる必要があります。Finance and Operations系のサービス更新では、回帰テストにRegression Suite Automation Tool（RSAT）のようなツールの利用が勧められています（Microsoft Learn、2026年10月時点）。テストのシナリオを作って回した経験は、保守の案件で評価されやすい部分です。

:::view
Dynamics 365の案件をご紹介していると、ERP系の面談では、製品の操作より「この取引が会計にどう載るか」を問われる場面をよく見ます。機能コンサルとして評価されやすいのは、担当モジュールの外にある会計や在庫への影響まで説明できる方です。業務部門の出身の方は、その経験を製品の言葉に置き換えて整理しておくことをおすすめします。
:::

## 経験の段階ごとの求められ方

| 段階 | 主に任されること | 次の段階に進むために足したい経験 |
|---|---|---|
| 担当者 | 決められた設計に沿った設定、テストの実行、移行データの準備 | 設定の理由を業務の言葉で説明する。テストのシナリオを自分で作る |
| 中堅 | 一つのモジュールの要件定義とFit&Gap、利用部門との合意、移行の計画 | 隣のモジュールや連携先との影響を見る。開発の範囲を絞る提案をする |
| リード | 複数モジュールにまたがる設計、標準化の判断、チームの取りまとめ | 法人や拠点をまたぐ展開、ERP系とCRM系の全体の構成 |

段階が上がるほど、作業の正確さより、判断の理由と影響の範囲を説明できるかが見られます。報酬との関係は[Dynamics 365コンサルの報酬の記事](/media/dynamics365-rate/)で解説しています。

## 認定資格の位置づけ

2026年10月時点で、Microsoft Learnでは、Finance（MB-310）、Supply Chain Management（MB-330）、Customer Service（MB-230）の機能コンサル向け資格と、Finance and Operations系の開発者向け資格（MB-500）が案内されています。これらの資格は12か月ごとに、Microsoft Learn上の無料のオンライン評価に合格して更新する仕組みです。

一方で、資格の構成は見直しが続いています。Sales の機能コンサル向け資格は2024年11月30日に、Finance and Operations系のソリューションアーキテクト向け資格（MB-700）は2026年6月30日に提供を終えています。Sales を中心にした Customer Experience Analyst の資格も、2026年10月時点で提供終了と表示されています。

資格は、学んだ範囲を示す材料にはなりますが、案件では実際に担った役割と判断が重視されます。提供終了になった資格は、取得した事実と年月を書いたうえで、現在の有効期限の状態を正確に記すことをおすすめします。Azure全般の資格は[Azure認定資格の記事](/media/cert-azure/)、データの可視化は[Power BIの資格の記事](/media/cert-power-bi/)もご覧ください。

:::caution
資格名や試験の範囲は短い期間で変わることがあります。スキルシートや面談で資格に触れる前に、Microsoft Learnの資格のページで現在の状態を必ずご確認ください。提供終了の資格を「保有中」と書くと、経歴全体の正確さを疑われるおそれがあります。
:::

## スキルの示し方

スキルシートでは、プロジェクトごとに領域、モジュール、役割、工程、判断した点をそろえて書くと、スキルの深さが伝わります。書き方と架空の記入例は[Dynamics 365コンサルのスキルシートの記事](/media/dynamics365-skillsheet/)で紹介しています。ほかの製品との違いを確かめたい方は、[SAP FI/COコンサルのスキルの記事](/media/sap-fico-skills/)や[Salesforceのスキルの記事](/media/salesforce-skills/)も参考になります。

:::view
当社では、案件をご案内する前に、稼働日数・リモートの希望・ご希望の金額を伺い、合う案件だけをお出ししています。経歴は、ご本人の了承を得た案件にだけ、氏名・連絡先を伏せて提案しています。Dynamics 365の案件は、機能コンサルとテクニカルの境目や、担うモジュールの範囲が案件ごとに違うため、担える範囲と担いたくない作業をはっきりさせておくと、条件を照らし合わせやすくなります。
:::

:::point
- ERP系は会計・物流の業務知識とマスタの設計、CRM系は業務の型の整理とデータ・セキュリティの設計が中心
- どの役割でも、標準機能との差を見極め、開発の範囲を絞る判断が問われる
- 認定資格は12か月ごとの更新があり、構成の見直しも続いているため、最新の状態を確かめて示す
:::

## よくある質問

### 簿記の知識がないとERP系の案件は難しいですか？

会計のモジュールを担う場合は、仕訳と決算の流れを理解していることが前提になります。販売や在庫のモジュールでも、取引が会計にどう載るかを聞かれることがあります。簿記の学習は、業務知識の土台として役に立ちます。

### CRM系の案件でもプログラミングは必要ですか？

機能コンサルとして参画する場合、開発そのものを担うことは多くありません。ただ、標準機能と設定でどこまでできるか、開発すると何が増えるかを理解していると、要件をまとめやすくなります。開発の担当者として参画する場合は、Dataverse上の拡張や連携の実務経験が求められます。

### Power Platformのスキルはどこまで必要ですか？

Dynamics 365の業務アプリと組み合わせて、画面の追加や自動化に使われることがあります。案件によっては基本的な理解を求められますが、Dynamics 365の案件で中心になるのは業務アプリの設計です。Power Platform自体を専門にする働き方は、別の職種として探すほうが条件を比べやすくなります。
