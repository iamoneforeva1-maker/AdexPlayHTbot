// Simple in-memory per-user settings.
// Good enough for a single Railway instance / low-medium traffic.
// Swap this for a real database (Postgres, Redis, etc.) if you need
// settings to survive restarts or to scale across instances.

const DEFAULT_VOICE =
  process.env.DEFAULT_VOICE_ID ||
  's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json';

const userVoices = new Map();

function getVoice(userId) {
  return userVoices.get(userId) || DEFAULT_VOICE;
}

function setVoice(userId, voiceId) {
  userVoices.set(userId, voiceId);
}

module.exports = { getVoice, setVoice, DEFAULT_VOICE };
