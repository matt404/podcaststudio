class Project {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.lastModified = new Date();
        this.trackIds = [];
    }
}

export default Project;