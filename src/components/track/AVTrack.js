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

class AVTrack extends Component {
  static propTypes = {
    devices: PropTypes.array,
    project: PropTypes.object,
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    streamingDisplayMedia: PropTypes.bool,
    streamingPip: PropTypes.bool,
    saveTrackToProject: PropTypes.func,
    selectedDeviceTracks: PropTypes.array,
    setSelectedDeviceTracks: PropTypes.func,
    startDisplayMediaStreams: PropTypes.func,
    stopDisplayMediaStreams: PropTypes.func,
    startStreamingPip: PropTypes.func,
    stopStreamingPip: PropTypes.func,
    startRecording: PropTypes.func,
    stopRecording: PropTypes.func,
    startStreaming: PropTypes.func,
    stopStreaming: PropTypes.func,
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
    this.videoRef = React.createRef();
    this.videoPipRef = React.createRef();
    this.mediaRecorderRef = React.createRef();

    this.clearTracksFromVideoRef = this.clearTracksFromVideoRef.bind(this);
    this.getAVConstraints = this.getAVConstraints.bind(this);
    this.handleAudioDeviceChange = this.handleAudioDeviceChange.bind(this);
    this.handleDataAvailable = this.handleDataAvailable.bind(this);
    this.handleVideoDeviceChange = this.handleVideoDeviceChange.bind(this);
    this.startDisplayMediaStreams = this.startDisplayMediaStreams.bind(this);
    this.stopDisplayMediaStreams = this.stopDisplayMediaStreams.bind(this);
    this.startAVStreams = this.startAVStreams.bind(this);
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

  startDisplayMediaStreams = async () => {
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
            this.videoRef.current.srcObject = stream;
            this.props.setSelectedDeviceTracks(stream.getTracks());
          });
      this.props.startStreamingDisplayMedia();
    } catch (error) {
      console.error('Error accessing AV streams:', error);
    }
  }

  stopDisplayMediaStreams = () => {
    if (this.videoRef.current && this.videoRef.current.srcObject) {
      try {
        this.videoRef.current.srcObject.getTracks()
            .forEach(track => {
              track.stop();
              this.videoRef.current.srcObject.removeTrack(track);
            });

      } catch (error) {
        console.error('Error stopping AV streams:', error);
      }
    }
    this.props.stopStreamingDisplayMedia();
  };

  startRecording = () => {
    this.recordedChunks = [];
    this.startTime = Date.now();
    let mimeType = VideoCodecs[this.props.project.settings.video.codec].type;

    //insert audio codec after the video codec using regex, insert a comma between the codecs
    mimeType = mimeType.replace(/; codecs="(.*)"/, "; codecs=\"$1, " + AudioCodecs[this.props.project.settings.audio.codec].codec + "\"");
    let options = {mimeType: mimeType};
    this.mediaRecorderRef.current = new MediaRecorder(this.videoRef.current.srcObject, options);
    this.mediaRecorderRef.current.ondataavailable = this.handleDataAvailable;
    this.mediaRecorderRef.current.start();

    this.props.startRecording();
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
      this.props.startStreaming();
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
    this.props.stopStreaming();
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
      this.props.startStreamingPip();
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
    this.props.stopStreamingPip();
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
            <td className="AudioCell"><AudioVisualizer
                enableVisualizer={this.props.streaming || this.props.streamingDisplayMedia}
                audioDevices={this.props.devices.filter(device => device.kind === 'audioinput')}
                selectedAudioTracks={this.props.selectedDeviceTracks.filter(device => device.kind === 'audio')}
                handleAudioDeviceChange={this.handleAudioDeviceChange}
                videoRef={this.videoRef}/></td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div>
                <video ref={this.videoPipRef} className="displayNone" autoPlay></video>
                <Button
                    variant="primary"
                    onClick={this.startDisplayMediaStreams}
                    className={this.props.streaming
                    || this.props.streamingDisplayMedia
                    || this.state.selectedAudioDeviceId === ''
                        ? 'displayNone' : ''}><FaPlay/> Start Display Streams
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopDisplayMediaStreams}
                    className={!this.props.streamingDisplayMedia
                    || this.props.recording
                        ? 'displayNone' : ''}><FaSquare/> Stop Display Streams
                </Button>
                <Button
                    variant="primary"
                    onClick={this.startAVStreams}
                    className={this.props.streaming
                    || this.props.streamingDisplayMedia
                    || (this.state.selectedVideoDeviceId === '' && this.state.selectedAudioDeviceId === '')
                        ? 'displayNone' : ''}><FaPlay/> Start AV Streams
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopAVStreams}
                    className={!this.props.streaming
                    || this.props.recording
                        ? 'displayNone' : ''}><FaSquare/> Stop AV Streams
                </Button>
                <Button
                    variant="primary"
                    onClick={this.startPipStreams}
                    className={!this.props.streamingDisplayMedia || this.props.streamingPip
                        ? 'displayNone' : ''}><FaPlay/> Start Picture-in-Picture
                </Button>
                <Button
                    variant="warning"
                    onClick={this.stopPipStreams}
                    className={!this.props.streamingPip
                        ? 'displayNone' : ''}><FaSquare/> Stop Picture-in-Picture
                </Button>
                <Button
                    variant="danger"
                    onClick={this.startRecording}
                    className={(!this.props.streaming && !this.props.streamingDisplayMedia)
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
          </tbody>
        </Table>
    );
  }
}

export default AVTrack;
