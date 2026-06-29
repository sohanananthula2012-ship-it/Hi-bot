const { runLanes } = require('../lib/lanes');

module.exports = async function handler(req, res) {
  const result = await runLanes(['status', '--no-banner'], 15000);
  return res.status(200).json({ ok: result.ok, output: result.output });
};