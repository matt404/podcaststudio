import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Button, Container, Form, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {FaPodcast} from "react-icons/fa";

class MainNavBar extends Component {
  static propTypes = {
    recording: PropTypes.bool,
    streaming: PropTypes.bool,
    createNewProject: PropTypes.func,
  }
  constructor(props) {
    super(props);

    this.state = {
      activityStatusTitle: 'Stopped',
      activityStatusCSS: 'secondary',
    };

  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.streaming !== prevProps.streaming || this.props.recording !== prevProps.recording){
      if(this.props.streaming && this.props.recording){
        this.setState({
          activityStatusTitle: 'Recording',
          activityStatusCSS: 'danger',
        });
      }else if(this.props.streaming && !this.props.recording){
        this.setState({
          activityStatusTitle: 'Active',
          activityStatusCSS: 'success',
        });
      }else{
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
            <Navbar.Brand href="#"><FaPodcast /> PodCastStudio</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav
                  className="me-auto my-2 my-lg-0"
                  style={{ maxHeight: '100px' }}
                  navbarScroll
              >
                <NavDropdown title="Project" id="navbarScrollingDropdown">
                  <NavDropdown.Item href="#action3" onClick={this.props.createNewProject}>New</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action3">Export</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action3">Upload</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Form className="d-flex">
                <Button
                    variant={this.state.activityStatusCSS}>
                  {this.state.activityStatusTitle}</Button>
              </Form>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
  }
}

export default MainNavBar;
