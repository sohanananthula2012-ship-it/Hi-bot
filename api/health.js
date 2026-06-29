const { loadOrchidsKey } = require('../lib/lanes');

module.exports = function handler(req, res) {
  const { key, source } = loadOrchidsKey();
  return res.status(200).json({
    ok: true,
    orchidsKeyPresent: !!key,
    source: source,
    message: key ? 'ready' : 'orchids_key missing (set ORCHIDS_KEY env var or config.json)'
  });
};