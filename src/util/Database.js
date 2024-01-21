class Database {
    constructor() {
        this.db = null;

        this.addProject = this.addProject.bind(this);
        this.addTrack = this.addTrack.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
        this.deleteTrack = this.deleteTrack.bind(this);
        this.getAllProjects = this.getAllProjects.bind(this);
        this.getProject = this.getProject.bind(this);
        this.getTrack = this.getTrack.bind(this);
        this.getTracks = this.getTracks.bind(this);
        this.openDatabase = this.openDatabase.bind(this);
        this.updateProject = this.updateProject.bind(this);
        this.updateTrack = this.updateTrack.bind(this);
    }

    addProject(project) {
        const transaction = this.db.transaction(["projects"], "readwrite");
        const objectStore = transaction.objectStore("projects");
        const request = objectStore.add(project);

        request.onsuccess = function(event) {
            console.log("Project added successfully.");
        };

        request.onerror = function(event) {
            console.log("Error adding project: " + event.target.errorCode);
        };
    }

    addTrack(track) {
        const transaction = this.db.transaction(["tracks"], "readwrite");
        const objectStore = transaction.objectStore("tracks");
        const request = objectStore.add(track);

        request.onsuccess = function(event) {
            console.log("Track saved successfully.");
        };

        request.onerror = function(event) {
            console.log("Error saving track: " + event.target.errorCode);
        };
    }

    deleteProject(id) {
        const transaction = this.db.transaction(["projects"], "readwrite");
        const objectStore = transaction.objectStore("projects");
        const request = objectStore.delete(id);

        request.onsuccess = function(event) {
            console.log("Project deleted successfully.");
        };

        request.onerror = function(event) {
            console.log("Error deleting project: " + event.target.errorCode);
        };
    }

    deleteTrack(id) {
        const transaction = this.db.transaction(["tracks"], "readwrite");
        const objectStore = transaction.objectStore("tracks");
        const request = objectStore.delete(id);

        request.onsuccess = function(event) {
            console.log("Track deleted successfully.");
        };

        request.onerror = function(event) {
            console.log("Error deleting track: " + event.target.errorCode);
        };
    }

    getAllProjects(callback) {
        const transaction = this.db.transaction(["projects"]);
        const objectStore = transaction.objectStore("projects");
        const request = objectStore.openCursor();
        const projects = [];

        request.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                projects.push(cursor.value);
                cursor.continue();
            } else {
                callback(projects);
            }
        };

        request.onerror = function(event) {
            console.log("Error retrieving all projects: " + event.target.errorCode);
        };
    }

    getTracks(trackIds, callback) {
        const transaction = this.db.transaction(["tracks"]);
        const objectStore = transaction.objectStore("tracks");
        const tracks = [];

        trackIds.forEach((trackId) => {
            const request = objectStore.get(trackId);

            request.onsuccess = function(event) {
                tracks.push(request.result);
                if (tracks.length === trackIds.length) {
                    callback(tracks);
                }
            };

            request.onerror = function(event) {
                console.log("Error retrieving track: " + event.target.errorCode);
            };
        });
    }


    static generateUUID() {
        let d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            // eslint-disable-next-line
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            // eslint-disable-next-line
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    getProject(id, callback) {
        const transaction = this.db.transaction(["projects"]);
        const objectStore = transaction.objectStore("projects");
        const request = objectStore.get(id);

        request.onsuccess = function(event) {
            callback(request.result);
        };

        request.onerror = function(event) {
            console.log("Error retrieving project: " + event.target.errorCode);
        };
    }

    getTrack(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["tracks"]);
            const objectStore = transaction.objectStore("tracks");
            const request = objectStore.get(id);

            request.onsuccess = function(event) {
                resolve(request.result);
            };

            request.onerror = function(event) {
                console.log("Error retrieving track: " + event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("PodCastStudio", 2);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains('tracks')) {
                    this.db.createObjectStore("tracks", { keyPath: "id" });
                }
                if (!this.db.objectStoreNames.contains('projects')) {
                    this.db.createObjectStore("projects", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                console.log("Error opening database: " + event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }

    updateProject(project) {
        const transaction = this.db.transaction(["projects"], "readwrite");
        const objectStore = transaction.objectStore("projects");
        const request = objectStore.put(project);

        request.onsuccess = function(event) {
            console.log("Project updated successfully.");
        };

        request.onerror = function(event) {
            console.log("Error updating project: " + event.target.errorCode);
        };
    }

    updateTrack(track) {
        const transaction = this.db.transaction(["tracks"], "readwrite");
        const objectStore = transaction.objectStore("tracks");
        const request = objectStore.put(track);

        request.onsuccess = function(event) {
            console.log("Track updated successfully.");
        };

        request.onerror = function(event) {
            console.log("Error updating track: " + event.target.errorCode);
        };
    }
}

export default Database;