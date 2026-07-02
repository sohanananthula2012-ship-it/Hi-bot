const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// --- Load elora-voss LLM key from env (preferred) or config.json (fallback) ---
function loadEloraKey() {
  const groqEnv = process.env.ELORA_GROQ_KEY || process.env.GROQ_API_KEY;
  if (groqEnv && groqEnv.trim()) return { key: groqEnv.trim(), provider: 'groq' };

  const openrouterEnv = process.env.ELORA_OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
  if (openrouterEnv && openrouterEnv.trim()) return { key: openrouterEnv.trim(), provider: 'openrouter' };

  const LOCAL_CONFIG = path.join(process.cwd(), 'config.json');
  try {
    const cfg = JSON.parse(fs.readFileSync(LOCAL_CONFIG, 'utf8'));
    const groq = cfg.elora_groq_key || cfg.groq_key;
    if (groq) return { key: groq, provider: 'groq' };
    const openrouter = cfg.elora_openrouter_key || cfg.openrouter_key;
    if (openrouter) return { key: openrouter, provider: 'openrouter' };
  } catch (_) {}

  return { key: null, provider: null };
}

// --- Ensure elora-voss has the key set via its own CLI ---
async function ensureEloraKeySet(key, provider) {
  return new Promise((resolve, reject) => {
    execFile(
      'npx',
      ['elora-voss', 'set-key', provider, key],
      { cwd: process.cwd(), shell: true, timeout: 30000 },
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Failed to set elora-voss key: ${stderr || error.message}`));
        }
        resolve();
      }
    );
  });
}

// --- Run elora-voss research on a topic, return the generated article ---
async function runResearch(topic, timeoutMs = 120000) {
  const { key, provider } = loadEloraKey();
  if (!key) {
    throw new Error('No elora-voss LLM key configured. Set ELORA_GROQ_KEY env var or add elora_groq_key to config.json');
  }

  // elora-voss manages keys internally — set it via CLI before running research
  await ensureEloraKeySet(key, provider);

  // Build env for the child process
  const env = { ...process.env };
  if (provider === 'groq') {
    env.GROQ_API_KEY = key;
  } else if (provider === 'openrouter') {
    env.OPENROUTER_API_KEY = key;
  }

  // elora-voss workspace is in cwd by default after init
  const workdir = process.cwd();

  return new Promise((resolve, reject) => {
    const child = execFile(
      'npx',
      ['elora-voss', 'research', topic],
      {
        cwd: workdir,
        env,
        timeout: timeoutMs,
        shell: true,
        maxBuffer: 10 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            return reject(new Error(`elora-voss timed out after ${timeoutMs / 1000}s`));
          }
          return reject(new Error(`elora-voss failed: ${stderr || error.message}`));
        }

        // Read the generated article from output.txt
        const outputPath = path.join(workdir, 'output.txt');
        try {
          const article = fs.readFileSync(outputPath, 'utf8').trim();
          if (!article) {
            return reject(new Error('elora-voss produced empty output'));
          }
          resolve(article);
        } catch (e) {
          reject(new Error(`Failed to read elora-voss output: ${e.message}. stdout: ${stdout.slice(0, 500)}`));
        }
      }
    );
  });
}

module.exports = { loadEloraKey, runResearch };
