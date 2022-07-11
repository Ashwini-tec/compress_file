const FileCompressQueue = require("../model/compressQueue");
const path = require("path");
const fs = require("fs-extra");
const { MESSAGE } = require("../../utils/constant");
const SuccessProcess = require("../model/successCompressFile");
const FailedProcess = require("../model/errorFileCompressFile");
const { exec } = require("child_process");

/*************  get all file compress queue *************/
const getAll = async( req, res )=> {
    try {
        if(res.local !== "admin" && res.local !== "approver"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result = await FileCompressQueue.find({});
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/*************** get file compress queue by id ******** */
const getById = async( req, res ) => {
    try {
        if(res.local !== "admin" && res.local !== "approver" && res.local !== "creator"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result = await FileCompressQueue.findOne({ _id: req.params.id });
        if(!result){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/***************** create compress queue for file compress  **********/
const createQueue = async(req, res)=>{
    try {
        if(res.local !== "admin" && res.local !== "creator"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }

        let fileErrorLog = [];
        let locationToCopy = [];
        let formFileLocation = [];
        const filePath = req.body.sourceLocation;
        const filePathCopy = req.body.toLocation;
        const result = getAllFiles(filePath,[]);

        if(result.length > 0){
            result.forEach( async(item) => {
                let point = item.split("/");
                const ext = path.extname(point[point.length-1]);
                if(ext.toLocaleLowerCase() === MESSAGE.EXTENTION){
                    const firstLocation = point.join("/");
                    point.splice(0,1,filePathCopy);
                    let info = point.join("/");
                    formFileLocation.push(firstLocation);
                    locationToCopy.push(info);
                }else{
                    fileErrorLog.push(`File not Coppied to path ${item}.Not supports ${MESSAGE.EXTENTION} extention`);
                }
            });

        }
        // let result = await copy(formFileLocation, locationToCopy, ip, fileErrorLog);
        for(let i= 0; i< formFileLocation.length; i++ ){
            const filelog = formFileLocation[i].split("/");
            const fileName = filelog[filelog.length - 1 ];

            let toDetailLocation = locationToCopy[i].split("/");
            toDetailLocation.pop();
            const toLocation = toDetailLocation.join("/");
            let fromDetailLocation = formFileLocation[i].split("/");
            fromDetailLocation.pop();
            const sourceLocation = fromDetailLocation.join("/");

            const path = {
                fileName: fileName,
                fromLocation: sourceLocation,
            };
            await compress(path, toLocation,req.body.dipValue);
        }
        const data = {
            filelog:{
                from: formFileLocation,
                to: locationToCopy,
            },
            fileErrorLog: fileErrorLog,
            dipValue: req.body.dipValue,
        };
        const dbResult = await FileCompressQueue.create(data);
        const id = dbResult._id;
        return res.status(200).json({
            Message: MESSAGE.SUCCESS_MESSAGE,
            fileLogs: dbResult.filelog,
            errorLogs: fileErrorLog,
            _id: id,
            createdAt: dbResult.createdAt,
            updatedAt: dbResult.updatedAt,
        });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};


/***************** compress file bash command **************** */
const compress = async(data, toLocation, dpiValue) => {
    fs.mkdir(global.__basedir+ "/" +toLocation, (err) => {
        if (err) {
            console.log("create dir error", err.message );
        }
    });

    const dir = global.__basedir;
    const sh = "./shrinkpdf.sh";
    const sourceLocation = data.fromLocation;
    const compressLocation = toLocation;
    const originalFile = data.fileName;
    let stats = fs.statSync(path.join(dir, `${sourceLocation}/` + originalFile));
    console.log("originalsize: ",stats.size, sourceLocation, compressLocation);
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
                processName: "Real Time Compress Queue",
                fromLocation: data.fromLocation,
                toLocation: toLocation,
                fileName: originalFile,
                date: Date.now(),
            };
            const failedData = await FailedProcess.create(errorLog);
            const fromPath = path.join(dir, `${data.fromLocation}/` + originalFile );
            const toPath = path.join(dir, `${process.env.ERROR_LOCATION}/` + originalFile );
            await fs.copy(fromPath, toPath ,(err) => {
                if(err){
                    console.log(">>>>>>> file copy error : ", err.message);
                }
            });
            console.log("file error db created : ",failedData);
        } else {
            const successLog = {
                processName: "Real Time Compress Queue",
                fromLocation: data.fromLocation,
                toLocation: toLocation,
                fileName: compactedFile,
                date: Date.now(),
            };
            const successData = await SuccessProcess.create(successLog);
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



module.exports = {
    createQueue,
    getById,
    getAll,
};
