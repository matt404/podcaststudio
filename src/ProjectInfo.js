import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Form} from "react-bootstrap";

class ProjectInfo extends Component {
  static propTypes = {
    projectInfo: PropTypes.object,
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

  setProjectInfo(event){
    if(this.inputTimeoutId){
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
              <Form.Control id="ProjectName" type="text" onChange={this.setProjectInfo} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control id="ProjectDesc" as="textarea" rows={3} onChange={this.setProjectInfo} />
            </Form.Group>
          </Form>
        </div>
    );
  }
}

export default ProjectInfo;
