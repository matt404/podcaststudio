import './ProjectSelectionModal.css';
import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap';
import navlogo from "../../navlogo.png";
import PropTypes from "prop-types";
import ProjectList from "./ProjectList";


class ProjectSelectionModal extends Component {
  static propTypes = {
    showProjectSelectionModal: PropTypes.bool,
    deleteProject: PropTypes.func,
    openProject: PropTypes.func,
    projects: PropTypes.array,
    selectedProjectId: PropTypes.string,
    toggleProjectSelectionModal: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {};

    this.openProject = this.openProject.bind(this);
  }

  openProject = (project) => {
    this.props.openProject(project);
    this.props.toggleProjectSelectionModal();
  }

  render() {
    return (
        <Modal
            dialogClassName={"project-selection-modal-dialog"}
            show={this.props.showProjectSelectionModal}
            backdrop="static"
            keyboard={false}>
          <Modal.Header>
            <Modal.Title><img alt="logo" src={navlogo}/> Select a Project to Open</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProjectList
                projects={this.props.projects}
                selectedProjectId={this.props.selectedProjectId}
                deleteProject={this.props.deleteProject}
                openProject={this.openProject}/>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.toggleProjectSelectionModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
    );
  }
}

export default ProjectSelectionModal;