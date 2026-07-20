'use strict';

// SPDX-License-Identifier: Apache-2.0

/*
 * ChatGPT HTTP ERROR 431 Fixer
 *
 * Privacy/security properties:
 * - No fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon, remote code,
 *   analytics, telemetry, or content script.
 * - Cookie values are never stored or logged.
 * - Only cookies on the exact chatgpt.com domain whose names start with
 *   "conv_key_" are candidates for removal.
 * - Installation, scheduled, and toolbar cleanup operations are fail-closed:
 *   if tab inspection fails, or a temporary-chat tab is open, no cookie is
 *   removed. Browser-startup cleanup is the intentional exception.
 */

const CHATGPT_ORIGIN = 'https://chatgpt.com';
const CHATGPT_TAB_PATTERN = 'https://chatgpt.com/*';
const COOKIE_DOMAIN = 'chatgpt.com';
const COOKIE_PREFIX = 'conv_key_';

const DUE_CHECK_ALARM = 'conv-key-due-check';
const CLEAR_STATUS_ALARM = 'clear-action-status';
const LAST_CLEANUP_KEY = 'lastSuccessfulCleanupAt';

const CLEAN_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours
const RETRY_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const MIN_ALARM_DELAY_MS = 60 * 1000; // avoid immediate alarm loops

const DEFAULT_ACTION_TITLE = 'Clean conv_key_* cookies safely';

// Serialize asynchronous event handlers so startup, alarms, and toolbar clicks
// cannot interleave cookie deletion and scheduling state updates.
let operationQueue = Promise.resolve();

function enqueue(operation) {
  operationQueue = operationQueue
    .catch(() => undefined)
    .then(operation)
    .catch((error) => {
      console.error('[conv_key cleaner] unexpected error:', error);
    });
  return operationQueue;
}

function normalizedCookieDomain(domain) {
  return String(domain || '').replace(/^\./, '').toLowerCase();
}

function isTargetCookie(cookie) {
  return normalizedCookieDomain(cookie.domain) === COOKIE_DOMAIN
    && typeof cookie.name === 'string'
    && cookie.name.startsWith(COOKIE_PREFIX);
}

function isTemporaryChatUrl(rawUrl) {
  if (!rawUrl) return false;

  try {
    const url = new URL(rawUrl);
    return url.origin === CHATGPT_ORIGIN
      && url.searchParams.get('temporary-chat') === 'true';
  } catch {
    return false;
  }
}

async function getTemporaryChatTabState() {
  try {
    const tabs = await chrome.tabs.query({ url: CHATGPT_TAB_PATTERN });
    const matchingTabs = tabs.filter((tab) => (
      isTemporaryChatUrl(tab.url) || isTemporaryChatUrl(tab.pendingUrl)
    ));

    return {
      inspectionSucceeded: true,
      hasTemporaryChatTab: matchingTabs.length > 0,
      count: matchingTabs.length,
    };
  } catch (error) {
    // Fail closed: inability to inspect tabs must never trigger deletion.
    console.error('[conv_key cleaner] could not inspect ChatGPT tabs:', error);
    return {
      inspectionSucceeded: false,
      hasTemporaryChatTab: true,
      count: 0,
    };
  }
}

function cookieIdentity(cookie) {
  return JSON.stringify([
    cookie.storeId ?? null,
    cookie.domain,
    cookie.path,
    cookie.name,
    cookie.partitionKey ?? null,
  ]);
}

function removalUrl(cookie) {
  const host = normalizedCookieDomain(cookie.domain);
  const path = typeof cookie.path === 'string' && cookie.path.startsWith('/')
    ? cookie.path
    : '/';
  return `https://${host}${path}`;
}

async function getCookieStoresSafely() {
  try {
    const stores = await chrome.cookies.getAllCookieStores();
    return stores.length > 0 ? stores : [{ id: undefined }];
  } catch (error) {
    // A normal browser profile has one default store. Falling back to it is
    // still useful; the cleanup result is marked incomplete so it is retried.
    console.error('[conv_key cleaner] could not enumerate cookie stores:', error);
    return [{ id: undefined, enumerationFailed: true }];
  }
}

async function tryCookieQuery(details, label) {
  try {
    return { ok: true, cookies: await chrome.cookies.getAll(details) };
  } catch (error) {
    console.warn(`[conv_key cleaner] ${label} cookie query failed:`, error);
    return { ok: false, cookies: [] };
  }
}

