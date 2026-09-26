# ラストピース LP

スマートフォン向け Web アプリ「ラストピース」（提案モック）のランディングページです。軸は「誰に＝サンリオ好きのみんな（推しがいて、友達といっしょが好きな人）」「何を＝ふたり以上そろわないと回せない限定グッズオリジナルガチャ」。ヒーロー → 誰に → どんなサービス（3 ステップ＋体験の中心）→ CTA の構成で、見た目はパステル・ステッカー風（丸ゴシック、白フチ、ハート・星の飾り）です。**LP 上では運営企業名を出しません**（利用者の指示）。**提案モック・公式サービスではありません。**

- 公開 URL: https://doc-gif.github.io/lastpiece-lp/
- 動くモック（デモ）: https://doc-gif.github.io/jtcc-group-e/ （[アプリのリポジトリ](https://github.com/doc-gif/jtcc-group-e)）
- 配色・文言・きまりの根拠: アプリ側の [`docs/PRODUCT.md`](https://github.com/doc-gif/jtcc-group-e/blob/main/docs/PRODUCT.md) と配色「さくらミルク」（`src/index.css`）。デザインの管理先は同じ [Figma ファイル](https://www.figma.com/design/yeDF1BwhrxpXI57Daainle?node-id=267-8198)（ピンク基調のデザインマスター）。

## 構成

- `site/`: 公開するファイルそのもの（ビルドなし）。`index.html`、`styles.css`、`assets/`（アプリと同じオリジナル生成素材のコピー）。
- `tests/lp.spec.ts`: Playwright + axe による確認。WCAG AA、操作領域 44px 以上、320px で横はみ出しなし、文字 200% でも横スクロールなし、動きを減らす設定で連続アニメーションなし、禁止語（換金など）を使っていないこと、デモへのリンク先。
- `.github/workflows/deploy.yml`: push と PR でテストを実行し、`main` では成功後に `site/` を GitHub Pages へ公開。

## ローカルで確認する

```bash
pnpm install
pnpm exec playwright install chromium
pnpm serve        # http://127.0.0.1:4180/lastpiece-lp/
pnpm test
```

## タスクと並行作業

作業は GitHub Issue を指示書にして進める。親 Issue の割り当て表で「誰が・どのファイルを・どの状態で」担当しているかが見える。ルールは [docs/AGENT_TASKS.md](docs/AGENT_TASKS.md)。現在の親 Issue: [#1 LP 流入メトリクス](https://github.com/doc-gif/lastpiece-lp/issues/1)（サブタスク #2〜#6 は並行可）。

## 変更するときのきまり

- 画像は原則 `site/assets/` のオリジナル素材を使う。作品名は取り扱い商品の事実として文字だけで書く。
- **例外（2026-09-26、オーナー判断）:** `site/assets/photos/` にサンリオ公式の商品写真（内部素材ライブラリの L001–L020・P001–P020 の一部、480px に縮小）を置いている。アプリ側 `docs/ASSET_LIBRARY.md` の「公開先へコピーしない」ルールに対する例外で、オーナーがリスクを了承して公開 LP に使うと決めた。LP には出典（© SANRIO CO., LTD.）と提案説明用である旨を表示する。権利者から指摘があれば直ちに削除し、オリジナル素材に戻す。他の公式画像・キャラクターイラストは追加しない。
- 「換金」「必ず当たる」「還元率100%」「大当たり」「中当たり」を使わない。「オタク」など人をくくる硬い言葉も使わず、「みんな」「あなたと友達」のようなやわらかい表現にする（利用者の指示 2026-09-26）。等級は文字で出さず、光り方で表す。
- 「提案モック・公式サービスではありません」と、商品・価格・在庫・確率が架空データである注記を消さない。
- 320px から確認し、本文 17px、コントラスト 4.5:1、操作領域 44px 以上を保つ。`pnpm test` に成功してから `main` へ入れる。

## QR コード

```bash
pnpm qr https://doc-gif.github.io/lastpiece-lp/ qr.png
```
