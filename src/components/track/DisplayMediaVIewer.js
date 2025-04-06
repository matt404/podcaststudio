import './VideoComponent.css'
import React, {Component} from 'react';
import PropTypes from "prop-types";
import Form from 'react-bootstrap/Form';
import {FaVideo} from "react-icons/fa";

class DisplayMediaViewer extends Component {
  static propTypes = {
    displayMediaRef: PropTypes.any,
  }

  constructor(props) {
    super(props);

    this.state = {};

  }

  render() {
    return (
        <div className="DisplayMediaViewerSettings">
          <video ref={this.props.displayMediaRef} autoPlay></video>
          <h5><FaVideo/> Display Media</h5>

        </div>
    );
  }
}

export default DisplayMediaViewer;
