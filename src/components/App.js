import './App.css';
import Project from '../model/Project.js';
import React, {Component} from "react";
import {Col, Container, Row} from "react-bootstrap";
import AVTrack from "./track/AVTrack";
import MainNavBar from "./MainNavBar";
import ProjectTracksView from "./track/ProjectTracksView";
import Database from '../util/Database.js';
import Footer from "./Footer";
import WelcomeMessage from "./documentation/WelcomeMessage";
import ProjectSelectionModal from "./project/ProjectSelectionModal";
import ProjectSettingsView from "./project/ProjectSettingsView";
import VideoCodecs from "../constants/VideoCodecs";
import AudioCodecs from "../constants/AudioCodecs";
import LocalStorageKeys from "../constants/LocalStorageKeys";

class App extends Component {

  constructor(props) {
    super(props);

    const colorTheme = localStorage.getItem(LocalStorageKeys.COLOR_THEME);

    this.state = {
      devices: [],
      displayMedia: [],
      bodyClassName: 'App-body-footer-open',
      footerClassName: 'App-footer-open',
      projects: [],
      projectTracks: [],
      recording: false,
      selectedProject: null,
      showWelcomeMessage: localStorage.getItem(LocalStorageKeys.SHOW_WELCOME_MESSAGE) !== 'false',
      showProjectSelectionModal: false,
      streamingAV: false,
      streamingDisplayMedia: false,
      streamingPip: false,
      streamingStage: false,
      supportedAudioCodecs: [],
      supportedVideoCodecs: [],
      supportedConstraints: {},
      colorTheme: colorTheme ? colorTheme : 'dark',
    };

    this.database = new Database();
    this.selectedDeviceTracks = [];
    this.checkCodecSupport = this.checkCodecSupport.bind(this);
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
    this.setProjectSettings = this.setProjectSettings.bind(this);
    this.setSelectedDeviceTracks = this.setSelectedDeviceTracks.bind(this);
    this.setColorTheme = this.setColorTheme.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.startAVStream = this.startAVStream.bind(this);
    this.stopAVStream = this.stopAVStream.bind(this);
    this.startDisplayMediaStream = this.startDisplayMediaStream.bind(this);
    this.stopDisplayMediaStream = this.stopDisplayMediaStream.bind(this);
    this.startMergeStream = this.startMergeStream.bind(this);
    this.stopMergeStream = this.stopMergeStream.bind(this);
    this.startPipStream = this.startPipStream.bind(this);
    this.stopPipStream = this.stopPipStream.bind(this);
    this.toggleFooter = this.toggleFooter.bind(this);
    this.toggleProjectSelectionModal = this.toggleProjectSelectionModal.bind(this);
    this.toggleShowWelcomeMessage = this.toggleShowWelcomeMessage.bind(this);
    this.updateProjectTrackName = this.updateProjectTrackName.bind(this);
  }

  async componentDidMount() {
    this.fetchDevices();
    await this.database.openDatabase();
    this.initializeProjectState();
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    this.setState({
      supportedConstraints: supportedConstraints
    });
    this.checkCodecSupport();
    document.documentElement.setAttribute('data-bs-theme', this.state.colorTheme);
  }

  checkCodecSupport = () => {
    let supportedAudioCodecs = [];
    let supportedVideoCodecs = [];

    Object.keys(VideoCodecs).forEach(key => {
      if (MediaRecorder.isTypeSupported(VideoCodecs[key].type)) {
        supportedVideoCodecs.push(key);
      }
    });
    Object.keys(AudioCodecs).forEach(key => {
      if (MediaRecorder.isTypeSupported(AudioCodecs[key].type)) {
        supportedAudioCodecs.push(key);
      }
    });

    this.setState({
      supportedAudioCodecs: supportedAudioCodecs,
      supportedVideoCodecs: supportedVideoCodecs
    });
  };

  createNewProject() {
    const newId = Database.generateUUID();
    const newProject = new Project(newId, 'Project ' + (this.state.projects.length + 1), 'Project Description');
    this.database.addProject(newProject, () => {
      this.initializeProjectState();
    });
  }

  deleteProject(projectId) {
    if (this.state.recording) {
      return;
    }
    this.database.deleteProject(projectId);
    this.database.getAllProjects((projects) => {
      this.setState({
        projects: projects,
        selectedProject: projects[0],
      }, this.loadProjectTracks);
    });
  }

