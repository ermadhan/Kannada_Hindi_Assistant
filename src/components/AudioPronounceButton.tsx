import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioPronounceButtonProps {
  kannadaText: string;
  phoneticText?: string;
  size?: 'sm' | 'md';
}

export const AudioPronounceButton: React.FC<AudioPronounceButtonProps> = ({
  kannadaText,
  phoneticText,
  size = 'sm',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    // Detect if text is Devanagari (Hindi) or Kannada
    const isDevanagari = /[\u0900-\u097F]/.test(kannadaText);
    const voices = window.speechSynthesis.getVoices();

    let targetVoice = null;
    let targetLang = 'kn-IN';

    if (isDevanagari) {
      targetVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('Deva'));
      targetLang = 'hi-IN';
    } else {
      targetVoice = voices.find((v) => v.lang.startsWith('kn') || v.lang.includes('Knda'));
      targetLang = 'kn-IN';
    }

    let utterance: SpeechSynthesisUtterance;
    if (targetVoice) {
      utterance = new SpeechSynthesisUtterance(kannadaText);
      utterance.voice = targetVoice;
      utterance.lang = targetLang;
    } else {
      // Fallback: speak phonetic transliteration with Indian English voice or standard voice
      const indianVoice = voices.find((v) => v.lang === 'en-IN');
      utterance = new SpeechSynthesisUtterance(phoneticText || kannadaText);
      if (indianVoice) utterance.voice = indianVoice;
      utterance.lang = 'en-IN';
      utterance.rate = 0.85; // Slightly slower for clear pronunciation
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      type="button"
      title={`Listen to pronunciation: ${phoneticText || kannadaText}`}
      className={`inline-flex items-center justify-center rounded-full transition-colors ${
        size === 'sm' ? 'w-6 h-6 p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50' : 'w-8 h-8 p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-100'
      } ${isPlaying ? 'text-amber-600 bg-amber-100 ring-2 ring-amber-400' : ''}`}
    >
      {isPlaying ? (
        <VolumeX className={size === 'sm' ? 'w-3.5 h-3.5 animate-pulse' : 'w-4 h-4 animate-pulse'} />
      ) : (
        <Volume2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
    </button>
  );
};
