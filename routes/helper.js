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

module.exports = shipToData = (shipToGln) => {
    var shipToMap = [
        ["4829900023805", 6011555, "Kyiv, Frunze"],
        ["4829900023829", 6011748, "Kyiv, Yaroslavska str.28"],
        ["4829900024802", 6012878, "Kyiv, Petrovka"],
        ["4829900023806", 6011124, "Kyiv, Kozatska str. 120/4"],
        ["4829900023807", 6011142, "Kyiv, Vasilkivska str.1"]
    ];

    for (var i = 0; i < shipToMap.length; i++) {
        for(var j = 0; j < shipToMap[i].length; j++) {
            if (shipToGln == shipToMap[i][j]) {
                return shipToMap[i];
            }
        }
    }
};

module.exports = jdeDate = (ediDate) => {
    var myDate = new Date(ediDate);
    var start = new Date(myDate.getFullYear(), 0, 0);
    var diff = (myDate - start) + ((start.getTimezoneOffset() - myDate.getTimezoneOffset()) * 60 * 1000);
    var dayInYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    var orderDate = '1'+ myDate.getFullYear().toString().substr(-2) + dayInYear;

    return orderDate;
};

module.exports = moveFile = (file, dir2, newName) => {

    var f = path.basename(file);
    var dest = path.resolve(dir2, newName);

    fs.rename(file, dest, (err) => {
        if(err) throw err;
        else console.log('Successfully moved');
    });
};