  deleteProjectTrack(trackId) {
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.trackIds = selectedProject.trackIds.filter(track => track !== trackId);
    this.database.updateProject(selectedProject);
    this.database.deleteTrack(trackId);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    }, this.loadProjectTracks);
  }

  async exportProjectToVideoFile() {
    const selectedTracks = this.getSelectedTracks();
    if (selectedTracks.length > 0) {
      const blob = new Blob(selectedTracks.map(track => track.blob), {type: selectedTracks[0].mediaType});
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

  getSelectedTracks() {
    const selectedTracks = [];
    const selectedTrackIds = Array.from(document.getElementsByName('projectTracks'))
        .filter(element => element.checked).map(element => element.value);
    selectedTrackIds.forEach(trackId => {
      selectedTracks.push(this.state.projectTracks.find(track => track.id === trackId));
    });
    return selectedTracks;
  }

  initializeProjectState() {
    this.database.getAllProjects((projects) => {
      if (projects.length > 0) {
        this.setState({
          projects: projects,
          selectedProject: projects[0],
        }, () => {
          this.loadProjectTracks();
        });
      } else {
        this.createNewProject();
      }
    });
  }

  loadProjectTracks() {
    if (this.state.selectedProject) {
      if (this.state.selectedProject.trackIds.length === 0) {
        this.setState({
          projectTracks: [],
        });
      } else {
        this.database.getTracks(this.state.selectedProject.trackIds, (projectTracks) => {
          this.setState({
            projectTracks: projectTracks,
          });
        });
      }
    }
  }

  moveProjectTrackDown(trackIndex) {
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    const trackId = selectedProject.trackIds[trackIndex];
    selectedProject.trackIds.splice(trackIndex, 1);
    selectedProject.trackIds.splice(trackIndex + 1, 0, trackId);
    this.database.updateProject(selectedProject);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    }, this.loadProjectTracks);
  }

  moveProjectTrackUp(trackIndex) {
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    const trackId = selectedProject.trackIds[trackIndex];
    selectedProject.trackIds.splice(trackIndex, 1);
    selectedProject.trackIds.splice(trackIndex - 1, 0, trackId);
    this.database.updateProject(selectedProject);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    }, this.loadProjectTracks);
  }

  openProject(project) {
    if (this.state.recording) {
      return;
    }
    this.setState({
      selectedProject: project,
    }, this.loadProjectTracks);
  }

  saveTrackToProject(track) {
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.trackIds.push(track.id);
    this.database.updateProject(selectedProject);
    this.database.addTrack(track);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    }, this.loadProjectTracks);
  }

  setProjectInfo(projectInfo) {
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

  setProjectSettings(projectSettings) {
    let projects = Array.from(this.state.projects);
    let selectedProject = projects.find(project => project.id === this.state.selectedProject.id);
    selectedProject.settings = projectSettings;
    this.database.updateProject(selectedProject);
    this.setState({
      projects: projects,
      selectedProject: selectedProject,
    });
  }

  setSelectedDeviceTracks(selectedDeviceTracks) {
    this.selectedDeviceTracks = selectedDeviceTracks;
  }

  setColorTheme = (colorTheme) => {
    document.documentElement.setAttribute('data-bs-theme', colorTheme);
    localStorage.setItem(LocalStorageKeys.COLOR_THEME, colorTheme);
    this.setState({colorTheme: colorTheme});
  }

  startDisplayMediaStream() {
    this.setState({streamingDisplayMedia: true});
  }

  stopDisplayMediaStream() {
    this.setState({
      streamingDisplayMedia: false
    });
  }

  startRecording() {
    this.setState({recording: true});
  }

  stopRecording() {
    this.setState({recording: false});
  }

  startAVStream() {
    this.setState({streamingAV: true});
  }

  stopAVStream() {
    this.selectedDeviceTracks = [];
    this.setState({
      streamingAV: false
    });
  }

  startMergeStream() {
    this.setState({streamingStage: true});
  }

  stopMergeStream() {
    this.setState({streamingStage: false});
  }

  startPipStream() {
    this.setState({streamingPip: true});
  }

  stopPipStream() {
    this.setState({streamingPip: false});
  }

  toggleFooter() {
    let bodyClassName = 'App-body-footer-open';
    let footerClassName = 'App-footer-open';
    if (this.state.footerClassName === 'App-footer-open') {
      bodyClassName = 'App-body-footer-closed';
      footerClassName = 'App-footer-closed';
    }
    this.setState({
      bodyClassName: bodyClassName,
      footerClassName: footerClassName
    });
  }

  toggleProjectSelectionModal() {
    const showProjectSelectionModal = !this.state.showProjectSelectionModal;
    this.setState({showProjectSelectionModal: showProjectSelectionModal});
  }

  toggleShowWelcomeMessage() {
    const showWelcomeMessage = !this.state.showWelcomeMessage;
    this.setState({showWelcomeMessage: showWelcomeMessage}, () => {
      localStorage.setItem(LocalStorageKeys.SHOW_WELCOME_MESSAGE, showWelcomeMessage.toString());
    });
  }

  updateProjectTrackName(trackId, trackName) {
    console.log("updateProjectTrackName: " + trackName);
    let projectTracks = Array.from(this.state.projectTracks);
    let selectedProjectTrack = projectTracks.find(track => track.id === trackId);
    selectedProjectTrack.name = trackName;
    this.database.updateTrack(selectedProjectTrack);
    this.setState({
      projectTracks: projectTracks,
    }, this.loadProjectTracks);
  }

  render() {
    return (
        <div data-bs-theme={this.state.colorTheme}>
          <WelcomeMessage
              showWelcomeMessage={this.state.showWelcomeMessage}
              toggleShowWelcomeMessage={this.toggleShowWelcomeMessage}/>
          <ProjectSelectionModal
              colorTheme={this.state.colorTheme}
              projects={this.state.projects}
              selectedProject={this.state.selectedProject}
              showProjectSelectionModal={this.state.showProjectSelectionModal}
              deleteProject={this.deleteProject}
              openProject={this.openProject}
              toggleProjectSelectionModal={this.toggleProjectSelectionModal}/>
          <Container className="vh-100 mw-100 d-flex flex-column">
            <Row>
              <Col xl={12} className="App-header">
                <MainNavBar
                    setTheme={this.setColorTheme}
                    createNewProject={this.createNewProject}
                    exportProjectToVideoFile={this.exportProjectToVideoFile}
                    recording={this.state.recording}
                    streamingAV={this.state.streamingAV}
                    streamingDisplayMedia={this.state.streamingDisplayMedia}
                    toggleProjectSelectionModal={this.toggleProjectSelectionModal}
                    toggleShowWelcomeMessage={this.toggleShowWelcomeMessage}
                /></Col>
            </Row>
            <Row className={this.state.bodyClassName}>
              <Col className="App-body" xl={9} lg={8} md={8} sm={9}>
                <AVTrack
                    devices={this.state.devices}
                    project={this.state.selectedProject}
                    recording={this.state.recording}
                    streamingAV={this.state.streamingAV}
                    streamingDisplayMedia={this.state.streamingDisplayMedia}
                    streamingPip={this.state.streamingPip}
                    streamingStage={this.state.streamingStage}
                    selectedDeviceTracks={this.selectedDeviceTracks}
                    saveTrackToProject={this.saveTrackToProject}
                    setSelectedDeviceTracks={this.setSelectedDeviceTracks}
                    startAVStream={this.startAVStream}
                    stopAVStream={this.stopAVStream}
                    startDisplayMediaStream={this.startDisplayMediaStream}
                    stopDisplayMediaStream={this.stopDisplayMediaStream}
                    startMergedStream={this.startMergeStream}
                    stopMergedStream={this.stopMergeStream}
                    startPipStream={this.startPipStream}
                    stopPipStream={this.stopPipStream}
                    startRecording={this.startRecording}
                    stopRecording={this.stopRecording}/>
                <ProjectTracksView
                    colorTheme={this.state.colorTheme}
                    deleteProjectTrack={this.deleteProjectTrack}
                    moveProjectTrackDown={this.moveProjectTrackDown}
                    moveProjectTrackUp={this.moveProjectTrackUp}
                    project={this.state.selectedProject}
                    projectTracks={this.state.projectTracks} updateProjectTrackName={this.updateProjectTrackName}/>
              </Col>
              <Col className="App-rightPane" xl={3} lg={4} md={4} sm={3}>
                <ProjectSettingsView
                    project={this.state.selectedProject}
                    setProjectInfo={this.setProjectInfo}
                    setProjectSettings={this.setProjectSettings}
                    supportedAudioCodecs={this.state.supportedAudioCodecs}
                    supportedVideoCodecs={this.state.supportedVideoCodecs}/>
              </Col>
            </Row>
            <Row>
              <Col className={this.state.footerClassName} xl={12}>
                <Footer
                    devices={this.state.devices}
                    footerOpen={this.state.footerClassName === 'App-footer-open'}
                    selectedDeviceTracks={this.selectedDeviceTracks}
                    supportedAudioCodecs={this.state.supportedAudioCodecs}
                    supportedVideoCodecs={this.state.supportedVideoCodecs}
                    supportedConstraints={this.state.supportedConstraints}
                    toggleFooter={this.toggleFooter}
                />
              </Col>
            </Row>
          </Container>
        </div>
    );
  }
}

export default App;