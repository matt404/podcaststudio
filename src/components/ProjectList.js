import './ProjectList.css'
import React, { Component } from 'react';
import {Button, Table} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaRegTrashAlt} from "react-icons/fa";

class ProjectList extends Component {
    static propTypes = {
        deleteProject: PropTypes.func,
        openProject: PropTypes.func,
        projects: PropTypes.array,
        selectedProjectId: PropTypes.string,
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
                    {this.props.projects && this.props.projects.map((project, index) => {
                        let projectClass = "ProjectListDisplay";
                        if(this.props.selectedProject && project.id === this.props.selectedProject.id){
                             projectClass += " ProjectListDisplaySelected";
                        }
                        return (
                            <tbody key={project.id}>
                            <tr>
                                <td onClick={()=>{this.props.openProject(project)}} className={projectClass}>{project.name}</td>
                                <td align={"right"}><Button variant="dark" onClick={()=>{this.props.deleteProject(project.id)}}><FaRegTrashAlt/></Button></td>
                            </tr>
                            </tbody>
                        );
                    })}
                </Table>
            </div>
        );
    }
}

export default ProjectList;
