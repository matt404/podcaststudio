import './ListCodecSupport.css';
import React, {Component} from 'react';
import {Table} from "react-bootstrap";
import PropTypes from "prop-types";
import VideoCodecs from "../../constants/VideoCodecs";
import AudioCodecs from "../../constants/AudioCodecs";


class ListCodecSupport extends Component {
  static propTypes = {
    supportedAudioCodecs: PropTypes.array,
    supportedVideoCodecs: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <div className="ListCodecSupport">
          <Table>
            <thead>
            <tr>
              <th>Type</th>
              <th>Codec</th>
              <th>Description</th>
              <th>MimeType</th>
              <th>Supported</th>
            </tr>
            </thead>
            <tbody>
            {Object.keys(VideoCodecs).map(key => (
                <tr key={key}>
                  <td>Video</td>
                  <td>{VideoCodecs[key].name}</td>
                  <td>{VideoCodecs[key].description}</td>
                  <td>{VideoCodecs[key].type}</td>
                  <td>{this.props.supportedVideoCodecs.includes(key) ? 'Yes' : 'No'}</td>
                </tr>
            ))}
            {Object.keys(AudioCodecs).map(key => (
                <tr key={key}>
                  <td>Audio</td>
                  <td>{AudioCodecs[key].name}</td>
                  <td>{AudioCodecs[key].description}</td>
                  <td>{AudioCodecs[key].type}</td>
                  <td>{this.props.supportedAudioCodecs.includes(key) ? 'Yes' : 'No'}</td>
                </tr>
            ))}
            </tbody>
          </Table>
        </div>
    );
  }
}

export default ListCodecSupport;