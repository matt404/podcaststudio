//List of Video Codecs which may be supported by the MediaRecorder API
const VideoCodecs = {
  H264: {
    type: 'video/webm; codecs="h264"',
    name: 'H.264',
    description: 'Also known as AVC (Advanced Video Coding), is widely used for high definition video.',
  },
  VP8: {
    type: 'video/webm; codecs="vp8"',
    name: 'VP8',
    description: 'An open video compression format owned by Google, predecessor to VP9.',
  },
  VP9: {
    type: 'video/webm; codecs="vp9"',
    name: 'VP9',
    description: 'An open and royalty-free video coding format developed by Google, offering improved compression over VP8.',
  },
  AV1: {
    type: 'video/webm; codecs="av1"',
    name: 'AV1',
    description: 'A cutting-edge, open, royalty-free video coding format designed for better compression efficiency than its predecessors.',
  },
  H265: {
    type: 'video/mp4; codecs="hevc"',
    name: 'H.265',
    description: 'Also known as HEVC (High Efficiency Video Coding), provides superior data compression compared to H.264.',
  },
  THEORA: {
    type: 'video/ogg; codecs="theora"',
    name: 'Theora',
    description: 'A free lossy video compression format.',
  },
  MPEG4: {
    type: 'video/mp4; codecs="mp4v"',
    name: 'MPEG4',
    description: 'Defines compression of audio and visual (AV) digital data, part of the MPEG group of standards.',
  },
  VP7: {
    type: 'video/webm; codecs="vp7"',
    name: 'VP7',
    description: 'An older version of video compression format owned by Google, predecessor to VP8.',
  },
  MPEG2: {
    type: 'video/mp2t; codecs="mp2t"',
    name: 'MPEG2',
    description: 'Widely used as the format of digital television signals that are broadcast by terrestrial, cable, and direct broadcast satellite TV systems.',
  },
  AVIF: {
    type: 'video/mp4; codecs="av01"',
    name: 'AVIF',
    description: 'Standing for AV1 Image File Format, an image format that uses the AV1 codec for highly efficient image compression.',
  },
};
export default VideoCodecs;