async function listTargetCookies() {
  const stores = await getCookieStoresSafely();
  const found = new Map();
  let complete = !stores.some((store) => store.enumerationFailed);

  for (const store of stores) {
    const storeDetails = store.id === undefined ? {} : { storeId: store.id };

    // Chrome's cookies API operates on unpartitioned cookies by default.
    const unpartitioned = await tryCookieQuery({
      domain: COOKIE_DOMAIN,
      ...storeDetails,
    }, 'unpartitioned');

    // Query partitioned cookies too. The explicit top-level key is a
    // supplemental compatibility query. The empty key must succeed because it
    // is the query that covers every partition.
    const partitionedForChatGPT = await tryCookieQuery({
      domain: COOKIE_DOMAIN,
      partitionKey: { topLevelSite: CHATGPT_ORIGIN },
      ...storeDetails,
    }, 'partitioned-chatgpt');

    const partitionedAny = await tryCookieQuery({
      domain: COOKIE_DOMAIN,
      partitionKey: {},
      ...storeDetails,
    }, 'partitioned-any');

    if (!unpartitioned.ok || !partitionedAny.ok) {
      complete = false;
    }

    for (const cookie of [
      ...unpartitioned.cookies,
      ...partitionedForChatGPT.cookies,
      ...partitionedAny.cookies,
    ]) {
      if (isTargetCookie(cookie)) {
        found.set(cookieIdentity(cookie), cookie);
      }
    }
  }

  return { cookies: [...found.values()], complete };
}

async function removeTargetCookie(cookie) {
  const details = {
    url: removalUrl(cookie),
    name: cookie.name,
  };

  if (cookie.storeId !== undefined) {
    details.storeId = cookie.storeId;
  }
  if (cookie.partitionKey !== undefined) {
    details.partitionKey = cookie.partitionKey;
  }

  try {
    return Boolean(await chrome.cookies.remove(details));
  } catch (error) {
    // Deliberately omit the cookie value and full cookie object from logs.
    console.error(
      `[conv_key cleaner] failed to remove ${cookie.name} at ${cookie.domain}${cookie.path}:`,
      error,
    );
    return false;
  }
}

async function cleanTargetCookies(reason) {
  const listing = await listTargetCookies();
  let removedCount = 0;
  let failedCount = 0;

  for (const cookie of listing.cookies) {
    if (await removeTargetCookie(cookie)) {
      removedCount += 1;
    } else {
      failedCount += 1;
    }
  }

  const verification = await listTargetCookies();
  const successful = listing.complete
    && failedCount === 0
    && verification.complete
    && verification.cookies.length === 0;
  console.info(
    `[conv_key cleaner] reason=${reason}; matched=${listing.cookies.length}; `
      + `removed=${removedCount}; failed=${failedCount}; complete=${listing.complete}; `
      + `verificationComplete=${verification.complete}; remaining=${verification.cookies.length}`,
  );

  return {
    successful,
    matchedCount: listing.cookies.length,
    removedCount,
    failedCount,
  };
}

async function getLastSuccessfulCleanupAt() {
  try {
    const stored = await chrome.storage.local.get(LAST_CLEANUP_KEY);
    const value = Number(stored[LAST_CLEANUP_KEY]);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.error('[conv_key cleaner] could not read cleanup timestamp:', error);
    return 0;
  }
}

async function recordSuccessfulCleanup(timestamp = Date.now()) {
  try {
    await chrome.storage.local.set({ [LAST_CLEANUP_KEY]: timestamp });
    return true;
  } catch (error) {
    console.error('[conv_key cleaner] could not store cleanup timestamp:', error);
    return false;
  }
}

async function scheduleDueCheckAt(timestamp) {
  const when = Math.max(Number(timestamp) || 0, Date.now() + MIN_ALARM_DELAY_MS);
  await chrome.alarms.clear(DUE_CHECK_ALARM);
  await chrome.alarms.create(DUE_CHECK_ALARM, { when });
}

async function scheduleNextNormalCheck(cleanupTime = Date.now()) {
  await scheduleDueCheckAt(cleanupTime + CLEAN_INTERVAL_MS);
}

async function scheduleRetry() {
  await scheduleDueCheckAt(Date.now() + RETRY_INTERVAL_MS);
}

