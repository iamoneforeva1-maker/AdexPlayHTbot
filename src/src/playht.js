const axios = require('axios');

const PLAYHT_API_KEY = process.env.PLAYHT_API_KEY;
const PLAYHT_USER_ID = process.env.PLAYHT_USER_ID;

const BASE_URL = 'https://api.play.ht/api/v2';

function assertCredentials() {
  if (!PLAYHT_API_KEY || !PLAYHT_USER_ID) {
    throw new Error(
      'Missing PLAYHT_API_KEY or PLAYHT_USER_ID. Set them in your .env file or Railway variables.'
    );
  }
}

function authHeaders(extra = {}) {
  return {
    Authorization: PLAYHT_API_KEY,
    'X-USER-ID': PLAYHT_USER_ID,
    ...extra,
  };
}

/**
 * Converts text to speech and returns an mp3 Buffer.
 * Uses PlayHT's streaming endpoint so no polling is needed.
 */
async function textToSpeech({ text, voice, voiceEngine = 'PlayHT2.0-turbo' }) {
  assertCredentials();

  const response = await axios.post(
    `${BASE_URL}/tts/stream`,
    {
      text,
      voice,
      voice_engine: voiceEngine,
      output_format: 'mp3',
    },
    {
      headers: authHeaders({
        accept: 'audio/mpeg',
        'content-type': 'application/json',
      }),
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
}

/**
 * Fetches the list of stock voices available on the account.
 */
async function listVoices() {
  assertCredentials();

  const response = await axios.get(`${BASE_URL}/voices`, {
    headers: authHeaders({ accept: 'application/json' }),
  });

  return response.data;
}

module.exports = { textToSpeech, listVoices };
