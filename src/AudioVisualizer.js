import './AudioVisualizer.css'
import React, { Component } from 'react';
import PropTypes from "prop-types";

class AudioVisualizer extends Component {
  static propTypes = {
    audioDevices: PropTypes.array,
    handleAudioDeviceChange: PropTypes.func,
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    selectedAudioDeviceId: PropTypes.string,
    startAudioStream: PropTypes.func,
    stopAudioStream: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
    };

    this.canvasRef = React.createRef();
    this.animationId = null;

    this.closeAudioContext = this.closeAudioContext.bind(this);
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    if(this.props.streaming){
      this.setupAudioContext();
    }else{
      this.closeAudioContext();
    }
  }

  componentWillUnmount() {
  }

  setupAudioContext = () => {
    if(this.props.selectedAudioDeviceId !== '') {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const constraints = {
        audio: {
          exact: {
            deviceId: this.props.selectedAudioDeviceId
          }
        }
      };

      navigator.mediaDevices.getUserMedia(constraints)
          .then(this.handleStream)
          .catch(err => console.error('Error accessing audio stream:', err));
    }
  };

  closeAudioContext = () => {
    cancelAnimationFrame(this.animationId);
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  handleStream = (stream) => {
    console.log("handleStream", stream);
    const source= this.audioContext.createMediaStreamSource(stream);
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
        <div>
          <canvas ref={this.canvasRef} width="400" height="300"/>
          <h5>Audio Device</h5>
          <select value={this.props.selectedAudioDeviceId} onChange={this.props.handleAudioDeviceChange}>
            {this.props.audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Audio Device ${device.deviceId}`}
                </option>
            ))}
          </select>

        </div>
    );
  }
}

export default AudioVisualizer;
