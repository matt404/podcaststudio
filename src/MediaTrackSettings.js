import './MediaTrackSettings.css'
import React from 'react';
import PropTypes from "prop-types";
import {Table} from "react-bootstrap";

class MediaTrackSettings extends React.Component {
  static propTypes = {
    tracks: PropTypes.array,
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
        <div className="MediaTrackSettings">
          {this.props.tracks.map(track => (
              <Table className="MediaTrackSettings" variant="dark" key={track.id}>
                <tbody>
                  <tr>
                    <td colSpan={2} className="text-left">{track.kind} settings</td>
                  </tr>
                  <tr>
                    <td>Label</td>
                    <td>{track.label}</td>
                  </tr>
                  <tr>
                    <td>Enabled</td>
                    <td>{track.enabled.toString()}</td>
                  </tr>
                </tbody>

                {Object.keys(track.getSettings()).map(keyName => (
                    <tbody key={keyName}>
                      <tr>
                        <td>{keyName}:</td>
                        <td>{track.getSettings()[keyName]}</td>
                      </tr>
                    </tbody>
                ))}
              </Table>
          ))}
        </div>
    );
  }
}

export default MediaTrackSettings;