import fs from 'fs';

class AssetManager {
    constructor() {
        this.queue = [];
        this.names = [];
        this.assets = new Map();
    }

    push(name, path) {
        this.names.push(name);

        if (getFileExtension(path) == 'json') {
            this.queue.push(fetchJSON(path));
        } else {
            this.queue.push(fetch(path));
        }
        return this;
    }

    then(cb) {
        Promise.all(this.queue)
            .catch((e) => console.error(e))
            .then((data) => {
                for (let i = 0; i < data.length; ++i) {
                    this.assets.set(this.names[i], data[i]);
                }

                cb(this);
            });
    }

    get(name) {
        return this.assets.get(name);
    }
}

export var TheAssetManager = new AssetManager();

function fetch(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}

function fetchJSON(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(JSON.parse(data));
        });
    });
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}