async function markCleanupSuccessAndSchedule() {
  const cleanupTime = Date.now();
  const timestampStored = await recordSuccessfulCleanup(cleanupTime);

  if (timestampStored) {
    await scheduleNextNormalCheck(cleanupTime);
  } else {
    // Without a durable timestamp, retry sooner instead of silently treating
    // the current cleanup as the start of a new three-hour window.
    await scheduleRetry();
  }

  return timestampStored;
}

async function runBrowserStartupCleanup() {
  // This is intentionally unconditional. A restored temporary chat would have
  // been reloaded by the browser anyway; the user's requested policy is to
  // begin each browser session with a clean conv_key_* set.
  await chrome.alarms.clear(DUE_CHECK_ALARM);
  const result = await cleanTargetCookies('browser-startup');

  if (result.successful) {
    await markCleanupSuccessAndSchedule();
  } else {
    await scheduleRetry();
  }
}

async function runDueCheck(reason) {
  const now = Date.now();
  const lastCleanup = await getLastSuccessfulCleanupAt();
  const dueAt = lastCleanup > 0 ? lastCleanup + CLEAN_INTERVAL_MS : 0;

  if (dueAt > now) {
    await scheduleDueCheckAt(dueAt);
    return;
  }

  const tabState = await getTemporaryChatTabState();
  if (!tabState.inspectionSucceeded || tabState.hasTemporaryChatTab) {
    console.info(
      `[conv_key cleaner] skipped (${reason}); temporary tabs=${tabState.count}; `
        + `inspectionSucceeded=${tabState.inspectionSucceeded}`,
    );
    await scheduleRetry();
    return;
  }

  const result = await cleanTargetCookies(reason);
  if (result.successful) {
    await markCleanupSuccessAndSchedule();
  } else {
    await scheduleRetry();
  }
}

async function ensureDueCheckExists() {
  const alarm = await chrome.alarms.get(DUE_CHECK_ALARM);
  if (alarm) return;

  const lastCleanup = await getLastSuccessfulCleanupAt();
  const dueAt = lastCleanup > 0
    ? lastCleanup + CLEAN_INTERVAL_MS
    : Date.now() + MIN_ALARM_DELAY_MS;
  await scheduleDueCheckAt(dueAt);
}

async function setTemporaryActionStatus(text, title) {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setTitle({ title });
  await chrome.alarms.create(CLEAR_STATUS_ALARM, { delayInMinutes: 1 });
}

async function clearActionStatus() {
  await chrome.action.setBadgeText({ text: '' });
  await chrome.action.setTitle({ title: DEFAULT_ACTION_TITLE });
}

async function runSafeManualCleanup() {
  const tabState = await getTemporaryChatTabState();
  if (!tabState.inspectionSucceeded) {
    await setTemporaryActionStatus(
      'ERR',
      'Could not check ChatGPT tabs. No cookies were deleted.',
    );
    return;
  }

  if (tabState.hasTemporaryChatTab) {
    await setTemporaryActionStatus(
      'WAIT',
      `${tabState.count} temporary chat tab(s) are open. No cookies were deleted.`,
    );
    return;
  }

  const result = await cleanTargetCookies('manual-toolbar-click');
  if (!result.successful) {
    await scheduleRetry();
    await setTemporaryActionStatus(
      'ERR',
      `Cleanup was incomplete. Removed: ${result.removedCount}. Failed: ${result.failedCount}.`,
    );
    return;
  }

  await markCleanupSuccessAndSchedule();
  const badge = result.removedCount > 99 ? '99+' : String(result.removedCount);
  await setTemporaryActionStatus(
    badge,
    `Removed ${result.removedCount} conv_key_* cookie(s).`,
  );
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  void enqueue(async () => {
    if (reason === 'install') {
      // On first install, use the same safe check as normal operation.
      await runDueCheck('extension-install');
    } else {
      await ensureDueCheckExists();
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  void enqueue(runBrowserStartupCleanup);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === DUE_CHECK_ALARM) {
    void enqueue(() => runDueCheck('scheduled-due-check'));
  } else if (alarm.name === CLEAR_STATUS_ALARM) {
    void enqueue(clearActionStatus);
  }
});

chrome.action.onClicked.addListener(() => {
  void enqueue(runSafeManualCleanup);
});

// MV3 service workers can be restarted independently of browser startup, and
// alarms are not guaranteed to survive every browser/version scenario.
void enqueue(ensureDueCheckExists);
