import './AudioVisualizer.css'
import React, { Component } from 'react';
import PropTypes from "prop-types";
import Form from 'react-bootstrap/Form';
import {FaMicrophone} from "react-icons/fa";

class AudioVisualizer extends Component {
  static propTypes = {
    audioDevices: PropTypes.array,
    enableVisualizer: PropTypes.bool,
    handleAudioDeviceChange: PropTypes.func,
    selectedAudioTracks: PropTypes.array,
  }
  constructor(props) {
    super(props);
    this.state = {
    };

    this.canvasRef = React.createRef();
    this.animationId = null;
    this.audioContext = null;

    this.closeAudioContext = this.closeAudioContext.bind(this);
    this.handleStream = this.handleStream.bind(this);
    this.setupAudioContext = this.setupAudioContext.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.enableVisualizer && !prevProps.enableVisualizer && this.props.selectedAudioTracks.length > 0){
      this.setupAudioContext();
    }else if(!this.props.enableVisualizer && prevProps.enableVisualizer){
      this.closeAudioContext();
    }
  }

  componentWillUnmount() {
    this.closeAudioContext();
  }

  setupAudioContext = () => {
    if(this.audioContext === null || this.audioContext.state === 'closed'){
      console.log("Setting up audio context")
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.handleStream();
    }
  };

  closeAudioContext = () => {
    cancelAnimationFrame(this.animationId);
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  handleStream = () => {
    const mediaStream = new MediaStream(this.props.selectedAudioTracks);
    const source= this.audioContext.createMediaStreamSource(mediaStream);
    source.connect(this.analyser);
    this.draw();
  };

  draw = () => {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    this.animationId = requestAnimationFrame(this.draw);

    this.analyser.getByteTimeDomainData(this.dataArray);

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';

    ctx.beginPath();

    let sliceWidth = width / this.dataArray.length;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      let v = this.dataArray[i] / 128.0;
      let y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, height / 2);
    ctx.stroke();
  };

  render() {
    return (
        <div className="AudioDeviceSettings">
          <canvas ref={this.canvasRef} width="400" height="300"/>
          <h5><FaMicrophone /> Audio Device</h5>
          <Form.Select value={this.props.selectedAudioDeviceId} onChange={this.props.handleAudioDeviceChange}>
            {this.props.audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Audio Device ${device.deviceId}`}
                </option>
            ))}
          </Form.Select>

        </div>
    );
  }
}

export default AudioVisualizer;
