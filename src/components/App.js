import './App.css';
import Project from '../model/Project.js';
import React, {Component} from "react";
import {Container, Row, Col, Tab, Tabs} from "react-bootstrap";
import ListAllDevices from "./ListAllDevices";
import AVTrack from "./AVTrack";
import ProjectInfo from "./ProjectInfo";
import MainNavBar from "./MainNavBar";
import ListAllSupportedConstraints from "./ListAllSupportedConstraints";
import MediaTrackSettings from "./MediaTrackSettings";
import ProjectList from "./ProjectList";
import ProjectTracksView from "./ProjectTracksView";
import Database from '../util/Database.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      footerWindowOpen: false,
      projects: [],
      projectTracks: [],
      recording: false,
      selectedDeviceTracks: [],
      selectedProject: null,
      streaming: false,
      supportedConstraints: {},
    };
    this.database = new Database();
    this.createNewProject = this.createNewProject.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.deleteProjectTrack = this.deleteProjectTrack.bind(this);
    this.exportProjectToVideoFile = this.exportProjectToVideoFile.bind(this);
    this.fetchDevices = this.fetchDevices.bind(this);
    this.getSelectedTracks = this.getSelectedTracks.bind(this);
    this.initializeProjectState = this.initializeProjectState.bind(this);
    this.loadProjectTracks = this.loadProjectTracks.bind(this);
    this.moveProjectTrackDown = this.moveProjectTrackDown.bind(this);
    this.moveProjectTrackUp = this.moveProjectTrackUp.bind(this);
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

  async componentDidMount() {
    this.fetchDevices();
    await this.database.openDatabase();
    this.initializeProjectState();
    const supportedConstraints= navigator.mediaDevices.getSupportedConstraints();
    this.setState({
      supportedConstraints: supportedConstraints
    });
  }

  createNewProject(){
    const newId = Database.generateUUID();
    const newProject = new Project(newId, 'Project ' + (this.state.projects.length + 1), 'Project Description');
    this.database.addProject(newProject);
    this.setState({
      projects: [...this.state.projects, newProject],
      selectedProject: newProject,
    });
  }

  deleteProject(projectId){
    this.database.deleteProject(projectId);
    this.database.getAllProjects((projects) => {
      this.setState({
        projects: projects,
        selectedProject: projects[0],
      });
    });
  }

  deleteProjectTrack(trackId){
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.trackIds = selectedProject.trackIds.filter(track => track !== trackId);
    this.database.updateProject(selectedProject);
    this.database.deleteTrack(trackId);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    },this.loadProjectTracks);
  }

  async exportProjectToVideoFile(){
    const selectedTracks = this.getSelectedTracks();
    if(selectedTracks.length > 0){
      const blob = new Blob(selectedTracks.map(track => track.blob), { type: selectedTracks[0].mediaType });
      const dataUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = this.state.selectedProject.name + ".webm";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(dataUrl);
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

  getSelectedTracks(){
    const selectedTracks = [];
    const selectedTrackIds = Array.from(document.getElementsByName('projectTracks'))
        .filter(element => element.checked).map(element => element.value);
    selectedTrackIds.forEach(trackId => {
      selectedTracks.push(this.state.projectTracks.find(track => track.id === trackId));
    });
    return selectedTracks;
  }

  initializeProjectState(){
    this.database.getAllProjects((projects) => {
      if(projects.length > 0){
        this.setState({
          projects: projects,
          selectedProject: projects[0],
        },()=>{
          this.loadProjectTracks();
        });
      }else{
        this.createNewProject();
      }
    });
  }

  loadProjectTracks(){
    if(this.state.selectedProject){
      if(this.state.selectedProject.trackIds.length === 0){
        this.setState({
          projectTracks: [],
        });
      }else{
        this.database.getTracks(this.state.selectedProject.trackIds, (projectTracks) => {
          this.setState({
            projectTracks: projectTracks,
          });
        });
      }
    }
  }

  moveProjectTrackDown(trackIndex){
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    const trackId = selectedProject.trackIds[trackIndex];
    selectedProject.trackIds.splice(trackIndex, 1);
    selectedProject.trackIds.splice(trackIndex+1, 0, trackId);
    this.database.updateProject(selectedProject);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    },this.loadProjectTracks);
  }

  moveProjectTrackUp(trackIndex){
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    const trackId = selectedProject.trackIds[trackIndex];
    selectedProject.trackIds.splice(trackIndex, 1);
    selectedProject.trackIds.splice(trackIndex-1, 0, trackId);
    this.database.updateProject(selectedProject);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    },this.loadProjectTracks);
  }

  openProject(project){
    this.setState({
      selectedProject: project,
    },this.loadProjectTracks);
  }

  saveTrackToProject(track){
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.trackIds.push(track.id);
    this.database.updateProject(selectedProject);
    this.database.addTrack(track);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    },this.loadProjectTracks);
  }

  setProjectInfo(projectInfo){
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.name = projectInfo.projectName;
    selectedProject.description = projectInfo.projectDesc;
    this.database.updateProject(selectedProject);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    });
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
    });
  }

  render() {
    return (
        <Container className="vh-100 mw-100 d-flex flex-column">
          <Row>
            <Col xl={12} className="App-header">
              <MainNavBar
                  createNewProject={this.createNewProject}
                  recording={this.state.recording}
                  streaming={this.state.streaming}
                  exportProjectToVideoFile={this.exportProjectToVideoFile}/></Col>
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
                  deleteProjectTrack={this.deleteProjectTrack}
                  moveProjectTrackDown={this.moveProjectTrackDown}
                  moveProjectTrackUp={this.moveProjectTrackUp}
                  project={this.state.selectedProject}
                  projectTracks={this.state.projectTracks}/>
            </Col>
            <Col className="App-rightPane" xl={2} lg={3} md={3} sm={3}>
              <ProjectList
                  deleteProject={this.deleteProject}
                  openProject={this.openProject}
                  projects={this.state.projects} />
            </Col>
          </Row>
          <Row>
            <Col xl={12} className="App-footer-open">
              <Tabs
                  defaultActiveKey="activeSettingsTab"
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