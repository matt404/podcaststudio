class Track {
  constructor(id, name, duration, blob, mediaType, blobSize, start, end) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.blob = blob;
    this.mediaType = mediaType;
    this.blobSize = blobSize
    this.start = start;
    this.end = end;
  }
}

export default Track;