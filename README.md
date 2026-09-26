# ラストピース LP

スマートフォン向け Web アプリ「ラストピース」（提案モック）のランディングページです。即完売で買えなかった限定グッズを JTCC が買い取り・検品し、確率を公開したガチャとして届け、友達といっしょに回す、というサービス提案を 1 ページで紹介します。**提案モック・公式サービスではありません。**

- 公開 URL: https://doc-gif.github.io/jtcc-lastpiece-lp/
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
pnpm serve        # http://127.0.0.1:4180/jtcc-lastpiece-lp/
pnpm test
```

## 変更するときのきまり

- 画像は `site/assets/` のオリジナル素材だけを使う。サンリオ等の公式画像・ロゴ・キャラクター絵、内部検討用の商品写真は置かない。作品名は取り扱い商品の事実として文字だけで書く。
- 「換金」「必ず当たる」「還元率100%」「大当たり」「中当たり」を使わない。等級は文字で出さず、光り方で表す。
- 「提案モック・公式サービスではありません」と、商品・価格・在庫・確率が架空データである注記を消さない。
- 320px から確認し、本文 17px、コントラスト 4.5:1、操作領域 44px 以上を保つ。`pnpm test` に成功してから `main` へ入れる。

## QR コード

```bash
pnpm qr https://doc-gif.github.io/jtcc-lastpiece-lp/ qr.png
```
