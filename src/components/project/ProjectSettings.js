import './ProjectSettings.css'
import React, {Component} from 'react';
import {Accordion} from "react-bootstrap";

class ProjectSettings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      project: {
        id: '',
        name: '',
        trackIds: []
      }
    };
  }

  render() {
    return (
        <div>
          <Accordion defaultActiveKey={['0']} alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Video Settings</Accordion.Header>
              <Accordion.Body>

              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Audio Settings</Accordion.Header>
              <Accordion.Body>

              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
    );
  }
}

export default ProjectSettings;
