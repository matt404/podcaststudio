import './ProjectSettingsView.css'
import React, {Component} from 'react';
import {Accordion, Form, InputGroup} from "react-bootstrap";
import VideoResolutions from '../../constants/VideoResolutions.js';
import PropTypes from "prop-types";
import ProjectSettings from "../../model/ProjectSettings"; // import VideoResolutions

class ProjectSettingsView extends Component {
  static propTypes = {
    project: PropTypes.object,
    setProjectSettings: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {};

    this.inputTimeoutMS = 400;
    this.inputTimeoutId = null;

    this.handleSettingsChange = this.handleSettingsChange.bind(this);
  }

  handleSettingsChange = (event) => {

    let settings = new ProjectSettings();
    settings.audio.autoGainControl = document.getElementById('AutoGainControl').checked;
    settings.audio.echoCancellation = document.getElementById('EchoCancellation').checked;
    settings.audio.noiseSuppression = document.getElementById('NoiseSuppression').checked;
    settings.video.frameRate = parseInt(document.getElementById('FrameRate').value);
    settings.video.resolution = document.getElementById('VideoResolution').value;
    settings.video.customWidth = document.getElementById('CustomWidth') ? parseInt(document.getElementById('CustomWidth').value) : 0;
    settings.video.customHeight = document.getElementById('CustomHeight') ? parseInt(document.getElementById('CustomHeight').value) : 0;

    this.props.setProjectSettings(settings);

  }

  render() {
    // Video Settings
    let customHeight = 0;
    let customWidth = 0;
    let resolution = "HD";
    let frameRate = 0;

    // Audio Settings
    let autoGainControl = false;
    let echoCancellation = false;
    let noiseSuppression = false;

    if(this.props.project){
      customHeight = this.props.project.settings.video.customHeight;
      customWidth = this.props.project.settings.video.customWidth;
      frameRate = this.props.project.settings.video.frameRate;
      resolution = this.props.project.settings.video.resolution;
      autoGainControl = this.props.project.settings.audio.autoGainControl;
      echoCancellation = this.props.project.settings.audio.echoCancellation;
      noiseSuppression = this.props.project.settings.audio.noiseSuppression;
    }
    return (
        <div>
          <Accordion defaultActiveKey={['0','1']} alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Video Settings</Accordion.Header>
              <Accordion.Body>
                <Form.Label>Resolution</Form.Label>
                <Form.Select id={"VideoResolution"} aria-label="Default select example" value={resolution} onChange={this.handleSettingsChange}>
                  {Object.keys(VideoResolutions).map(key => (
                      <option key={key} value={key}>{VideoResolutions[key].name}</option>
                  ))}
                  <option value="OTHER">Other</option>
                </Form.Select>
                {resolution === 'OTHER' && (
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Width</InputGroup.Text>
                      <Form.Control type="number" id={"CustomWidth"} placeholder="Enter custom width" value={customWidth} onChange={this.handleSettingsChange} />
                      <InputGroup.Text>Height</InputGroup.Text>
                      <Form.Control type="number" id={"CustomHeight"} placeholder="Enter custom height" value={customHeight} onChange={this.handleSettingsChange} />
                    </InputGroup>
                )}
                <Form.Group controlId="FrameRate">
                  <Form.Label>Frame Rate</Form.Label>
                  <Form.Control type="number" value={frameRate} onChange={this.handleSettingsChange} />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Audio Settings</Accordion.Header>
              <Accordion.Body>
                <Form.Group controlId="AutoGainControl">
                  <Form.Check type="checkbox" label="Auto Gain Control" checked={autoGainControl} onChange={this.handleSettingsChange} />
                </Form.Group>
                <Form.Group controlId="EchoCancellation">
                  <Form.Check type="checkbox" label="Echo Cancelation" checked={echoCancellation} onChange={this.handleSettingsChange} />
                </Form.Group>
                <Form.Group controlId="NoiseSuppression">
                  <Form.Check type="checkbox" label="Noise Suppression" checked={noiseSuppression} onChange={this.handleSettingsChange} />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
    );
  }
}

export default ProjectSettingsView;