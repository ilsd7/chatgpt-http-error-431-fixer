// ==UserScript==
// @name         ChatGPT HTTP ERROR 431 Fixer (Manual)
// @namespace    https://github.com/ilsd7/chatgpt-http-error-431-fixer
// @version      1.0.1
// @description  A small tool that safely cleans up accumulated temporary-chat cookies to prevent recurring HTTP ERROR 431 when using ChatGPT.
// @license      Apache-2.0
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @noframes
// @grant        GM.cookie
// @grant        GM_cookie
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
  const HTTP_ONLY_PERMISSION_HINT = 'If matching cookies appear in developer tools, '
    + 'allow this script to access HttpOnly cookies in your userscript manager.';

  class CookieApiCompatibilityError extends Error {}

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

  function asError(error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  function cookieApiError(error) {
    const normalized = asError(error);
    if (normalized.message.includes("Unexpected property: 'firstPartyDomain'")) {
      return new CookieApiCompatibilityError(
        "Unsupported setup: Violentmonkey's cookie API adds Firefox-only "
        + 'firstPartyDomain on Chromium. A userscript cannot bypass this. '
        + 'Use the bundled Chromium extension or Tampermonkey Beta.',
      );
    }
    return normalized;
  }

  function listCookies(details) {
    return new Promise((resolve, reject) => {
      const finish = (cookies, error) => {
        if (error) {
          reject(cookieApiError(error));
        } else if (Array.isArray(cookies)) {
          resolve(cookies);
        } else {
          reject(new Error('Cookie API did not return a cookie array.'));
        }
      };

      if (typeof GM_cookie !== 'undefined' && GM_cookie?.list) {
        try {
          // Violentmonkey 2.43 can collapse the GM.cookie bridge's error
          // channel into a non-array Promise result. GM_cookie preserves the
          // separate result/error callback arguments, so prefer it when granted.
          GM_cookie.list(details, finish);
        } catch (error) {
          reject(cookieApiError(error));
        }
        return;
      }

      let returned;
      try {
        // Some userscript-manager builds expose this as a Promise API, while
        // others complete the same GM.cookie call through its callback.
        returned = GM.cookie.list(details, finish);
      } catch (error) {
        reject(cookieApiError(error));
        return;
      }

      if (returned && typeof returned.then === 'function') {
        returned.then((cookies) => finish(cookies), (error) => reject(cookieApiError(error)));
      } else if (returned !== undefined) {
        finish(returned);
      }
    });
  }

  function deleteCookie(details) {
    return new Promise((resolve, reject) => {
      const finish = (error) => {
        if (error) {
          reject(cookieApiError(error));
        } else {
          resolve();
        }
      };

      if (typeof GM_cookie !== 'undefined' && GM_cookie?.delete) {
        try {
          GM_cookie.delete(details, finish);
        } catch (error) {
          reject(cookieApiError(error));
        }
        return;
      }

      let returned;
      try {
        returned = GM.cookie.delete(details, finish);
      } catch (error) {
        reject(cookieApiError(error));
        return;
      }

      if (returned && typeof returned.then === 'function') {
        returned.then(() => resolve(), (error) => reject(cookieApiError(error)));
      } else if (returned !== undefined) {
        resolve();
      }
    });
  }

  async function tryCookieList(details, label, optional = false) {
    try {
      return { ok: true, cookies: await listCookies(details) };
    } catch (error) {
      if (error instanceof CookieApiCompatibilityError) {
        throw error;
      }
      if (!optional) {
        console.warn(`[conv_key cleaner] ${label} cookie query failed:`, error);
      }
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
    }, 'partitioned-chatgpt', true);

    const found = new Map();
    for (const cookie of [
      ...ordinary.cookies,
      ...partitionedForChatGPT.cookies,
    ]) {
      if (isTargetCookie(cookie)) {
        found.set(cookieIdentity(cookie), cookie);
      }
    }

    // A cookie partitioned under another top-level site is not attached to a
    // top-level ChatGPT request, so it cannot contribute to ChatGPT's HTTP 431.
    return {
      cookies: [...found.values()],
      complete: ordinary.ok && partitionedForChatGPT.ok,
      ordinaryInspectionSucceeded: ordinary.ok,
      partitionedInspectionSucceeded: partitionedForChatGPT.ok,
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

    await deleteCookie(details);
  }

  async function inspectOnly() {
    try {
      const listing = await listTargetCookies();
      if (!listing.ordinaryInspectionSucceeded) {
        throw new Error('Cookie enumeration was incomplete.');
      }
      const partitionNote = listing.partitionedInspectionSucceeded
        ? ''
        : '\nPartitioned-cookie inspection is unavailable; this count covers ordinary cookies.';
      const httpOnlyNote = listing.cookies.length === 0
        ? `\n\n${HTTP_ONLY_PERMISSION_HINT}`
        : '';
      alert(
        `Found ${listing.cookies.length} conv_key_* cookie(s).${partitionNote}${httpOnlyNote}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert(error instanceof CookieApiCompatibilityError ? message : `Check failed: ${message}`);
    }
  }

  async function cleanNow() {
    try {
      const listing = await listTargetCookies();
      if (!listing.complete) {
        throw new Error('Cookie enumeration was incomplete.');
      }
      if (listing.cookies.length === 0) {
        alert(
          'Found 0 visible conv_key_* cookies.\n'
          + `No cookies were deleted.\n\n${HTTP_ONLY_PERMISSION_HINT}`,
        );
        return;
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
      const verificationNote = verification.complete
        ? ''
        : '\nPost-cleanup cookie verification was incomplete.';
      alert(
        `Cleanup ${cleanupComplete ? 'complete' : 'incomplete'}.\n`
        + `Found: ${listing.cookies.length} / Delete requests completed: ${completedDeleteCount} / `
        + `Failed: ${failedCount} / Remaining: ${remainingLabel}${verificationNote}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert(error instanceof CookieApiCompatibilityError ? message : `Cleanup failed: ${message}`);
    }
  }

  GM.registerMenuCommand('Count conv_key_* cookies', () => void inspectOnly());
  GM.registerMenuCommand('Delete conv_key_* cookies now', () => void cleanNow());
})();
