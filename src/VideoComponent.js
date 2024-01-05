import './VideoComponent.css'
import React, {Component} from 'react';
import PropTypes from "prop-types";

class VideoComponent extends Component {
  static propTypes = {
    videoDevices: PropTypes.array,
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    selectedVideoDeviceId: PropTypes.string,
    handleVideoDeviceChange: PropTypes.func,
    startVideoStream: PropTypes.func,
    stopVideoStream: PropTypes.func,
    videoRef: PropTypes.any,
  }
  constructor(props) {
    super(props);

    this.state = {
    };

  }

  componentDidMount() {

  }

  render() {
    return (
        <div>
          <video ref={this.props.videoRef} autoPlay></video>
          <h5>Video Device</h5>
          <select value={this.props.selectedVideoDeviceId} onChange={this.props.handleVideoDeviceChange}>
            {this.props.videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Video Device ${device.deviceId}`}
                </option>
            ))}
          </select>

        </div>
    );
  }
}

export default VideoComponent;
