import './AVTrack.css';
import Track from '../../model/Track.js';
import React, {Component} from 'react';
import AudioVisualizer from "./AudioVisualizer";
import {Button, Table} from "react-bootstrap";
import VideoComponent from "./VideoComponent";
import PropTypes from "prop-types";
import MediaFileUtil from "../../util/MediaFileUtil";
import Database from "../../util/Database";
import {FaCircle, FaPlay, FaSquare} from "react-icons/fa";
import VideoResolutions from "../../constants/VideoResolutions";
import VideoCodecs from "../../constants/VideoCodecs";
import AudioCodecs from "../../constants/AudioCodecs";
import DisplayMediaViewer from "./DisplayMediaVIewer";

class AVTrack extends Component {
  static propTypes = {
    devices: PropTypes.array,
    project: PropTypes.object,
    recording: PropTypes.bool,
    streamingAV: PropTypes.bool,
    streamingDisplayMedia: PropTypes.bool,
    streamingStage:  PropTypes.bool,
    streamingPip: PropTypes.bool,
    saveTrackToProject: PropTypes.func,
    selectedDeviceTracks: PropTypes.array,
    setSelectedDeviceTracks: PropTypes.func,
    startAVStream: PropTypes.func,
    stopAVStream: PropTypes.func,
    startDisplayMediaStream: PropTypes.func,
    stopDisplayMediaStream: PropTypes.func,
    startMergedStream: PropTypes.func,
    stopMergedStream: PropTypes.func,
    startPipStream: PropTypes.func,
    stopPipStream: PropTypes.func,
    startRecording: PropTypes.func,
    stopRecording: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedAudioDeviceId: '',
      selectedVideoDeviceId: '',
      mediaStream: null,
    };
    this.recordedChunks = [];
    this.recordedMediaType = '';
    this.canvasStageRef = React.createRef();
    this.displayMediaRef = React.createRef();
    this.videoRef = React.createRef();
    this.videoPipRef = React.createRef();
    this.mediaRecorderRef = React.createRef();

