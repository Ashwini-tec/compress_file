const nodeCron = require("node-cron");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const BatchProcess = require("../src/model/file");
const SuccessProcess = require("../src/model/successCompressFile");
const FailedProcess = require("../src/model/errorFileCompressFile");
require("dotenv").config();

/****************** check scheduled task in every 6 hrs ******** */
nodeCron.schedule("0 */6 * * *", async() => {
    // console.log(new Date().toLocaleString());
    try {
        const date =  Date.now();
        const tomorrowDate = date + 86400000;
        const result = await BatchProcess.find({
            date: { $gt: date, $lt: tomorrowDate },
            isApproved: true,
            isCompressed: false,
        });
        if(result.length > 0){
            result.map( async(fileInfo) => {
                const allFiles = getAllFiles(fileInfo.fromLocation,[]);
                let idx = 0;
                allFiles.map(async(file) => {
                    const filelog = file.split("/");
                    const fileName = filelog[filelog.length - 1 ];
                    const path = {
                        id : fileInfo._id,
                        processName: result[idx]?.processName,
                        fileName: fileName,
                        fromLocation: fileInfo?.fromLocation,
                    };
                    await compress(path, fileInfo.toLocation,result[idx]?.dipValue);
                    idx++;
                });
            });
        }
    } catch (error) {
        console.log("Error on job schedule",error.message);
    }
});

/***************** compress file **************** */
const compress = async(data, toLocation, dpiValue) => {
    const dir = global.__basedir;
    const sh = "./shrinkpdf.sh";
    const sourceLocation = data.fromLocation;
    const compressLocation = toLocation;
    const originalFile = data.fileName;
    let stats = fs.statSync(path.join(dir, `${sourceLocation}/` + originalFile));
    console.log("originalsize: ",stats.size);
    const compactedFile = getCompactedFileName(originalFile);
    // const resolution = data.resolution;
    const quality = dpiValue;
    var command = `${sh} ${sourceLocation}/${originalFile} ${compressLocation}/${compactedFile}`;
    if (quality) {
        command = `${sh} ${sourceLocation}/${originalFile} ${compressLocation}/${compactedFile} ${quality}`;
    }
    else {
        command = `${sh} ${sourceLocation}/${originalFile} ${compressLocation}/${compactedFile}`; //${resolution};

    }
    console.log("command : ",command);
    exec(command, async (err) => {  //execute
        if (err) {
            console.log("Error: Compacting error", err);
            const errorLog = {
                processName: data.processName,
                fromLocation: data.fromLocation,
                toLocation: toLocation,
                fileName: originalFile,
                date: Date.now(),
            };
            const failedData = await FailedProcess.create(errorLog);
            const fromPath = path.join(dir, `${data.fromLocation}/` + originalFile );
            const toPath = path.join(dir, `${process.env.ERROR_LOCATION}/` + originalFile );
            const errorStatus = await fs.copy(fromPath, toPath ,(err) => {
                console.log(">>>>>>> file copy error : ", err.message);
            });
            console.log("error status : ", errorStatus, "db created : ",failedData);
        } else {
            const successLog = {
                processName: data.processName,
                fromLocation: data.fromLocation,
                toLocation: toLocation,
                fileName: compactedFile,
                date: Date.now(),
            };
            const successData = await SuccessProcess.create(successLog);
            await BatchProcess.updateOne({ _id: data.id },{ $set: { isCompressed: true }});
            let statsCompress = await fs.statSync(path.join(dir, `${compressLocation}/` + compactedFile));
            console.log("Compacting successfully",statsCompress, "db created : ",successData);
            console.log(statsCompress.size);
        }
    });
};

// get and adjust the compacted filename
function getCompactedFileName(filename) {
    const index = filename.lastIndexOf(".pdf");
    if (index != -1) {
        return filename.substring(0, index) + "-" + "compacted.pdf";
    }
    return filename + "-" + "compacted.pdf";
}

/*
function callback to check the file in depth of the folder
return full path of the file
*/
const getAllFiles = (dirPath, arrayOfFiles) => {
    let files = fs.readdirSync(dirPath) ?? [];
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(file => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join( dirPath, "/", file));
        }
    });

    return arrayOfFiles;
};

