class AssetManager {
    constructor() {
        this.queue = [];
        this.names = [];
        this.assets = new Map();
    }

    push(name, url) {
        const ext = getFileExtension(url);
        this.names.push(name);
        if (ext == 'gif' || ext == 'png' || ext == 'jpg') {
            this.queue.push(fetchImage(url));
        } else if (ext == 'json') {
            this.queue.push(fetchJSON(url));
        } else {
            this.queue.push(fetchBlob(url));
        }

        return this;
    }

    then(cb) {
        Promise.all(this.queue).then((data) => {
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

function fetchBlob(url) {

    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function () {
            resolve(this.response);
        }

        xhr.onerror = function () {
            reject(Error('failed to load ' + url));
        }

        xhr.send();
    });
}

function fetchImage(url) {
    return new Promise((resolve, reject) => {
        var image = new Image();
        image.src = url;

        image.onload = function () {
            resolve(image);
        }

        image.onerror = function () {
            reject(Error('failed to load ' + url));
        }
    });
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);

        xobj.onload = function () {
            resolve(JSON.parse(this.responseText));
        }

        xobj.onerror = function () {
            reject(Error('failed to load ' + url));
        }

        xobj.send(null);
    });
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}