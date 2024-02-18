const AudioCodecs = {
  AAC: {
    type: 'audio/mp4; codecs="mp4a.40.2"',
    codec: 'mp4a.40.2',
    name: 'AAC',
    description: 'Advanced Audio Coding (AAC) is a widely used, lossy compression for digital audio.',
  },
  OPUS: {
    type: 'audio/webm; codecs="opus"',
    codec: 'opus',
    name: 'Opus',
    description: 'A versatile audio codec designed for high-speed Internet streaming and archiving, providing high quality audio.',
  },
  VORBIS: {
    type: 'audio/ogg; codecs="vorbis"',
    codec: 'vorbis',
    name: 'Vorbis',
    description: 'An open-source, lossy audio compression format.',
  },
  WAV: {
    type: 'audio/wav; codecs="1"',
    codec: '1',
    name: 'WAV',
    description: 'Waveform Audio File Format (WAV) is a raw audio format created by Microsoft and IBM.',
  },
  ALAC: {
    type: 'audio/mp4; codecs="alac"',
    codec: 'alac',
    name: 'ALAC',
    description: 'Apple Lossless Audio Codec (ALAC) is an audio codec developed by Apple for lossless data compression of digital music.',
  },
  SPEEX: {
    type: 'audio/ogg; codecs="speex"',
    codec: 'speex',
    name: 'Speex',
    description: 'A patent-free, compression format designed for speech.',
  },
};
export default AudioCodecs;