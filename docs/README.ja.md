# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **ローカルで完結** · **ネットワークアクセスなし** · **プライバシー重視**

蓄積した一時チャットの Cookie を安全に削除し、ChatGPT の利用中に HTTP ERROR 431 が繰り返し発生するのを防ぐ小さなツールです。

ChatGPT の Web 版で一時チャットを使うと、1か月後に期限切れになる `conv_key_*` Cookie が次々に作成されます。一時チャットを頻繁に使うと Cookie が数十個以上蓄積してリクエストヘッダーが大きくなり、HTTP ERROR 431（`Request Header Fields Too Large`）が発生することがあります。

このように蓄積した Cookie だけを削除し、ログイン Cookie を含むほかの ChatGPT Cookie には触れません。

## ダウンロードとインストール

[最新の GitHub リリース](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) には、Chromium 拡張機能と手動インストール用のユーザースクリプトが含まれています。ユーザースクリプトは、ユーザースクリプトマネージャーを通じて更新を受け取れる Greasy Fork からのインストールを推奨します。

パッケージ化されていない Chromium 拡張機能は自動更新されないため、新しいリリースを手動でインストールしてください。

### Chromium：拡張機能

自動的にクリーンアップしたい場合は拡張機能を使います。Chromium 119 以降が必要です。

1. リリースの添付ファイルから拡張機能の ZIP をダウンロードし、展開します。
2. `chrome://extensions` を開きます。
3. **デベロッパーモード**を有効にします。
4. **パッケージ化されていない拡張機能を読み込む**を選んで展開したフォルダーを指定するか、そのフォルダーを拡張機能ページにドラッグします。

拡張機能はインストール直後に一時チャットのタブが開いているか確認し、開いていなければ対象 Cookie をすぐに削除します。クリーンアップに成功すると3時間後に確認し、その時点で一時チャットのタブが開いている場合は削除せず、タブが閉じるまで30分ごとに確認します。

ブラウザーを完全に終了してから起動した場合も、対象 Cookie をすぐに削除します。ツールバーボタンをクリックすると、まず開いている一時チャットのタブを確認し、なければ対象 Cookie をすぐに削除して、削除した件数をバッジに表示します。一時チャットのタブが開いている場合は何も削除しません。

Firefox は Manifest V3 のバックグラウンド Service Worker をサポートしていないため、この拡張機能を実行できません。代わりにユーザースクリプトを使ってください。

### Firefox または手動で使う場合：ユーザースクリプト

Firefox を利用している場合や、ブラウザー拡張機能を使いたくない場合は、ユーザースクリプトを利用できます。ユーザースクリプトは自動削除に対応していません。手動削除は一時チャットのタブが開いているかどうかにかかわらず実行されるため、注意してください。Chromium では上記のブラウザー拡張機能を推奨します。

現在、Violentmonkey は Firefox 専用の `firstPartyDomain` を Chromium の Cookie API リクエストに追加するため、Chromium では使用できません。対象 Cookie は HttpOnly のため、Tampermonkey は Beta 版を使用する必要があります。

1. ブラウザーに合ったユーザースクリプトマネージャーをインストールします。
   - Firefox: [Violentmonkey](https://violentmonkey.github.io/) または [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=firefox)
   - Chromium: [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=chrome)
2. Chromium 138 以降では、ユーザースクリプトマネージャー拡張機能の詳細を開き、**Allow User Scripts** を有効にします。
3. [Greasy Fork のスクリプトページ](https://greasyfork.org/ja/scripts/587874-chatgpt-http-error-431-fixer-manual)を開き、**このスクリプトをインストール**を選択します。
4. ユーザースクリプトマネージャーの確認画面でインストールを承認します。

別の方法として、[最新の GitHub リリース](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) から `chatgpt-http-error-431-fixer.user.js` をダウンロードし、ユーザースクリプトマネージャーにインポートできます。この方法で手動インストールしたスクリプトは自動更新されません。

インストールすると、ユーザースクリプトマネージャーのメニューに次のコマンドが追加されます。

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

Firefox で Violentmonkey を使う場合は、次の2つの設定を有効にしてください。

1. グローバル詳細設定: **Allow GM_cookie to access HTTP-only cookies**
2. スクリプト設定: **Allow access to HTTP-only cookies**

強力な権限なので、内容を確認し、信頼できるスクリプトにだけ許可してください。

## 削除対象の Cookie

次の両方に当てはまる場合だけ削除します。

- 正規化後のドメインが `chatgpt.com` と完全に一致する
- 名前が `conv_key_` で始まる

ログイン Cookie など、ほかの Cookie は削除対象になりません。

## プライバシーとセキュリティ

すべての処理はローカルで完結します。分析、テレメトリー、リモートコード、外部ライブラリはなく、ツール自身がネットワークリクエストを送ることもありません。Cookie の値を保存、記録、表示、送信することもありません。

拡張機能が要求する権限は次のとおりです。

- `cookies`: 一致する `chatgpt.com` Cookie の確認と削除
- `alarms`: 3時間後の確認と30分後の再試行
- `storage`: 最後にクリーンアップに成功した時刻を保存
- `https://chatgpt.com/*`: Cookie とタブへのアクセスを ChatGPT に限定

ビルドは不要です。GitHub リリースのファイルと Greasy Fork で公開されるユーザースクリプトには、リポジトリのソースコードがミニファイも変換もされず、そのまま収録されているため、インストール前に内容を確認できます。別途バイナリを検証する手順はありません。

脆弱性の報告方法は [セキュリティポリシー](../SECURITY.md) をご覧ください。

それ以外の問題は、[GitHub Issues](https://github.com/ilsd7/chatgpt-http-error-431-fixer/issues) でお知らせください。

## ライセンス

[Apache License 2.0](../LICENSE) の下で配布されています。

## 補足

このツールですべての HTTP ERROR 431 の原因を解決できるわけではありません。蓄積した一時チャットの Cookie が原因の場合にのみ有効です。

ChatGPT は OpenAI の商標です。このリポジトリは個人が作成した独立プロジェクトです。
