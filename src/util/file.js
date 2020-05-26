const fs = require('fs');
const { resolve } = require('path');
const request = require('request');

const base64ToBuffer = base64 => {
    let response = {};

    let matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches) {
        if (matches.length !== 3) return new Error('Invalid input string');
        response.mimetype = matches[1];
        response.data = Buffer.from(matches[2], 'base64');
    }

    return response;
}

const createDir = term => {
    const dir = term.replace(/\s/g, '_');
    const path = resolve(__dirname, "..", "..", "images", dir);

    if (!fs.existsSync(path)) {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) throw new err;
        });
    }

    return { dir, path };
}

exports.downloadImage = (data, term) => {
    const { dir, path } = createDir(term);

    data.map((value, index) => {
        let imageTypeRegex = /\/(.*?)$/;
        let { mimetype, data } = base64ToBuffer(value);
        let httpRegex = new RegExp("https?://[A-Za-z0-9./]+", "gm");

        if (data && mimetype) {
            let imageType = mimetype.match(imageTypeRegex);
            let downloadPath = `${path}/${dir}${index}.${imageType[1]}`;
            fs.writeFileSync(downloadPath, data);

        } else if (httpRegex.test(value)) {
            request.head(value, (err, res, body) => {
                let imageType = res.headers['content-type'].match(imageTypeRegex);
                let downloadPath = `${path}/${dir}${index}.${imageType[1]}`;

                request(value).pipe(fs.createWriteStream(downloadPath))
                    .on('close', () => { console.log('done') });
            });
        }
    });
}
