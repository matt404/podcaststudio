import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Form} from "react-bootstrap";

class ProjectInfo extends Component {
  static propTypes = {
    project: PropTypes.object,
    setProjectInfo: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      showConfig: false,
    };

    this.inputTimeoutMS = 500;
    this.inputTimeoutId = null;

    this.setProjectInfo = this.setProjectInfo.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.project !== this.props.project) {
      document.getElementById("ProjectName").value = this.props.project ? this.props.project.name : '';
      document.getElementById("ProjectDesc").value = this.props.project ? this.props.project.description : '';
    }
  }

  setProjectInfo(event) {
    if (this.inputTimeoutId) {
      clearTimeout(this.inputTimeoutId);
    }
    this.inputTimeoutId = setTimeout(() => {
      this.props.setProjectInfo({
        projectName: document.getElementById("ProjectName").value,
        projectDesc: document.getElementById("ProjectDesc").value,
      });
    }, this.inputTimeoutMS);
  }

  render() {
    return (
        <div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control id="ProjectName" type="text"
                            defaultValue={this.props.project ? this.props.project.name : ''}
                            onChange={this.setProjectInfo}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control id="ProjectDesc" as="textarea" rows={3}
                            defaultValue={this.props.project ? this.props.project.description : ''}
                            onChange={this.setProjectInfo}/>
            </Form.Group>
          </Form>
        </div>
    );
  }
}

export default ProjectInfo;
