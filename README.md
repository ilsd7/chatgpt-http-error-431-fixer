# ChatGPT HTTP ERROR 431 Fixer

[English](README.md) · [한국어](docs/README.ko.md) · [日本語](docs/README.ja.md) · [简体中文](docs/README.zh-CN.md) · [Español](docs/README.es.md)

> **Fully local** · **No network access** · **Privacy-first**

A small tool that safely cleans up accumulated temporary-chat cookies to prevent recurring HTTP ERROR 431 when using ChatGPT.

Temporary chats create `conv_key_*` cookies that expire one month later. With frequent use, dozens or more of these cookies can accumulate, making the request header large enough to trigger HTTP ERROR 431 in Chromium (`Request Header Fields Too Large`). Only those cookies are removed; login cookies and every other ChatGPT cookie remain untouched.

## Download and install

Get the files from the [latest GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest).

The unpacked extension and userscript do not update automatically. Install each new release manually.

### Chromium: browser extension

Use the extension if you want automatic cleanup. It requires Chromium 119 or later.

1. Download the extension ZIP from the release assets and extract it.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted folder, or drag the extracted folder onto the Extensions page.

Immediately after installation, the extension checks whether a temporary-chat tab is open and deletes matching cookies only if none is open. After a successful cleanup, it checks again three hours later. If a temporary-chat tab is open at that time, it does not delete anything and checks every 30 minutes until the tab is closed. It also deletes matching cookies immediately when the browser is relaunched after being fully closed. When clicked, the toolbar button checks for an open temporary-chat tab, immediately deletes matching cookies if none is open, and shows the number removed on its badge. If a temporary-chat tab is open, nothing is deleted.

Firefox cannot run this extension because it does not support Manifest V3 background service workers. Use the userscript instead.

### Firefox or manual use: userscript

Use the userscript if you prefer to decide when cookies are removed. It never deletes cookies automatically. On Chromium, prefer the extension above; use Tampermonkey Beta only when manual cleanup is required.

Violentmonkey 2.43.x and 2.44.0 cannot enumerate cookies on Chromium 150 because they add Firefox-only `firstPartyDomain` to Chromium's cookie API request. A userscript cannot remove a field added inside the manager's service worker. Use the Chromium extension or Tampermonkey Beta instead.

1. On Firefox, install [Violentmonkey](https://violentmonkey.github.io/). On Chromium, install Tampermonkey Beta only if you are not using the extension.
2. On Chromium 138 or later, open the userscript manager's extension details and enable **Allow User Scripts**.
3. Download `chatgpt-http-error-431-fixer.user.js` from the release assets.
4. Import the downloaded file into the userscript manager, or create a new script and paste its contents.

The script adds these commands to the userscript manager's menu:

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

The target cookies are HttpOnly. When using Violentmonkey on Firefox, enable both settings below:

1. Global advanced setting: **Allow GM_cookie to access HTTP-only cookies**
2. Script setting: **Allow access to HTTP-only cookies**

Only grant this powerful permission to scripts you have reviewed and trust.

As of July 2026, Violentmonkey is recommended for Firefox. On Chromium, the browser extension is recommended; Tampermonkey Beta also supports manual cleanup but is not regularly tested by this project. Tampermonkey stable and FireMonkey cannot access the target HttpOnly cookies.

## What gets deleted

A cookie is removed only when both conditions are true:

- Its normalized domain is exactly `chatgpt.com`.
- Its name starts with exactly `conv_key_`.

The extension checks ordinary and partitioned cookies. The userscript checks ordinary cookies and the ChatGPT partition; it does not start deleting unless both queries succeed. If only the partition query is unavailable, **Count** reports an explicitly marked ordinary-cookie-only count. Login cookies and other ChatGPT cookies are never cleanup targets.

## Privacy and security

Everything runs locally. There are no analytics, telemetry, remote code, external libraries, or self-initiated network requests. Cookie values are never stored, logged, displayed, or sent.

The extension requests only:

- `cookies` to find and remove matching `chatgpt.com` cookies
- `alarms` to schedule three-hour checks and 30-minute retries
- `storage` to remember the last successful cleanup time
- `https://chatgpt.com/*` to limit cookie and tab access to ChatGPT

No build is required. Release files contain unminified source copied directly from the repository, so you can inspect them before installation. There is no separate binary-verification process.

See the [Security Policy](SECURITY.md) for vulnerability reporting instructions.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

## Notes

This tool does not fix every cause of HTTP ERROR 431. It only addresses the case caused by accumulated temporary-chat cookies.

ChatGPT is a trademark of OpenAI. This is an independent personal project.
