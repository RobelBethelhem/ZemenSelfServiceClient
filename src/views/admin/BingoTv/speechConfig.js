let player = null;

const VOICE_CONFIGS = {
  'am-ET': {
    language: 'am-ET',
    rate: 1,
    volume: 1
  },
  'en-US': {
    language: 'en-US',
    rate: 1,
    volume: 1
  }
};

export const initializeTalkify = () => {
  if (!player && window.talkify) {
    player = new window.talkify.TtsPlayer(); // Access talkify from the global window object
    
    // Configure default settings
    if (player.setRate) player.setRate(1);
    if (player.setVolume) player.setVolume(1);
    
    console.log('Talkify TTS initialized');
  }
  return player;
};

export const textToSpeech = async (text, languageCode = 'am-ET') => {
  try {
    if (!player) {
      player = initializeTalkify();
    }

    const config = VOICE_CONFIGS[languageCode] || VOICE_CONFIGS['am-ET'];
    
    // Configure player with language-specific settings
    if (player.setRate) player.setRate(config.rate);
    if (player.setVolume) player.setVolume(config.volume);
    
    return new Promise((resolve, reject) => {
      // Assuming playText returns a promise or has a callback for completion
      player.playText(text)
        .then(() => resolve())
        .catch((error) => {
          console.error('Talkify playback error:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
};

export const stopSpeech = () => {
  if (player) {
    player.stop();
  }
};