    this.clearTracksFromVideoRef = this.clearTracksFromVideoRef.bind(this);
    this.getAVConstraints = this.getAVConstraints.bind(this);
    this.handleAudioDeviceChange = this.handleAudioDeviceChange.bind(this);
    this.handleDataAvailable = this.handleDataAvailable.bind(this);
    this.handleVideoDeviceChange = this.handleVideoDeviceChange.bind(this);
    this.startDisplayMediaStream = this.startDisplayMediaStream.bind(this);
    this.stopDisplayMediaStream = this.stopDisplayMediaStream.bind(this);
    this.startAVStreams = this.startAVStreams.bind(this);
    this.startMergedStream = this.startMergedStream.bind(this);
    this.stopMergedStream = this.stopMergedStream.bind(this);
    this.startPipStreams = this.startPipStreams.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopAVStreams = this.stopAVStreams.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
  }

  componentDidUpdate() {
    if (this.props.devices.length > 0) {
      const audioDevices = this.props.devices.filter(device => device.kind === 'audioinput');
      const videoDevices = this.props.devices.filter(device => device.kind === 'videoinput');
      let devices = {
        selectedAudioDeviceId: '',
        selectedVideoDeviceId: '',
      }
      let updateState = false;
      if (audioDevices.length > 0 && this.state.selectedAudioDeviceId === '' && audioDevices[0].deviceId !== '') {
        devices.selectedAudioDeviceId = audioDevices[0].deviceId;
        updateState = true;
      }
      if (videoDevices.length > 0 && this.state.selectedVideoDeviceId === '' && videoDevices[0].deviceId !== '') {
        devices.selectedVideoDeviceId = videoDevices[0].deviceId;
        updateState = true;
      }
      if (updateState) {
        this.setState(devices);
      }
    }
  }

  clearTracksFromVideoRef = (videoRef) => {
    if (videoRef && videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks()
          .forEach(track => {
            track.stop();
            videoRef.current.srcObject.removeTrack(track);
          });
    }
  }

  handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
      this.recordedMediaType = event.data.type;
    }
  };

  startDisplayMediaStream = async () => {
    try {
      //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
      const displayMediaOptions = {
        video: {
          displaySurface: "browser",
        },
        audio: {
          suppressLocalAudioPlayback: false,
        },
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "include",
        surfaceSwitching: "include",
        monitorTypeSurfaces: "include",
      };
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
          .then(stream => {
            this.displayMediaRef.current.srcObject = stream;
            this.props.setSelectedDeviceTracks(stream.getTracks());
          });
      this.props.startDisplayMediaStream();
    } catch (error) {
      console.error('Error accessing AV streams:', error);
    }
  }

  stopDisplayMediaStream = () => {
    if (this.displayMediaRef.current && this.displayMediaRef.current.srcObject) {
      try {
        this.displayMediaRef.current.srcObject.getTracks()
            .forEach(track => {
              track.stop();
              this.displayMediaRef.current.srcObject.removeTrack(track);
            });

      } catch (error) {
        console.error('Error stopping AV streams:', error);
      }
    }
    this.props.stopDisplayMediaStream();
  };

  startMergedStream = () => {
    // Places the display media stream into StageView canvas
    // display media stream is scaled to fit the entire StageView canvas
    // Places the AV stream in the lower right corner of the StageView canvas
    // AV stream is scaled to fit the lower right corner of the StageView canvas

    const canvas = document.getElementsByClassName("StageView")[0];
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the stage view
    canvas.width = this.props.stageWidth || 1280;  // Default width if not provided
    canvas.height = this.props.stageHeight || 720;  // Default height if not provided

    const drawStreams = () => {
      // Draw display media stream to fill entire canvas
      if (this.props.displayMediaStream) {
        ctx.drawImage(this.props.displayMediaStream, 0, 0, canvas.width, canvas.height);
      }

      // Draw AV stream in lower right corner (using 1/4 of the canvas size)
      if (this.props.avStream) {
        const cornerWidth = canvas.width / 4;
        const cornerHeight = canvas.height / 4;
        const xPosition = canvas.width - cornerWidth - 20; // 20px padding from right
        const yPosition = canvas.height - cornerHeight - 20; // 20px padding from bottom

        ctx.drawImage(
            this.props.avStream,
            xPosition,
            yPosition,
            cornerWidth,
            cornerHeight
        );
      }

      // Request next animation frame
      requestAnimationFrame(drawStreams);
    };

    // Start the animation loop
    drawStreams();

    // Create a stream from the canvas
    this.canvasStageRef.current.srcObject = canvas.captureStream(30); // 30 FPS

    // Call the parent component's callback with the merged stream
    this.props.startMergedStream();
  };

  
  stopMergedStream = () => {

    this.props.stopMergedStream();
  }

  startRecording = () => {
    this.recordedChunks = [];
    this.startTime = Date.now();
    let mimeType = VideoCodecs[this.props.project.settings.video.codec].type;

    //insert audio codec after the video codec using regex, insert a comma between the codecs
    mimeType = mimeType.replace(/; codecs="(.*)"/, "; codecs=\"$1, " + AudioCodecs[this.props.project.settings.audio.codec].codec + "\"");

    if(MediaRecorder.isTypeSupported(mimeType)) {
      let options = {mimeType: mimeType};
      this.mediaRecorderRef.current = new MediaRecorder(this.videoRef.current.srcObject, options);
      this.mediaRecorderRef.current.ondataavailable = this.handleDataAvailable;
      this.mediaRecorderRef.current.start();

      this.props.startRecording();
    }else{
      console.error('MediaRecorder is not supported for the selected Video/Audio codecs: ' + mimeType);
    }
  };

  stopRecording = () => {
    this.mediaRecorderRef.current.onstop = () => {

      const blob = new Blob(this.recordedChunks, {type: this.recordedMediaType});

      MediaFileUtil.blobToArrayBuffer(blob, (dataUrl) => {

        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const trackName = "Track " + (this.props.project.trackIds.length + 1);
        const newId = Database.generateUUID();

        const track = new Track(newId, trackName, duration, dataUrl, blob.type,
            blob.size, this.startTime, endTime);

        this.props.saveTrackToProject(track);

        this.recordedChunks = [];
      });
    };

    this.mediaRecorderRef.current.stop();
    this.props.stopRecording();
  };

  getAVConstraints = () => {
    // API Doc: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints

    let videoHeight;
    let videoWidth;
    if (this.props.project.settings.video.resolution === 'Other') {
      videoHeight = this.props.project.settings.video.customHeight;
      videoWidth = this.props.project.settings.video.customWidth;
    } else {
      videoHeight = VideoResolutions[this.props.project.settings.video.resolution].height;
      videoWidth = VideoResolutions[this.props.project.settings.video.resolution].width;
    }

    return {
      audio: {
        autoGainControl: this.props.project.settings.audio.autoGainControl,
        channelCount: 1,
        deviceId: {
          exact: this.state.selectedAudioDeviceId,
        },
        echoCancellation: this.props.project.settings.audio.echoCancellation,
        noiseSuppression: this.props.project.settings.audio.noiseSuppression,
      },
      video: {
        deviceId: {
          exact: this.state.selectedVideoDeviceId,
        },
        frameRate: this.props.project.settings.video.frameRate,
        width: videoWidth,
        height: videoHeight,
        resizeMode: "none",
      }
    };
  }

  startAVStreams = async () => {
    try {
      const constraints = this.getAVConstraints();
      await navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {
            this.videoRef.current.srcObject = stream;
            this.props.setSelectedDeviceTracks(stream.getTracks());
          });
      this.props.startAVStream();
    } catch (error) {
      console.error('Error accessing AV streams:', error);
    }
  }
  stopAVStreams = () => {
    if (this.videoRef.current && this.videoRef.current.srcObject) {
      try {
        this.clearTracksFromVideoRef(this.videoRef);

      } catch (error) {
        console.error('Error stopping AV streams:', error);
      }
    }
    this.props.stopAVStream();
  };

  startPipStreams = async () => {
    try {
      const constraints = this.getAVConstraints();
      await navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {
            this.videoPipRef.current.srcObject = stream;
            this.videoPipRef.current.onloadedmetadata = () => {
              try {
                this.videoPipRef.current.requestPictureInPicture();
              } catch (error) {
                console.error('Error starting Pip:', error);
              }
            }
          });
      this.props.startPipStream();
    } catch (error) {
      console.error('Error accessing Pip streams:', error);
    }
  }

  stopPipStreams = () => {
    document.exitPictureInPicture()
        .then(() => {
        })
        .catch((error) => {
          console.error('Error stopping Pip:', error);
        });
    this.clearTracksFromVideoRef(this.videoPipRef);
    this.props.stopPipStream();
  }

  handleAudioDeviceChange = (event) => {
    const newDeviceId = event.target.value;
    this.setState({selectedAudioDeviceId: newDeviceId});
  };

  handleVideoDeviceChange = (event) => {
    const newDeviceId = event.target.value;
    this.setState({selectedVideoDeviceId: newDeviceId});
  };

  render() {
    return (
        <Table className="AVTrack">
          <tbody>
          <tr>
            <td className="VideoCell"><VideoComponent
                handleVideoDeviceChange={this.handleVideoDeviceChange}
                videoDevices={this.props.devices.filter(device => device.kind === 'videoinput')}
                selectedVideoDeviceId={this.state.selectedVideoDeviceId}
                videoRef={this.videoRef}/></td>
            <td className="DisplayMediaCell"><DisplayMediaViewer
                displayMediaRef={this.displayMediaRef}/></td>
            <td className="AudioCell"><AudioVisualizer
                enableVisualizer={this.props.streamingAV || this.props.streamingDisplayMedia}
                audioDevices={this.props.devices.filter(device => device.kind === 'audioinput')}
                selectedAudioTracks={this.props.selectedDeviceTracks.filter(device => device.kind === 'audio')}
                handleAudioDeviceChange={this.handleAudioDeviceChange}
                videoRef={this.videoRef}/></td>
          </tr>
          <tr>
            <td colSpan={3}>
              <div>
                <video ref={this.videoPipRef} className="displayNone" autoPlay></video>
                <Button
                    variant="primary"
                    onClick={this.startDisplayMediaStream}
                    className={this.props.streamingDisplayMedia
                    || this.state.selectedAudioDeviceId === ''
                    || this.props.recording
                        ? 'displayNone' : ''}><FaPlay/> Start Display Streams
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopDisplayMediaStream}
                    className={!this.props.streamingDisplayMedia
                    || this.props.recording
                        ? 'displayNone' : ''}><FaSquare/> Stop Display Streams
                </Button>
                <Button
                    variant="primary"
                    onClick={this.startAVStreams}
                    className={this.props.streamingAV
                    || (this.state.selectedVideoDeviceId === '' && this.state.selectedAudioDeviceId === '')
                    || this.props.recording
                        ? 'displayNone' : ''}><FaPlay/> Start AV Streams
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopAVStreams}
                    className={!this.props.streamingAV
                    || this.props.recording
                        ? 'displayNone' : ''}><FaSquare/> Stop AV Streams
                </Button>
                <Button
                    variant="primary"
                    onClick={this.startPipStreams}
                    className={!this.props.streamingDisplayMedia
                    || this.props.streamingAV
                    || this.props.streamingPip
                        ? 'displayNone' : ''}><FaPlay/> Start Picture-in-Picture
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopPipStreams}
                    className={!this.props.streamingPip
                        ? 'displayNone' : ''}><FaSquare/> Stop Picture-in-Picture
                </Button>
                <Button
                    variant="primary"
                    onClick={this.startMergedStream}
                    className={!this.props.streamingAV
                    || !this.props.streamingDisplayMedia
                    || this.props.streamingStage
                    || this.props.recording
                        ? 'displayNone' : ''}><FaPlay/> Start Merge
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopMergedStream}
                    className={!this.props.streamingStage
                    || this.props.recording
                        ? 'displayNone' : ''}><FaSquare/> Stop Merge
                </Button>
                <Button
                    variant="danger"
                    onClick={this.startRecording}
                    className={(!this.props.streamingAV && !this.props.streamingDisplayMedia)
                    || this.props.recording
                        ? 'displayNone' : ''}><FaCircle/> Start Recording
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopRecording}
                    className={!this.props.recording
                        ? 'displayNone' : ''}><FaSquare/> Stop Recording
                </Button>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <div>
                <canvas className="StageView" ref={this.canvasStageRef}></canvas>
              </div>
            </td>
          </tr>
          </tbody>
        </Table>
    );
  }
}

export default AVTrack;
