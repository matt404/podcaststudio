import './ListAllDevices.css'
import React, { Component } from 'react';
import {Table} from "react-bootstrap";
import PropTypes from "prop-types";

class ProjectList extends Component {
    static propTypes = {
        projects: PropTypes.array,
        openProject: PropTypes.func,
    }
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className="devicesContainer">
                <Table className="Devices">
                    {this.props.projects.map(project => (
                        <tbody key={project.id}>
                        <tr>
                            <td onClick={()=>{this.props.openProject(project)}} className="title">{project.name}</td>
                        </tr>
                        </tbody>
                    ))}
                </Table>
            </div>
        );
    }
}

export default ProjectList;
