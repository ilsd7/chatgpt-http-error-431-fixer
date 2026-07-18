// ==UserScript==
// @name         ChatGPT HTTP ERROR 431 Fixer (Manual)
// @namespace    https://github.com/ilsd7/chatgpt-http-error-431-fixer
// @version      1.0.0
// @description  Prevents recurring HTTP ERROR 431 when using ChatGPT by safely cleaning up accumulated temporary-chat cookies.
// @license      Apache-2.0
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @noframes
// @grant        GM.cookie
// @grant        GM.registerMenuCommand
// @downloadURL  none
// @updateURL    none
// ==/UserScript==

(() => {
  'use strict';

  // No fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon, @require,
  // remote code, analytics, or telemetry. Cookie values are never stored,
  // printed, or transmitted.
  const CHATGPT_ORIGIN = 'https://chatgpt.com';
  const COOKIE_DOMAIN = 'chatgpt.com';
  const COOKIE_PREFIX = 'conv_key_';

  function normalizedCookieDomain(domain) {
    return String(domain || '').replace(/^\./, '').toLowerCase();
  }

  function isTargetCookie(cookie) {
    return normalizedCookieDomain(cookie.domain) === COOKIE_DOMAIN
      && typeof cookie.name === 'string'
      && cookie.name.startsWith(COOKIE_PREFIX);
  }

  function cookieIdentity(cookie) {
    return JSON.stringify([
      cookie.storeId ?? null,
      cookie.domain,
      cookie.path,
      cookie.name,
      cookie.partitionKey ?? null,
      cookie.firstPartyDomain ?? null,
    ]);
  }

  function removalUrl(cookie) {
    const path = typeof cookie.path === 'string' && cookie.path.startsWith('/')
      ? cookie.path
      : '/';
    return `${CHATGPT_ORIGIN}${path}`;
  }

  async function optionalCookieList(details) {
    try {
      return await GM.cookie.list(details);
    } catch (error) {
      console.warn('[conv_key cleaner] optional cookie query skipped:', error);
      return [];
    }
  }

  async function listTargetCookies() {
    if (!GM?.cookie?.list || !GM?.cookie?.delete) {
      throw new Error('GM.cookie is not available in this userscript manager.');
    }

    const ordinary = await GM.cookie.list({ domain: COOKIE_DOMAIN });
    const partitionedForChatGPT = await optionalCookieList({
      domain: COOKIE_DOMAIN,
      partitionKey: { topLevelSite: CHATGPT_ORIGIN },
    });
    const partitionedAny = await optionalCookieList({
      domain: COOKIE_DOMAIN,
      partitionKey: {},
    });

    const found = new Map();
    for (const cookie of [
      ...ordinary,
      ...partitionedForChatGPT,
      ...partitionedAny,
    ]) {
      if (isTargetCookie(cookie)) {
        found.set(cookieIdentity(cookie), cookie);
      }
    }
    return [...found.values()];
  }

  async function removeTargetCookie(cookie) {
    const details = {
      url: removalUrl(cookie),
      name: cookie.name,
    };

    if (cookie.partitionKey !== undefined) {
      details.partitionKey = cookie.partitionKey;
    }
    if (cookie.firstPartyDomain !== undefined) {
      details.firstPartyDomain = cookie.firstPartyDomain;
    }

    await GM.cookie.delete(details);
  }

  async function inspectOnly() {
    try {
      const cookies = await listTargetCookies();
      alert(
        `Found ${cookies.length} conv_key_* cookie(s).\n`
        + 'No cookie values were shown, stored, or sent.\n\n'
        + 'If the count is 0 but the cookies appear in developer tools, allow this script to access HttpOnly cookies in your userscript manager.',
      );
    } catch (error) {
      alert(`Check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function cleanNow() {
    try {
      const cookies = await listTargetCookies();
      let removedCount = 0;
      let failedCount = 0;

      for (const cookie of cookies) {
        try {
          await removeTargetCookie(cookie);
          removedCount += 1;
        } catch (error) {
          failedCount += 1;
          console.error(
            `[conv_key cleaner] failed to delete ${cookie.name} at ${cookie.domain}${cookie.path}:`,
            error,
          );
        }
      }

      alert(
        `Found: ${cookies.length} / Removed: ${removedCount} / Failed: ${failedCount}`,
      );
    } catch (error) {
      alert(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  GM.registerMenuCommand('Count conv_key_* cookies', () => void inspectOnly());
  GM.registerMenuCommand('Delete conv_key_* cookies now', () => void cleanNow());
})();
