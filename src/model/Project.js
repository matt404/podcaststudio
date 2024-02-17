import ProjectSettings from "./ProjectSettings";

class Project {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.settings = new ProjectSettings();
    this.lastModified = new Date();
    this.trackIds = [];
  }
}

export default Project;