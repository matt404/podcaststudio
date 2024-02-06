import navlogo from '../navlogo.png';
import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Button, Container, Form, Nav, Navbar, NavDropdown} from "react-bootstrap";
import TimerClock from "./track/TimerClock";
import {FaCloudUploadAlt, FaFileExport, FaFileVideo, FaRegCommentAlt} from "react-icons/fa";

class MainNavBar extends Component {
  static propTypes = {
    createNewProject: PropTypes.func,
    exportProjectToVideoFile: PropTypes.func,
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    streamingDisplayMedia: PropTypes.bool,
    toggleShowWelcomeMessage: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      activityStatusTitle: 'Stopped',
      activityStatusCSS: 'secondary',
    };

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.streaming !== prevProps.streaming || this.props.recording !== prevProps.recording) {
      if (this.props.recording) {
        this.setState({
          activityStatusTitle: 'Recording',
          activityStatusCSS: 'danger',
        });
      } else if (this.props.streaming || this.props.streamingDisplayMedia) {
        this.setState({
          activityStatusTitle: 'Active',
          activityStatusCSS: 'success',
        });
      } else {
        this.setState({
          activityStatusTitle: 'Stopped',
          activityStatusCSS: 'secondary',
        });
      }
    }
  }

  render() {
    return (
        <Navbar expand="lg" className="bg-body-tertiary"
                data-bs-theme="dark">
          <Container fluid>
            <Navbar.Brand href="#"><img alt="logo" src={navlogo}/> PodCastStudio</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll"/>
            <Navbar.Collapse id="navbarScroll">
              <Nav
                  className="me-auto my-2 my-lg-0"
                  style={{maxHeight: '100px'}}
                  navbarScroll
              >
                <NavDropdown title="Project" id="navbarScrollingDropdown">
                  <NavDropdown.Item onClick={this.props.createNewProject}><FaFileVideo/> New</NavDropdown.Item>
                  <NavDropdown.Divider/>
                  <NavDropdown.Item
                      onClick={this.props.exportProjectToVideoFile}><FaFileExport/> Export</NavDropdown.Item>
                  <NavDropdown.Divider/>
                  <NavDropdown.Item onClick={() => {
                    alert("Not implemented")
                  }}><FaCloudUploadAlt/> Upload</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Help" id="navbarScrollingDropdown">
                  <NavDropdown.Item onClick={this.props.toggleShowWelcomeMessage}><FaRegCommentAlt/> Welcome</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Form className="d-flex">
                <TimerClock recording={this.props.recording}/>
                <Button
                    variant={this.state.activityStatusCSS}>
                  {this.state.activityStatusTitle}</Button>
              </Form>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    )
        ;
  }
}

export default MainNavBar;
