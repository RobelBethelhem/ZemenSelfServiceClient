import Speech from 'speak-tts';

let speech = null;

export const initializeVoices = async () => {
  speech = new Speech();
  
  try {
    const speechStatus = await speech.init({
      volume: 1,
      lang: 'en-US',
      rate: 1,
      pitch: 1,
      splitSentences: true,
    });
    
    if (speechStatus) {
      console.log('Speech is ready');
      return true;
    }
  } catch (e) {
    console.error('Speech init failed:', e);
    return false;
  }
};

export const speakText = async (text, language = 'English') => {
  if (!speech) {
    await initializeVoices();
  }

  try {
    // Set language based on selection
    switch (language) {
      case 'Amharic':
        speech.setLanguage('am-ET');
        break;
      case 'Tigrinya':
        speech.setLanguage('ti-ET');
        break;
      case 'Oromiffa':
        speech.setLanguage('om-ET');
        break;
      default:
        speech.setLanguage('en-US');
    }

    await speech.speak({
      text: text,
      queue: false, // Remove any existing speech
      listeners: {
        onstart: () => console.log('Speech started'),
        onend: () => console.log('Speech ended'),
        onerror: (error) => console.error('Speech error:', error),
      },
    });
  } catch (error) {
    console.error('Speech failed:', error);
    // Fallback to English if selected language fails
    speech.setLanguage('en-US');
    await speech.speak({ text: text });
  }
};

export const getAvailableVoices = () => {
  return speech ? speech.voices() : [];
};