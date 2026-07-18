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

  async function tryCookieList(details, label) {
    try {
      return { ok: true, cookies: await GM.cookie.list(details) };
    } catch (error) {
      console.warn(`[conv_key cleaner] ${label} cookie query failed:`, error);
      return { ok: false, cookies: [] };
    }
  }

  async function listTargetCookies() {
    if (!GM?.cookie?.list || !GM?.cookie?.delete) {
      throw new Error('GM.cookie is not available in this userscript manager.');
    }

    const ordinary = await tryCookieList({
      domain: COOKIE_DOMAIN,
    }, 'ordinary');
    const partitionedForChatGPT = await tryCookieList({
      domain: COOKIE_DOMAIN,
      partitionKey: { topLevelSite: CHATGPT_ORIGIN },
    }, 'partitioned-chatgpt');
    const partitionedAny = await tryCookieList({
      domain: COOKIE_DOMAIN,
      partitionKey: {},
    }, 'partitioned-all');

    const found = new Map();
    for (const cookie of [
      ...ordinary.cookies,
      ...partitionedForChatGPT.cookies,
      ...partitionedAny.cookies,
    ]) {
      if (isTargetCookie(cookie)) {
        found.set(cookieIdentity(cookie), cookie);
      }
    }

    // The ChatGPT-specific query is supplemental. Only the all-partitions query
    // can prove that partitioned enumeration was complete.
    return {
      cookies: [...found.values()],
      complete: ordinary.ok && partitionedAny.ok,
    };
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
      const listing = await listTargetCookies();
      if (!listing.complete) {
        throw new Error('Cookie enumeration was incomplete.');
      }
      alert(
        `Found ${listing.cookies.length} conv_key_* cookie(s).\n`
        + 'No cookie values were shown, stored, or sent.\n\n'
        + 'If the count is 0 but the cookies appear in developer tools, allow this script to access HttpOnly cookies in your userscript manager.',
      );
    } catch (error) {
      alert(`Check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function cleanNow() {
    try {
      const listing = await listTargetCookies();
      if (!listing.complete) {
        throw new Error('Cookie enumeration was incomplete.');
      }

      let completedDeleteCount = 0;
      let failedCount = 0;

      for (const cookie of listing.cookies) {
        try {
          await removeTargetCookie(cookie);
          completedDeleteCount += 1;
        } catch (error) {
          failedCount += 1;
          console.error(
            `[conv_key cleaner] failed to delete ${cookie.name} at ${cookie.domain}${cookie.path}:`,
            error,
          );
        }
      }

      const verification = await listTargetCookies();
      const remainingCount = verification.cookies.length;
      const cleanupComplete = failedCount === 0
        && verification.complete
        && remainingCount === 0;
      const remainingLabel = verification.complete ? String(remainingCount) : 'unknown';
      alert(
        `Cleanup ${cleanupComplete ? 'complete' : 'incomplete'}.\n`
        + `Found: ${listing.cookies.length} / Delete requests completed: ${completedDeleteCount} / `
        + `Failed: ${failedCount} / Remaining: ${remainingLabel}`,
      );
    } catch (error) {
      alert(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  GM.registerMenuCommand('Count conv_key_* cookies', () => void inspectOnly());
  GM.registerMenuCommand('Delete conv_key_* cookies now', () => void cleanNow());
})();
