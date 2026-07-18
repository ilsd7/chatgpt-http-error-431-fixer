# chatgpt-http-error-431-fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **ローカルで完結** · **ネットワークアクセスなし** · **プライバシー重視**

蓄積した一時チャットの Cookie を安全に削除し、ChatGPT で HTTP 431 エラーが繰り返し発生するのを防ぎます。

一時チャットを使うと、1か月後に期限切れになる `conv_key_*` Cookie が次々に作成されます。頻繁に使うと数十個以上に増え、リクエストヘッダーが大きくなって **HTTP 431: Request Header Fields Too Large** エラーが発生することがあります。削除するのは蓄積したこれらの Cookie だけで、ログイン Cookie を含むほかの ChatGPT Cookie には触れません。

## ダウンロードとインストール

[最新の GitHub リリース](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) からファイルをダウンロードしてください。

### Chromium：拡張機能

自動的にクリーンアップしたい場合は拡張機能を使います。Chromium 119 以降が必要です。

1. リリースの添付ファイルから拡張機能の ZIP をダウンロードし、展開します。
2. `chrome://extensions` を開きます。
3. **デベロッパーモード**を有効にします。
4. **パッケージ化されていない拡張機能を読み込む**を選び、展開したフォルダーを指定します。

拡張機能はブラウザーの起動時に対象 Cookie を削除し、クリーンアップに成功してから3時間後にもう一度確認します。一時チャットのタブが開いている場合は、30分後に再試行します。必要なときはツールバーボタンを押すと、同じように一時チャットのタブを確認してからクリーンアップできます。

Firefox は Manifest V3 のバックグラウンド Service Worker をサポートしていないため、この拡張機能を実行できません。代わりにユーザースクリプトを使ってください。

### Firefox または手動で使う場合：ユーザースクリプト

削除するタイミングを自分で決めたい場合はユーザースクリプトを使います。Cookie を自動的に削除することはありません。

1. [Violentmonkey](https://violentmonkey.github.io/) または Tampermonkey Beta をインストールします。
2. リリースの添付ファイルから `chatgpt-http-error-431-fixer.user.js` をダウンロードします。
3. ダウンロードしたファイルをユーザースクリプトマネージャーにインポートするか、新しいスクリプトを作成してファイルの内容を貼り付けます。

インストールすると、ユーザースクリプトマネージャーのメニューに次のコマンドが追加されます。

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

対象 Cookie は HttpOnly です。Violentmonkey では、次の2つの設定を有効にしてください。

1. グローバル詳細設定: **Allow GM_cookie to access HTTP-only cookies**
2. スクリプト設定: **Allow access to HTTP-only cookies**

強力な権限なので、内容を確認し、信頼できるスクリプトにだけ許可してください。

2026年7月現在は Violentmonkey を推奨しており、Chromium と Firefox で利用できます。Tampermonkey Beta も動作しますが、このプロジェクトでは定期的にテストしていません。Tampermonkey の安定版と FireMonkey は、対象の HttpOnly Cookie にアクセスできません。

## 削除対象の Cookie

次の両方に当てはまる場合だけ削除します。

- 正規化後のドメインが `chatgpt.com` と完全に一致する
- 名前が `conv_key_` で始まる

通常の Cookie とパーティション Cookie の両方を確認します。ログイン Cookie や、ほかの ChatGPT Cookie は削除対象ではありません。

## プライバシーとセキュリティ

すべての処理はローカルで完結します。分析、テレメトリー、リモートコード、外部ライブラリはなく、ツール自身がネットワークリクエストを送ることもありません。Cookie の値を保存、記録、表示、送信することもありません。

拡張機能が要求する権限は次のとおりです。

- `cookies`: 一致する `chatgpt.com` Cookie の確認と削除
- `alarms`: 3時間後の確認と30分後の再試行
- `storage`: 最後にクリーンアップに成功した時刻を保存
- `https://chatgpt.com/*`: Cookie とタブへのアクセスを ChatGPT に限定

ビルドは不要です。リリースファイルには、リポジトリのソースコードをミニファイも変換もせず、そのまま収録しているため、インストール前に内容を確認できます。別途バイナリを検証する手順はありません。

脆弱性の報告方法は [セキュリティポリシー](../SECURITY.md) をご覧ください。

## ライセンス

[Apache License 2.0](../LICENSE) の下で配布されています。

## 補足

このツールですべての HTTP 431 エラーを解決できるわけではありません。蓄積した一時チャットの Cookie が原因の場合にのみ有効です。

ChatGPT は OpenAI の商標です。このリポジトリは個人が作成した独立プロジェクトです。
