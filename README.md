# chatgpt-http-error-431-fixer

[English](README.md) · [한국어](docs/README.ko.md) · [日本語](docs/README.ja.md) · [简体中文](docs/README.zh-CN.md) · [Español](docs/README.es.md)

> **Fully local** · **No network access** · **Privacy-first**

Prevents recurring HTTP 431 errors on ChatGPT by safely cleaning up accumulated temporary-chat cookies.

Temporary chats create `conv_key_*` cookies that expire one month later. With frequent use, dozens or more of these cookies can accumulate, making the request header large enough to trigger **HTTP 431: Request Header Fields Too Large**. Only those cookies are removed; login cookies and every other ChatGPT cookie remain untouched.

## Download and install

Get the files from the [latest GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest).

### Chromium: browser extension

Use the extension if you want automatic cleanup. It requires Chromium 119 or later.

1. Download the extension ZIP from the release assets and extract it.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted folder.

The extension removes matching cookies when the browser starts, then checks again three hours after each successful cleanup. If a temporary-chat tab is open, it waits 30 minutes before trying again. The toolbar button runs the same temporary-chat-aware cleanup whenever you want.

Firefox cannot run this extension because it does not support Manifest V3 background service workers. Use the userscript instead.

### Firefox or manual use: userscript

Use the userscript if you prefer to decide when cookies are removed. It never deletes cookies automatically.

1. Install [Violentmonkey](https://violentmonkey.github.io/) or Tampermonkey Beta.
2. Download `chatgpt-http-error-431-fixer.user.js` from the release assets.
3. Import the downloaded file into the userscript manager, or create a new script and paste its contents.

The script adds these commands to the userscript manager's menu:

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

The target cookies are HttpOnly. In Violentmonkey, enable both settings below:

1. Global advanced setting: **Allow GM_cookie to access HTTP-only cookies**
2. Script setting: **Allow access to HTTP-only cookies**

Only grant this powerful permission to scripts you have reviewed and trust.

As of July 2026, Violentmonkey is the recommended option and works on Chromium and Firefox. Tampermonkey Beta also works but is not regularly tested by this project. Tampermonkey stable and FireMonkey cannot access the target HttpOnly cookies.

## What gets deleted

A cookie is removed only when both conditions are true:

- Its normalized domain is exactly `chatgpt.com`.
- Its name starts with exactly `conv_key_`.

Both ordinary and partitioned cookies are included. Login cookies and other ChatGPT cookies are never cleanup targets.

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

This tool does not fix every cause of HTTP 431. It only addresses errors caused by accumulated temporary-chat cookies.

ChatGPT is a trademark of OpenAI. This is an independent personal project.
