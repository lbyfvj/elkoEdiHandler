var fs = require('fs');

module.exports = readFiles = (dirname) => {

    const readDirPr = new Promise( (resolve, reject) => {
        fs.readdir(dirname,
            (err, filenames) => (err) ? reject(err) : resolve(filenames))
    });

    return readDirPr.then( filenames => Promise.all(filenames.map((filename) => {
        return new Promise ( (resolve, reject) => {
            fs.readFile(dirname + filename, 'utf-8',
                (err, content) => (err) ? reject(err) : resolve([filename, content]));
        })
    })).catch( error => Promise.reject(error)))
};

module.exports = buyerData = (bayerGln) => {
    var bayerMap = [
        ["4829900023799", "Rozetka", "ElkoEDI", "elkorozedi"],
        ["4829900023800", "Tsyganok", "IvanT", "q1w2e3r4"],
        ["4829900023801", "Foxtrot", "FoxEdi", "qazxsw123"]
    ];

    for (var i = 0; i < bayerMap.length; i++) {
        for(var j = 0; j < bayerMap[i].length; j++) {
            if (bayerGln == bayerMap[i][j]) {

                return bayerMap[i];
            }
        }
    }
};




