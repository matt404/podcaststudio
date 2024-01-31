import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap';
import navlogo from "../navlogo.png";

const showModalStorageKey = 'WelcomeMessage.showModal';

class WelcomeMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: localStorage.getItem(showModalStorageKey) !== 'false'
    };
  }

  handleClose = () => {
    this.setState({showModal: false}, () => {
      localStorage.setItem(showModalStorageKey, this.state.showModal);
    });
  }

  render() {
    return (
      <Modal show={this.state.showModal} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title><img alt="logo" src={navlogo}/> Welcome to PodCastStudio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Getting Started...</h5>
          <p>Podcasts are organized into Projects which are broken down by Tracks which can be arranged and exported
          to a single video file.</p>
          <h5>Recording a Podcast</h5>
          <ol>
            <li>Click the "New Project" button to create a new project.</li>
            <li>Click the "Start Display Streams" or "Start AV Stream" button to activate a stream.</li>
            <li>Click the "Start Recording" button to start recording a new track.</li>
            <li>Click the "Stop Recording" button to stop recording.  The result is displayed as a new track.</li>
            <li>Use the Track arrows to created the desired arrangement.</li>
            <li>Select the tracks you wish to export</li>
            <li>Click the "Project > Export" menu to export the project as a single video file.</li>
          </ol>
          <p>PodCastStudio is open source and community contributions are welcome.</p>
          <p>For more detailed information, please visit our <a target="_blank" href="https://github.com/matt404/podcaststudio"
                                                                style={{color: '#ffc107'}}>source code repo</a>.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default WelcomeMessage;