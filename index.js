require('dotenv').config();
const bot = require('./src/bot');

bot
  .launch()
  .then(() => console.log('🤖 AdexPlayHTbot is up and running (long polling)...'))
  .catch((err) => {
    console.error('Failed to launch bot:', err);
    process.exit(1);
  });

// Graceful shutdown (Railway sends SIGTERM on redeploy/restart)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
