## 概要

当日のテレビ番組を特定のキーワードから検索し、Slack ワークフローに通知するアプリです。

## 事前準備

- `src/index.ts`の下記箇所を編集する
  - `SLACK_WORKFLOW_URL`
    - Slack ワークフローの Webhook URL を設定する
  - `KEYWORD`
    - 検索したいテレビ番組のキーワード

## 起動方法

```
npm install
npm run dev
```

## デプロイ方法

```
npm run deploy
```

## Cron の設定を編集する

wrangler.toml の下記の箇所を編集してデプロイする

```
[triggers]
crons = ["0 1 * * *"]
```

[テレビ番組表 G ガイド](https://bangumi.org/)よりデータを取得しています。
