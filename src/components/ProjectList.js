import './ListAllDevices.css'
import React, { Component } from 'react';
import {Button, Table} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaRegTrashAlt} from "react-icons/fa";

class ProjectList extends Component {
    static propTypes = {
        deleteProject: PropTypes.func,
        openProject: PropTypes.func,
        projects: PropTypes.array,
    }
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    render() {
        return (
            <div>
                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>Project Name</th>
                        <th>&nbsp;</th>
                    </tr>
                    </thead>
                    {this.props.projects && this.props.projects.map((project, index) => (
                        <tbody key={project.id}>
                        <tr>
                            <td onClick={()=>{this.props.openProject(project)}} className="title">{project.name}</td>
                            <td align={"right"}><Button variant="dark" onClick={()=>{this.props.deleteProject(project.id)}}><FaRegTrashAlt/></Button></td>
                        </tr>
                        </tbody>
                    ))}
                </Table>
            </div>
        );
    }
}

export default ProjectList;
