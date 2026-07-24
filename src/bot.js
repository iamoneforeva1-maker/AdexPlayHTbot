const { Telegraf } = require('telegraf');
const { textToSpeech, listVoices } = require('./playht');
const { getVoice, setVoice } = require('./userStore');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN. Set it in your .env file or Railway variables.');
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    "👋 Welcome to AdexPlayHTbot!\n\n" +
      'Send me any text and I will read it out loud using PlayHT.\n\n' +
      'Commands:\n' +
      '/voices - browse available voices\n' +
      '/setvoice <voice_id> - choose a voice\n' +
      '/help - show this message again'
  )
);

bot.help((ctx) =>
  ctx.reply(
    'Just send text and I will reply with a voice note.\n' +
      '/voices - list some available voices\n' +
      '/setvoice <voice_id> - set your preferred voice'
  )
);

bot.command('voices', async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const voices = await listVoices();
    const sample = voices.slice(0, 10);

    const lines = sample.map(
      (v, i) => `${i + 1}. ${v.name || v.voice_engine || 'Voice'} — \`${v.id}\``
    );

    await ctx.replyWithMarkdown(
      `Here are a few available voices:\n\n${lines.join('\n')}\n\n` +
        'Copy a voice id and use /setvoice <voice_id> to switch.'
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    await ctx.reply('Could not fetch the voice list. Check your PlayHT API credentials.');
  }
});

bot.command('setvoice', (ctx) => {
  const voiceId = ctx.message.text.split(' ').slice(1).join(' ').trim();
  if (!voiceId) {
    return ctx.reply('Usage: /setvoice <voice_id>\nRun /voices to see options.');
  }
  setVoice(ctx.from.id, voiceId);
  ctx.reply('✅ Voice updated.');
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  if (text.startsWith('/')) return; // unknown command, ignore

  if (text.length > 2000) {
    return ctx.reply('That text is a bit long — please keep it under 2000 characters.');
  }

  try {
    await ctx.sendChatAction('record_voice');
    const voice = getVoice(ctx.from.id);
    const audioBuffer = await textToSpeech({ text, voice });

    await ctx.replyWithVoice({ source: audioBuffer, filename: 'speech.mp3' });
  } catch (err) {
    console.error(err.response?.data || err.message);
    await ctx.reply('⚠️ Sorry, I could not generate speech for that. Please try again.');
  }
});

module.exports = bot;
