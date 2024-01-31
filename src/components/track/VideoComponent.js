import './VideoComponent.css'
import React, {Component} from 'react';
import PropTypes from "prop-types";
import Form from 'react-bootstrap/Form';
import {FaVideo} from "react-icons/fa";

class VideoComponent extends Component {
  static propTypes = {
    videoDevices: PropTypes.array,
    selectedVideoDeviceId: PropTypes.string,
    handleVideoDeviceChange: PropTypes.func,
    videoRef: PropTypes.any,
  }
  constructor(props) {
    super(props);

    this.state = {
    };

  }

  render() {
    return (
        <div className="VideoDeviceSettings">
          <video ref={this.props.videoRef} autoPlay></video>
          <h5><FaVideo /> Video Device</h5>
          <Form.Select value={this.props.selectedVideoDeviceId} onChange={this.props.handleVideoDeviceChange}>
            {this.props.videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Video Device ${device.deviceId}`}
                </option>
            ))}
          </Form.Select>

        </div>
    );
  }
}

export default VideoComponent;
