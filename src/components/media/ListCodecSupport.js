import './ListCodecSupport.css';
import React, {Component} from 'react';
import {Table} from "react-bootstrap";
import VideoCodecs from "../../constants/VideoCodecs";


class ListCodecSupport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supportedCodecs: [],
    };
  }

  checkCodecSupport = (codec) => {
    const config = {
      type: 'file',
      video: {
        contentType: codec.contentType,
        bitrate: 0,
        framerate: 1,
        width: 1280,
        height: 720,
      },
    };

    return navigator.mediaCapabilities.decodingInfo(config).then(info => {
      return {
        codec: codec.description,
        supported: info.supported,
      };
    });
  };

  componentDidMount() {
    Promise.all(VideoCodecs.map(this.checkCodecSupport)).then(supportedCodecs => {
      this.setState({ supportedCodecs });
    });
  }

  render() {
    return (
        <div className="ListCodecSupport">
          <Table>
            <thead>
            <tr>
              <th>Codec</th>
              <th>Supported</th>
            </tr>
            </thead>
            <tbody>
            {this.state.supportedCodecs.map(codec => (
                <tr key={codec.codec}>
                  <td>{codec.codec}</td>
                  <td>{codec.supported ? 'Yes' : 'No'}</td>
                </tr>
            ))}
            </tbody>
          </Table>
        </div>
    );
  }
}

export default ListCodecSupport;