import './AVTrack.css';
import Track from '../model/Track.js';
import React, {Component} from 'react';
import AudioVisualizer from "./AudioVisualizer";
import {Table} from "react-bootstrap";
import VideoComponent from "./VideoComponent";
import PropTypes from "prop-types";
import MediaFileUtil from "../util/MediaFileUtil";

class AVTrack extends Component {
  static propTypes = {
    devices: PropTypes.array,
    project: PropTypes.object,
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    saveTrackToProject: PropTypes.func,
    selectedDeviceTracks: PropTypes.array,
    setSelectedDeviceTracks: PropTypes.func,
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
    this.startAVStreams = this.startAVStreams.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopAVStreams = this.stopAVStreams.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
  }

  componentDidUpdate() {
    if(this.props.devices.length > 0){
      const audioDevices = this.props.devices.filter(device => device.kind === 'audioinput');
      const videoDevices = this.props.devices.filter(device => device.kind === 'videoinput');
      let devices = {
        selectedAudioDeviceId: '',
        selectedVideoDeviceId: '',
      }
      let updateState = false;
      if(audioDevices.length > 0 && this.state.selectedAudioDeviceId === '' && audioDevices[0].deviceId !== ''){
        devices.selectedAudioDeviceId = audioDevices[0].deviceId;
        updateState = true;
      }
      if(videoDevices.length > 0 && this.state.selectedVideoDeviceId === '' && videoDevices[0].deviceId !== ''){
        devices.selectedVideoDeviceId = videoDevices[0].deviceId;
        updateState = true;
      }
      if(updateState){
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

      const blob = new Blob(this.recordedChunks, { type: this.recordedMediaType });

      MediaFileUtil.blobToDataUrl(blob, (dataUrl) => {

        const endTime = Date.now(); // Record the end time
        const duration = endTime - this.startTime; // Calculate the duration
        const trackName = "Track " + (this.props.project.trackIds.length + 1);

        const track = new Track(this.props.project.trackIds.length, trackName, duration, dataUrl, blob.type,
            this.startTime, endTime);

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
          width: 640,
          height: 480,
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
    this.setState({ selectedAudioDeviceId: newDeviceId });
  };

  handleVideoDeviceChange = (event) => {
    const newDeviceId = event.target.value;
    this.setState({ selectedVideoDeviceId: newDeviceId });
  };

  render() {
    return (
        <Table variant="dark">
          <tbody>
          <tr>
            <td className="VideoCell"><VideoComponent
                handleVideoDeviceChange={this.handleVideoDeviceChange}
                videoDevices={this.props.devices.filter(device => device.kind === 'videoinput')}
                selectedVideoDeviceId={this.state.selectedVideoDeviceId}
                streaming={this.props.streaming}
                recording={this.props.recording}
                videoRef={this.videoRef}/></td>
            <td className="AudioCell"><AudioVisualizer
                audioDevices={this.props.devices.filter(device => device.kind === 'audioinput')}
                videoRef={this.videoRef}
                handleAudioDeviceChange={this.handleAudioDeviceChange}
                mediaStream={this.state.mediaStream}
                selectedAudioDeviceId={this.state.selectedAudioDeviceId}
                recording={this.props.recording}
                streaming={this.props.streaming}/></td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div>
                <button
                    onClick={this.startAVStreams}
                    disabled={this.props.streaming || (this.state.selectedVideoDeviceId === '' && this.state.selectedAudioDeviceId === '')}>Start AV Streams
                </button>
                <button
                    onClick={this.stopAVStreams}
                    disabled={!this.props.streaming || this.props.recording}>Stop AV Streams
                </button>
              </div>
              <div>
                <button
                    onClick={this.startRecording}
                    disabled={this.props.recording || !this.props.streaming}>Start Recording
                </button>
                <button
                    onClick={this.stopRecording}
                    disabled={!this.props.recording}>Stop Recording
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </Table>
    );
  }
}

export default AVTrack;
