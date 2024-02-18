class ProjectSettings {
  constructor() {
    this.audio = {
      codec: 'OPUS', // default codec
      autoGainControl: false, // default auto gain control
      echoCancellation: false, // default echo cancellation
      noiseSuppression: false // default noise suppression
    }
    this.video = {
      codec : 'VP8', // default codec
      frameRate: 15, // default frame rate
      resolution: 'HD', // default resolution
      customWidth: 0, // for user input when 'other' is selected
      customHeight: 0 // for user input when 'other' is selected
    }
  }
}

export default ProjectSettings;