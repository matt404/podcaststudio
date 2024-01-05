import './App.css';
import React, {Component} from "react";
import {Container, Row, Col, Tab, Tabs} from "react-bootstrap";
import ListAllDevices from "./ListAllDevices";
import AVTrack from "./AVTrack";
import ProjectInfo from "./ProjectInfo";
import MainNavBar from "./MainNavBar";
import ListAllSupportedConstraints from "./ListAllSupportedConstraints";
import MediaTrackSettings from "./MediaTrackSettings";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      supportedConstraints: {},
      recording: false,
      streaming: false,
      selectedTracks: [],
      projectInfo: {
        projectName: '',
        projectDesc: '',
      },
      footerWindowOpen: false,
    };
    this.fetchDevices = this.fetchDevices.bind(this);
    this.setProjectInfo = this.setProjectInfo.bind(this);
    this.setSelectedTracks = this.setSelectedTracks.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.startStreaming = this.startStreaming.bind(this);
    this.stopStreaming = this.stopStreaming.bind(this);
    this.toggleFooter = this.toggleFooter.bind(this);
  }

  componentDidMount() {
    this.fetchDevices();
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    this.setState({
      supportedConstraints: supportedConstraints
    })
  }

  fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.setState({
        devices: devices,
      });
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  setProjectInfo(projectInfo){
    this.setState({projectInfo: projectInfo});
  }

  setSelectedTracks(selectedTracks){
    this.setState({selectedTracks: selectedTracks});
  }

  startRecording(){
    this.setState({ recording: true });
  }

  stopRecording(){
    this.setState({ recording: false });
  }

  startStreaming(){
    this.setState({ streaming: true });
  }

  stopStreaming(){
    this.setState({ streaming: false });
  }

  toggleFooter(){
    //TODO
    if(this.state.footerWindowOpen){

    }else{

    }
    this.setState({
      footerWindowOpen: !this.state.footerWindowOpen,
    })
  }

  render() {
    return (
        <Container className="vh-100 mw-100 d-flex flex-column">
          <Row>
            <Col xl={12} className="App-header">
              <MainNavBar
                  recording={this.state.recording}
                  streaming={this.state.streaming}/></Col>
          </Row>
          <Row className="AppContainerRow">
            <Col className="App-menu" xl={3} lg={3} md={3} sm={4}>
              <ProjectInfo
                  projectInfo={this.state.projectInfo}
                  setProjectInfo={this.setProjectInfo}/>
            </Col>
            <Col className="App-body" xl={7} lg={6} md={6} sm={5}>
              <AVTrack
                  devices={this.state.devices}
                  projectInfo={this.state.projectInfo}
                  recording={this.state.recording}
                  streaming={this.state.streaming}
                  selectedTracks={this.state.selectedTracks}
                  setSelectedTracks={this.setSelectedTracks}
                  startRecording={this.startRecording}
                  stopRecording={this.stopRecording}
                  startStreaming={this.startStreaming}
                  stopStreaming={this.stopStreaming} /></Col>
            <Col className="App-rightPane" xl={2} lg={3} md={3} sm={3}>
              <MediaTrackSettings
                  tracks={this.state.selectedTracks}/>
            </Col>
          </Row>
          <Row>
            <Col xl={12} className="App-footer-open">
              <Tabs
                  defaultActiveKey="devicesTab"
                  transition={false}
                  id="noanim-tab-example"
                  className="mb-3"
              >
                <Tab eventKey="devicesTab" title="Devices">
                  <ListAllDevices devices={this.state.devices}/>
                </Tab>
                <Tab eventKey="debugTab" title="Supported Constraints">
                  <ListAllSupportedConstraints
                      supportedConstraints={this.state.supportedConstraints} />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
    );
  }
}

export default App;
