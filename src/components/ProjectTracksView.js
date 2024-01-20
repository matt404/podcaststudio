import './ProjectTracksView.css';
import React, {Component} from 'react';
import {Button, Table} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaDownload} from "react-icons/fa";
import MediaFileUtil from "../util/MediaFileUtil";

class ProjectTracksView extends Component {
    static propTypes = {
        project: PropTypes.object,
    }
    constructor(props) {
        super(props);

        this.state = {
        };

        this.downloadProjectTrack = this.downloadProjectTrack.bind(this);
    }

    downloadProjectTrack(track){
        MediaFileUtil.dataUrlToBlob(track.blob, (blob)=>{
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

    render() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>&nbsp;</th>
                        <th>Track Name</th>
                        <th>Track Duration</th>
                        <th>Preview</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.project && this.props.project.trackIds.map(trackId => {
                        const trackKey = "project_"+this.props.project.id+"_track_"+trackId;
                        const track = JSON.parse(window.localStorage.getItem(trackKey));
                        return (
                            <tr key={track.id}>
                                <td><input type={"checkbox"} /></td>
                                <td>{track.name}</td>
                                <td>{track.duration}</td>
                                <td className="track-preview">
                                    <video controls>
                                        <source src={track.blob} type={track.mediaType} />
                                        Your browser does not support the video element.
                                    </video>
                                </td>
                                <td align={"right"}><Button onClick={()=>{this.downloadProjectTrack(track)}}><FaDownload/></Button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }



}

export default ProjectTracksView;
