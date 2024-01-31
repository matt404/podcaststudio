import './ProjectTracksView.css';
import React, {Component} from 'react';
import {Button, Table} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaArrowDown, FaArrowUp, FaDownload, FaRegTrashAlt} from "react-icons/fa";
import MediaFileUtil from "../../util/MediaFileUtil";

class ProjectTracksView extends Component {
  static propTypes = {
    project: PropTypes.object,
    projectTracks: PropTypes.array,
    deleteProjectTrack: PropTypes.func,
    moveProjectTrackUp: PropTypes.func,
    moveProjectTrackDown: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {};

    this.downloadProjectTrack = this.downloadProjectTrack.bind(this);
    this.sumBlobSize = this.sumBlobSize.bind(this);
    this.sumDuration = this.sumDuration.bind(this);
  }

  downloadProjectTrack(track) {
    MediaFileUtil.dataUrlToBlob(track.blob, (blob) => {
      const dataUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = this.props.project.name + " - " + track.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(dataUrl);
    })

  }

  sumBlobSize(array) {
    return MediaFileUtil.formatBytes(array.reduce((totalSize, obj) => {
      return totalSize + (obj.blobSize || 0);
    }, 0));
  }

  sumDuration(array) {
    return MediaFileUtil.formatDuration(array.reduce((totalSize, obj) => {
      return totalSize + (obj.duration || 0);
    }, 0));
  }

  render() {
    return (
        <div className="ProjectTracks">
          <div className="ProjectTrackStats">
            <div id="TrackCount">Track Count: {this.props.projectTracks.length}</div>
            <div id="TotalTrackSize">Total Size: {this.sumBlobSize(this.props.projectTracks)}</div>
            <div id="TotalTrackDuration">Total Runtime: {this.sumDuration(this.props.projectTracks)}</div>
          </div>
          <Table variant={"dark"} striped bordered hover>
            <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Track Name</th>
              <th>Duration</th>
              <th>Size</th>
              <th>Preview</th>
              <th>&nbsp;</th>
            </tr>
            </thead>
            <tbody>
            {this.props.projectTracks && this.props.projectTracks.map((track, index) => {
              const blob = new Blob([track.blob], {type: track.mediaType});
              const url = URL.createObjectURL(blob);
              return (
                  <tr key={track.id}>
                    <td><input type={"checkbox"} name="projectTracks" value={track.id} defaultChecked={true}/></td>
                    <td>{track.name}</td>
                    <td>{MediaFileUtil.formatDuration(track.duration)}</td>
                    <td>{MediaFileUtil.formatBytes(track.blobSize)}</td>
                    <td className="track-preview">
                      <video controls>
                        <source src={url} type={track.mediaType}/>
                        Your browser does not support the video element.
                      </video>
                    </td>
                    <td className="padRight" align={"right"}>
                      <Button variant="secondary" onClick={() => {
                        this.props.moveProjectTrackUp(index)
                      }}><FaArrowUp/></Button>
                      <Button variant="secondary" className="padRight" onClick={() => {
                        this.props.moveProjectTrackDown(index)
                      }}><FaArrowDown/></Button>
                      <Button variant="secondary" className="padRight" onClick={() => {
                        this.downloadProjectTrack(track)
                      }}><FaDownload/></Button>
                      <Button variant="dark" onClick={() => {
                        this.props.deleteProjectTrack(track.id)
                      }}><FaRegTrashAlt/></Button>
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </Table>
        </div>
    );
  }
}

export default ProjectTracksView;