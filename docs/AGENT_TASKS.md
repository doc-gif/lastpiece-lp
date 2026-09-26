# エージェントの作業ルール（並行作業・競合防止）

このリポジトリのタスクは GitHub Issue が指示書です。Issue だけを読んで着手できるように書いてあり、複数のエージェント（Claude Code、Codex、Copilot coding agent など）が同時に別の Issue を進める前提です。

## 1 タスク = 1 Issue = 1 ブランチ = 1 PR

- ブランチ名は `task/<Issue番号>-<短い英語>`（例: `task/2-analytics-base`）。`main` へ直接 push しない。
- PR の本文の先頭に `Closes #<Issue番号>` を書く。マージで Issue が自動的に閉じる。
- PR は CI（`Test`）が成功したらマージしてよい。レビュー待ちにしない。マージすると GitHub Pages に自動公開される。

## 着手・進行・完了の見える化

状態は **Issue のラベル** と **親 Issue の表** で見る。ダッシュボードは作らない。

| 状態 | やること |
| --- | --- |
| 着手 | Issue に「着手します。担当: `<エージェント名や人の名前>`、ブランチ: `task/N-...`」とコメントし、ラベル `in-progress` を付ける。すでに `in-progress` が付いている Issue には手を出さない。 |
| PR 作成 | ラベルを `review` に替え、PR の URL をコメントする。 |
| 詰まった | ラベル `blocked` を付け、何が必要かをコメントする（人の操作が必要な設定値など）。 |
| 完了 | PR をマージする。Issue が閉じたら、親 Issue の表の「状態」を `done` に書き換える。 |

親 Issue（例: [#1](https://github.com/doc-gif/lastpiece-lp/issues/1)）の表には、サブタスクごとに **担当・状態・触ってよいファイル・依存** を書く。着手時に「担当」欄を自分の名前に書き換える（Issue 本文の編集）。

## 競合を起こさないための境界

- 各 Issue に **「触ってよいファイル」** と **「触ってはいけないファイル」** を書いてある。範囲外を変更したくなったら、変更せずに Issue にコメントして別タスクにする。
- 同じ `site/index.html` を複数のタスクが触る場合は、Issue に書かれた **領域（`<head>` だけ、`<footer>` だけ、リンクの属性だけ）** に限定する。領域が重ならなければ Git のマージで衝突しない。
- 共有の設定値（GA4 測定 ID `G-3DDS1NJZXS`、Clarity プロジェクト ID `yo6yjo7ath`、`utm_campaign=pitch-2026-10`）は親 Issue のコメントが正。コード内に分散して書かず、`site/analytics.js` の先頭の定数だけに置く。
- PR を出す前に `git fetch origin && git merge origin/main` で最新を取り込み、`pnpm test` を通す。

## 依存関係と並行できる範囲

```
#2 計測タグ基盤 (analytics.js, <head>)  ─┐
#3 イベント計測 (events.js, リンク属性) ─┼─ 同時に着手可（ファイルが別）
#4 外部送信の公表ページ (privacy/, <footer>) ─┤
#5 UTM と QR (docs/utm.md, docs/qr/)   ─┤
#6 ダッシュボード・週次記録 (docs/metrics/) ─┘
doc-gif/jtcc-group-e#40 デモ側イベント（別リポジトリ） ── LP と同時に着手可
```

- #3 は #2 が入れる `window.lpTrack()` を呼ぶが、**#2 のマージを待たずに着手できる**（`window.lpTrack` が無ければ何もしない、という書き方にする）。動作確認だけ #2 マージ後に行う。
- #4・#5・#6 は完全に独立。
- 最後に、全部がマージされた状態で GA4 の DebugView と Clarity の録画を人が確認する（親 Issue の受け入れ条件）。

## 守ること

- 秘密情報（API シークレット、サービスアカウント鍵）をリポジトリに置かない。測定 ID・プロジェクト ID は公開値。
- 計測は `127.0.0.1`／`localhost`／CI／`?internal=1` では動かさない。`pnpm test` が計測タグを読み込まないことを確認する。
- ニックネーム・自由入力・IP などの個人情報をイベントに入れない。
- LP の文言・デザインは変えない（別の依頼として扱う）。「公式サービスではありません」の注記を消さない。
