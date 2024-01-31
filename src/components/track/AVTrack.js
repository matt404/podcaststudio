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

class AVTrack extends Component {
  static propTypes = {
    devices: PropTypes.array,
    project: PropTypes.object,
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    streamingDisplayMedia: PropTypes.bool,
    saveTrackToProject: PropTypes.func,
    selectedDeviceTracks: PropTypes.array,
    setSelectedDeviceTracks: PropTypes.func,
    startDisplayMediaStreams: PropTypes.func,
    stopDisplayMediaStreams: PropTypes.func,
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
    this.mediaRecorderRef = React.createRef();

    this.handleAudioDeviceChange = this.handleAudioDeviceChange.bind(this);
    this.handleDataAvailable = this.handleDataAvailable.bind(this);
    this.handleVideoDeviceChange = this.handleVideoDeviceChange.bind(this);
    this.startDisplayMediaStreams = this.startDisplayMediaStreams.bind(this);
    this.stopDisplayMediaStreams = this.stopDisplayMediaStreams.bind(this);
    this.startAVStreams = this.startAVStreams.bind(this);
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
    this.startTime = Date.now(); // Record the start time

    this.mediaRecorderRef.current = new MediaRecorder(this.videoRef.current.srcObject);
    this.mediaRecorderRef.current.ondataavailable = this.handleDataAvailable;
    this.mediaRecorderRef.current.start();

    this.props.startRecording();
  };

  stopRecording = () => {
    this.mediaRecorderRef.current.onstop = () => {

      const blob = new Blob(this.recordedChunks, {type: this.recordedMediaType});

      MediaFileUtil.blobToArrayBuffer(blob, (dataUrl) => {

        const endTime = Date.now(); // Record the end time
        const duration = endTime - this.startTime; // Calculate the duration
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

  startAVStreams = async () => {
    try {
      //https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
      const constraints = {
        audio: {
          autoGainControl: false,
          channelCount: 1,
          deviceId: {
            exact: this.state.selectedAudioDeviceId,
          },
          echoCancellation: false,
          noiseSuppression: false,
          // sampleRate: 44100,
          // sampleSize: 16,
        },
        video: {
          // aspectRatio: ,
          deviceId: {
            exact: this.state.selectedVideoDeviceId,
          },
          frameRate: 15,
          width: 1280,
          height: 720,
          resizeMode: "none",
        }
      };
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
        this.videoRef.current.srcObject.getTracks()
            .forEach(track => {
              track.stop();
              this.videoRef.current.srcObject.removeTrack(track);
            });

      } catch (error) {
        console.error('Error stopping AV streams:', error);
      }
    }
    this.props.stopStreaming();
  };

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
