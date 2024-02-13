import './ListCodecSupport.css';
import React, { Component } from 'react';
import {Table} from "react-bootstrap";


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
    const codecConfigurations = [
      {
        contentType: 'video/mp4; codecs="avc1.42E01E"',
        description: 'H.264',
      },
      {
        contentType: 'video/webm; codecs="vp8"',
        description: 'WebM VP8',
      },
      {
        contentType: 'video/webm; codecs="vp9.0.28.0"',
        description: 'WebM VP9',
      },
      {
        contentType: 'video/mp4; codecs="hev1"',
        description: 'HEVC',
      },
      {
        contentType: 'video/mp4; codecs="av01.0.05M.08"',
        description: 'AV1',
      },
      {
        contentType: 'video/mp4; codecs="mp4a.40.2"',
        description: 'AAC',
      },
      {
        contentType: 'video/webm; codecs="opus"',
        description: 'Opus',
      },
      {
        contentType: 'video/webm; codecs="vorbis"',
        description: 'Vorbis',
      }
    ];
    Promise.all(codecConfigurations.map(this.checkCodecSupport)).then(supportedCodecs => {
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