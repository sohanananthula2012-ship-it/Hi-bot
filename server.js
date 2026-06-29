const express = require('express');
const path = require('path');
const { runLanes, loadOrchidsKey, seedLanesConfig, WORKDIR } = require('./lib/lanes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const { key: orchidsKey, source: keySource } = loadOrchidsKey();
console.log('[boot] orchidsKey source:', keySource);
console.log('[boot] orchidsKey loaded:', orchidsKey ? 'YES (len=' + orchidsKey.length + ')' : 'NO');
seedLanesConfig(orchidsKey);

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    orchidsKeyPresent: !!orchidsKey,
    source: keySource,
    message: orchidsKey ? 'ready' : 'orchids_key missing (set ORCHIDS_KEY env var or config.json)'
  });
});

// --- Send endpoint ---
app.post('/send', async (req, res) => {
  const email = (req.body && req.body.email || '').trim();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Invalid email: "' + email + '"' });
  }
  if (!orchidsKey) {
    return res.status(500).json({ ok: false, error: 'orchids_key missing in config.json / ORCHIDS_KEY env' });
  }

  const emailTxt = `Subject: helloo

helloo {{name}},

You just clicked the Hi button. This message was routed through the Lanes Wizard Engine.

— Hi Bot
`;
  const sendersCsv = `email,name
${email},friend
`;

  try {
    require('fs').writeFileSync(path.join(WORKDIR, 'email.txt'), emailTxt);
    require('fs').writeFileSync(path.join(WORKDIR, 'senders.csv'), sendersCsv);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'write failed: ' + e.message });
  }

  const result = await runLanes(['send', '--no-banner'], 90000);
  if (!result.ok) {
    return res.status(500).json({ ok: false, error: result.output || 'lanes-engine failed' });
  }
  res.json({ ok: true, message: 'helloo sent to ' + email });
});

app.get('/status', async (req, res) => {
  const result = await runLanes(['status', '--no-banner'], 15000);
  res.json({ ok: result.ok, output: result.output });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found: ' + req.method + ' ' + req.path });
});

process.on('uncaughtException', e => console.error('[FATAL]', e));
process.on('unhandledRejection', e => console.error('[FATAL]', e));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('App running at http://localhost:' + PORT);
  });
}

module.exports = app;