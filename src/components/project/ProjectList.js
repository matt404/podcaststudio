import './ProjectList.css';
import React, {Component} from 'react';
import {Badge, Button, Table, Pagination} from "react-bootstrap";
import PropTypes from "prop-types";
import {FaRegTrashAlt} from "react-icons/fa";

class ProjectList extends Component {
  static propTypes = {
    colorTheme: PropTypes.string,
    deleteProject: PropTypes.func,
    openProject: PropTypes.func,
    projects: PropTypes.array,
    selectedProjectId: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      currentPage: 1, // default page
    };
  }

  handlePageChange = (pageNumber) => {
    this.setState({currentPage: pageNumber});
  }

  render() {
    const recordsPerPage = 6;
    const {projects} = this.props;
    const {currentPage} = this.state;

    // calculate number of pages
    const numPages = Math.ceil(projects.length / recordsPerPage);

    // get projects for current page
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const currentProjects = projects.slice(startIndex, endIndex);

    return (
        <div>
          <Table variant={this.props.colorTheme} striped bordered hover>
            <thead>
            <tr>
              <th>Projects</th>
              <th>&nbsp;</th>
            </tr>
            </thead>
            {currentProjects && currentProjects.map((project, index) => {
              let projectClass = "ProjectListDisplay";
              if (this.props.selectedProject && project.id === this.props.selectedProject.id) {
                projectClass += " ProjectListDisplaySelected";
              }
              return (
                  <tbody key={project.id}>
                  <tr>
                    <td onClick={() => {
                      this.props.openProject(project)
                    }} className={projectClass}>{project.name}
                      <Badge title={"Project Track Count"} className="ProjectListBadge" bg="secondary"
                             pill>{project.trackIds.length}</Badge></td>
                    <td className="project-buttons" align={"right"}><Button variant={"dark"} onClick={() => {
                      this.props.deleteProject(project.id)
                    }}><FaRegTrashAlt/></Button></td>
                  </tr>
                  </tbody>
              );
            })}
          </Table>
          <Pagination>
            {[...Array(numPages).keys()].map((page) => (
                <Pagination.Item key={page+1} active={page+1 === currentPage} onClick={() => this.handlePageChange(page+1)}>
                  {page+1}
                </Pagination.Item>
            ))}
          </Pagination>
        </div>
    );
  }
}

export default ProjectList;