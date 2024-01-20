import './App.css';
import Project from './model/Project.js';
import React, {Component} from "react";
import {Container, Row, Col, Tab, Tabs} from "react-bootstrap";
import ListAllDevices from "./components/ListAllDevices";
import AVTrack from "./components/AVTrack";
import ProjectInfo from "./components/ProjectInfo";
import MainNavBar from "./components/MainNavBar";
import ListAllSupportedConstraints from "./components/ListAllSupportedConstraints";
import MediaTrackSettings from "./components/MediaTrackSettings";
import ProjectList from "./components/ProjectList";
import ProjectTracksView from "./components/ProjectTracksView";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      footerWindowOpen: false,
      projects: [],
      recording: false,
      selectedDeviceTracks: [],
      selectedProject: null,
      streaming: false,
      supportedConstraints: {},
    };
    this.createNewProject = this.createNewProject.bind(this);
    this.fetchDevices = this.fetchDevices.bind(this);
    this.initializeStorage = this.initializeStorage.bind(this);
    this.initializeProjectState = this.initializeProjectState.bind(this);
    this.openProject = this.openProject.bind(this);
    this.saveTrackToProject = this.saveTrackToProject.bind(this);
    this.setProjectInfo = this.setProjectInfo.bind(this);
    this.setSelectedDeviceTracks = this.setSelectedDeviceTracks.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.startStreaming = this.startStreaming.bind(this);
    this.stopStreaming = this.stopStreaming.bind(this);
    this.toggleFooter = this.toggleFooter.bind(this);
  }

  componentDidMount() {
    this.fetchDevices();
    this.initializeStorage();
    this.initializeProjectState();
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    this.setState({
      supportedConstraints: supportedConstraints
    })
  }

  createNewProject(){
    const newProject = new Project(this.state.projects.length, 'Project ' + (this.state.projects.length + 1), 'Project Description');
    const projects = JSON.parse(window.localStorage.getItem('projects'));
    projects.push(newProject);
    window.localStorage.setItem('projects', JSON.stringify(projects));
    this.setState({
      projects: projects,
      selectedProject: newProject,
    })
  }

  initializeProjectState(){
    const projects = JSON.parse(window.localStorage.getItem('projects'));
    if(projects.length > 0){
      this.setState({
        projects: projects,
        selectedProject: projects[0],
      })
    }else{
      this.createNewProject();
    }
  }

  initializeStorage(){
    if(window.localStorage.getItem('projects') === null || window.localStorage.getItem('projects') === undefined) {
      window.localStorage.setItem('projects', JSON.stringify([]));
    }
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

  openProject(project){
    this.setState({
      selectedProject: project,
    })
  }

  saveTrackToProject(track){
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.trackIds.push(track.id);

    const trackKey = "project_"+selectedProject.id+"_track_"+track.id;
    window.localStorage.setItem(trackKey, JSON.stringify(track));
    window.localStorage.setItem('projects', JSON.stringify(projects));

    this.setState({
        projects: projects,
        selectedProject: selectedProject,
    }, () => {
      console.log(this.state)
    });
  }

  setProjectInfo(projectInfo){
    this.setState({projectInfo: projectInfo});
  }

  setSelectedDeviceTracks(selectedDeviceTracks){
    this.setState({selectedDeviceTracks: selectedDeviceTracks});
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
                  createNewProject={this.createNewProject}
                  recording={this.state.recording}
                  streaming={this.state.streaming}/></Col>
          </Row>
          <Row className="AppContainerRow">
            <Col className="App-menu" xl={3} lg={3} md={3} sm={4}>
              <ProjectInfo
                  project={this.state.selectedProject}
                  setProjectInfo={this.setProjectInfo}/>
            </Col>
            <Col className="App-body" xl={7} lg={6} md={6} sm={5}>
              <AVTrack
                  devices={this.state.devices}
                  project={this.state.selectedProject}
                  recording={this.state.recording}
                  streaming={this.state.streaming}
                  selectedDeviceTracks={this.state.selectedDeviceTracks}
                  saveTrackToProject={this.saveTrackToProject}
                  setSelectedDeviceTracks={this.setSelectedDeviceTracks}
                  startRecording={this.startRecording}
                  stopRecording={this.stopRecording}
                  startStreaming={this.startStreaming}
                  stopStreaming={this.stopStreaming} />
              <ProjectTracksView
                  project={this.state.selectedProject}/>
            </Col>
            <Col className="App-rightPane" xl={2} lg={3} md={3} sm={3}>
              <ProjectList
                  openProject={this.openProject}
                  projects={this.state.projects} />
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
                <Tab eventKey="activeSettingsTab" title="Live Settings">
                  <MediaTrackSettings
                      tracks={this.state.selectedDeviceTracks}/>
                </Tab>
                <Tab eventKey="devicesTab" title="Available Devices">
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
