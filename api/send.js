const fs = require('fs');
const path = require('path');
const { runLanes, loadOrchidsKey, seedLanesConfig, WORKDIR } = require('../lib/lanes');

// Seed at module load (idempotent). On Vercel the homedir is writable per-instance
// but ephemeral; that's acceptable — lanes-engine just needs the key present.
const { key: orchidsKey } = loadOrchidsKey();
seedLanesConfig(orchidsKey);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const email = (req.body && req.body.email || '').trim();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ ok: false, error: 'Invalid email: "' + email + '"' });
  }
  if (!orchidsKey) {
    return res.status(500).json({ ok: false, error: 'orchids_key missing (set ORCHIDS_KEY env var)' });
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
    fs.writeFileSync(path.join(WORKDIR, 'email.txt'), emailTxt);
    fs.writeFileSync(path.join(WORKDIR, 'senders.csv'), sendersCsv);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'write failed: ' + e.message });
  }

  const result = await runLanes(['send', '--no-banner'], 55000);
  if (!result.ok) {
    return res.status(500).json({ ok: false, error: result.output || 'lanes-engine failed' });
  }
  return res.status(200).json({ ok: true, message: 'helloo sent to ' + email });
};