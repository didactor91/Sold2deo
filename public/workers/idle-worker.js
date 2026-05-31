/**
 * Idle Engine Web Worker
 * Runs idle simulation at 1Hz tick rate.
 * @module workers/idle-worker
 */

/**
 * Bot rate per second per tier (credits/hr converted to credits/sec).
 * Tier 1: 2Ȼ/hr, Tier 2: 5Ȼ/hr, Tier 3: 12Ȼ/hr, Tier 4: 28Ȼ/hr, Tier 5: 60Ȼ/hr
 */
const BOT_RATES = {
  1: 2 / 3600,
  2: 5 / 3600,
  3: 12 / 3600,
  4: 28 / 3600,
  5: 60 / 3600,
};

const MAX_OFFLINE_HOURS = 8;

let state = {
  bots: [],
  upgrades: [],
  lastTickTimestamp: 0,
  initialCredits: 0,
};

let creditsPerSecond = 0;
let totalCredits = 0;
let tickIntervalId = null;

/**
 * Compute credits per second from current bot and upgrade state.
 */
function computeCreditsPerSecond() {
  let total = 0;
  for (const bot of state.bots) {
    const rate = BOT_RATES[bot.tier] ?? BOT_RATES[1];
    const qualityMultiplier = (bot.quality || 50) / 100;
    total += rate * qualityMultiplier;
  }

  let effMult = 1.0;
  for (const up of state.upgrades) {
    if (up.id === 'ventilation') effMult *= 1.10;
    if (up.id === 'second_shift') effMult *= 2.0;
    if (up.id === 'qc_station') effMult *= 1.05;
  }

  return total * effMult;
}

/**
 * Compute offline earnings from lastTickTimestamp.
 */
function computeOfflineEarnings() {
  const now = Date.now();
  const maxOfflineSeconds = MAX_OFFLINE_HOURS * 3600;
  const elapsedSeconds = (now - state.lastTickTimestamp) / 1000;
  const offlineSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);

  return {
    offlineEarnings: Math.floor(offlineSeconds * creditsPerSecond),
    offlineSeconds: Math.floor(offlineSeconds),
    cappedSeconds: Math.floor(maxOfflineSeconds),
  };
}

/**
 * Send a TICK message with current earnings state.
 */
function tick() {
  totalCredits += creditsPerSecond;
  self.postMessage({
    type: 'TICK',
    payload: {
      creditsEarned: creditsPerSecond,
      totalCredits: Math.floor(totalCredits),
      timestamp: Date.now(),
    },
  });
}

/**
 * Handle START message — initialize state and begin tick loop.
 * @param {Object} payload
 */
function handleStart(payload) {
  state = {
    bots: payload.bots || [],
    upgrades: payload.upgrades || [],
    lastTickTimestamp: payload.lastTickTimestamp || Date.now(),
    initialCredits: payload.initialCredits || 0,
  };
  totalCredits = state.initialCredits;
  creditsPerSecond = computeCreditsPerSecond();

  const { offlineEarnings, offlineSeconds } = computeOfflineEarnings();
  totalCredits += offlineEarnings;

  self.postMessage({
    type: 'OFFLINE_CALC',
    payload: { offlineEarnings, offlineSeconds },
  });

  if (tickIntervalId) clearInterval(tickIntervalId);
  tickIntervalId = setInterval(tick, 1000);
}

/**
 * Handle UPDATE message — refresh bot/upgrade state.
 * @param {Object} payload
 */
function handleUpdate(payload) {
  if (payload.bots !== undefined) state.bots = payload.bots;
  if (payload.upgrades !== undefined) state.upgrades = payload.upgrades;
  creditsPerSecond = computeCreditsPerSecond();
}

/**
 * Handle STOP message — halt tick loop.
 */
function handleStop() {
  if (tickIntervalId) {
    clearInterval(tickIntervalId);
    tickIntervalId = null;
  }
}

/**
 * Handle incoming messages from the main thread.
 */
self.onmessage = function (event) {
  const { type, payload } = event.data;

  switch (type) {
    case 'START':
      handleStart(payload);
      break;
    case 'UPDATE':
      handleUpdate(payload);
      break;
    case 'STOP':
      handleStop();
      break;
  }
};
