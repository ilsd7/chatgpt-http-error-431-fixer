# ChatGPT HTTP ERROR 431 Fixer

[English](README.md) · [한국어](docs/README.ko.md) · [日本語](docs/README.ja.md) · [简体中文](docs/README.zh-CN.md) · [Español](docs/README.es.md)

> **Fully local** · **No network access** · **Privacy-first**

A small tool that safely cleans up accumulated temporary-chat cookies to prevent recurring HTTP ERROR 431 when using ChatGPT.

When you use temporary chats on the ChatGPT website, `conv_key_*` cookies are continually created and expire after one month. Frequent use can cause dozens or more to accumulate, increasing the size of request headers and potentially triggering HTTP ERROR 431 (`Request Header Fields Too Large`).

Only these accumulated cookies are removed; login cookies and every other ChatGPT cookie remain untouched.

## Download and install

The [latest GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) contains the Chromium extension and a manually installable copy of the userscript. For the userscript, installation from Greasy Fork is recommended because it can receive updates through the userscript manager.

The unpacked Chromium extension does not update automatically, so install each new release manually.

### Chromium: browser extension

Use the extension if you want automatic cleanup. It requires Chromium 119 or later.

1. Download the extension ZIP from the release assets and extract it.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted folder, or drag the extracted folder onto the Extensions page.

Immediately after installation, the extension checks whether a temporary-chat tab is open and deletes matching cookies only if none is open. After a successful cleanup, it checks again three hours later. If a temporary-chat tab is open at that time, it does not delete anything and checks every 30 minutes until the tab is closed.

It also deletes matching cookies immediately when the browser is relaunched after being fully closed. When clicked, the toolbar button checks for an open temporary-chat tab, immediately deletes matching cookies if none is open, and shows the number removed on its badge. If a temporary-chat tab is open, nothing is deleted.

Firefox cannot run this extension because it does not support Manifest V3 background service workers. Use the userscript instead.

### Firefox or manual use: userscript

If you use Firefox or prefer not to install the browser extension, you can use the userscript. It does not support automatic cleanup. Manual cleanup runs whether or not a temporary-chat tab is open, so use it with care. On Chromium, the browser extension above is recommended.

Violentmonkey currently cannot be used on Chromium because it adds the Firefox-only `firstPartyDomain` to Chromium's cookie API requests. The target cookies are HttpOnly, so you must use Tampermonkey Beta.

1. Install the userscript manager for your browser.
   - Firefox: [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=firefox)
   - Chromium: [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=chrome)
2. On Chromium 138 or later, open the userscript manager's extension details and enable **Allow User Scripts**.
3. Open the [script page on Greasy Fork](https://greasyfork.org/en/scripts/587874-chatgpt-http-error-431-fixer-manual) and select **Install this script**.
4. Confirm the installation in the userscript manager.

Alternatively, download `chatgpt-http-error-431-fixer.user.js` from the [latest GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) and import it into the userscript manager. This manually installed copy does not update automatically.

The script adds these commands to the userscript manager's menu:

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

When using Violentmonkey on Firefox, enable both settings below:

1. Global advanced setting: **Allow GM_cookie to access HTTP-only cookies**
2. Script setting: **Allow access to HTTP-only cookies**

Only grant this powerful permission to scripts you have reviewed and trust.

## What gets deleted

A cookie is removed only when both conditions are true:

- Its normalized domain is exactly `chatgpt.com`.
- Its name starts with exactly `conv_key_`.

Login cookies and all other cookies are never cleanup targets.

## Privacy and security

Everything runs locally. There are no analytics, telemetry, remote code, external libraries, or self-initiated network requests. Cookie values are never stored, logged, displayed, or sent.

The extension requests only:

- `cookies` to find and remove matching `chatgpt.com` cookies
- `alarms` to schedule three-hour checks and 30-minute retries
- `storage` to remember the last successful cleanup time
- `https://chatgpt.com/*` to limit cookie and tab access to ChatGPT

No build is required. The GitHub Release files and the userscript published on Greasy Fork contain unminified source copied directly from the repository, so you can inspect them before installation. There is no separate binary-verification process.

See the [Security Policy](SECURITY.md) for vulnerability reporting instructions.

For all other issues, please report them through [GitHub Issues](https://github.com/ilsd7/chatgpt-http-error-431-fixer/issues).

## License

This project is licensed under the [Apache License 2.0](LICENSE).

## Notes

This tool does not fix every cause of HTTP ERROR 431. It only addresses the case caused by accumulated temporary-chat cookies.

ChatGPT is a trademark of OpenAI. This is an independent personal project.
