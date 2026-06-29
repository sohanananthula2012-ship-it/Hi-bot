const fs = require('fs');
const os = require('os');
const path = require('path');

const WORKDIR = path.join(os.tmpdir(), 'lanes-engine-workspace');
if (!fs.existsSync(WORKDIR)) fs.mkdirSync(WORKDIR, { recursive: true });

// --- Load orchids key from env (preferred) or local config.json (fallback) ---
function loadOrchidsKey() {
  const envKey = process.env.ORCHIDS_KEY || process.env.orchids_key;
  if (envKey && envKey.trim()) return { key: envKey.trim(), source: 'env' };

  const LOCAL_CONFIG = path.join(process.cwd(), 'config.json');
  try {
    const cfg = JSON.parse(fs.readFileSync(LOCAL_CONFIG, 'utf8'));
    const k = cfg.orchids_key || cfg.orchidsKey || cfg.ORCHIDS_KEY;
    if (k) return { key: k, source: 'config.json' };
  } catch (_) {}

  return { key: null, source: null };
}

// --- Seed config with the orchids key (matches server.js behavior) ---
// On Vercel serverless, os.homedir() is read-only; use tmpdir instead.
function seedLanesConfig(orchidsKey) {
  if (!orchidsKey) return;
  const baseDir = process.env.VERCEL ? os.tmpdir() : os.homedir();
  const lanesDir = path.join(baseDir, '.lanes-engine');
  const lanesCfg = path.join(lanesDir, 'config.json');
  let store = {};
  try {
    if (!fs.existsSync(lanesDir)) fs.mkdirSync(lanesDir, { recursive: true });
    if (fs.existsSync(lanesCfg)) store = JSON.parse(fs.readFileSync(lanesCfg, 'utf8'));
    store.orchids = orchidsKey;
    store.orchids_key = orchidsKey;
    store.ORCHIDS_KEY = orchidsKey;
    fs.writeFileSync(lanesCfg, JSON.stringify(store, null, 2));
  } catch (e) {
    console.warn('seedLanesConfig: failed to write config:', e.message);
  }
}

// --- Strip ANSI + wizard banner noise (kept for compatibility) ---
function cleanOutput(s) {
  if (!s) return '';
  return s
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/\x1B\[\?[0-9;]*[a-zA-Z]/g, '')
    .split('\n')
    .map(l => l.replace(/[\u2500-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF]/g, ''))
    .map(l => l.replace(/[╔╗╚╝═║█░▒▓▀▄■●◐○✦✧·╭╮╯╰│─╳⚡╱╲]/g, ''))
    .filter(l => /[a-zA-Z0-9]/.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Run lanes-engine as a module (Vercel-safe, no npx) ---
async function runLanes(args, timeoutMs = 60000) {
  try {
    // Dynamic import for ESM module
    const { runLanesEngine } = await import('lanes-engine');

    const emailFile = path.join(WORKDIR, 'email.txt');
    const sendersFile = path.join(WORKDIR, 'senders.csv');

    if (!fs.existsSync(emailFile) || !fs.existsSync(sendersFile)) {
      return { ok: false, output: 'Missing email.txt or senders.csv in workspace' };
    }

    // Parse args to determine mode
    const isSend = args.includes('send');
    const isStatus = args.includes('status');

    if (isSend) {
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ ok: false, output: `timed out after ${timeoutMs / 1000}s` });
        }, timeoutMs);

        runLanesEngine({
          emailFile,
          sendersFile,
          quiet: true,
          skipRecyclePrompt: true,
          onComplete: (result) => {
            clearTimeout(timeout);
            if (result.error) {
              resolve({ ok: false, output: result.error });
            } else {
              resolve({ ok: true, output: `Campaign completed. Report: ${result.reportPath || 'saved'}` });
            }
          }
        }).catch(err => {
          clearTimeout(timeout);
          resolve({ ok: false, output: err.message || String(err) });
        });
      });
    }

    if (isStatus) {
      // Status command — just check if lanes-engine is available
      return { ok: true, output: 'lanes-engine module loaded successfully' };
    }

    return { ok: false, output: 'Unknown command: ' + args.join(' ') };
  } catch (err) {
    return { ok: false, output: 'Failed to load lanes-engine: ' + err.message };
  }
}

module.exports = { cleanOutput, runLanes, loadOrchidsKey, seedLanesConfig, WORKDIR };