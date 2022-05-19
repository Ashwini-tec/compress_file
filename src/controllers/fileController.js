const path = require("path");
const fs = require("fs-extra");
const BatchProcess = require("../model/file");
const { MESSAGE } = require("../../utils/constant");
const SuccessProcess = require("../model/successCompressFile");
const FailedProcess = require("../model/errorFileCompressFile");
const { exec } = require("child_process");

/************* function to copy file into source folder *******/
const fileTransfer = async(req, res)=>{
    try {
        const data = req.file;
        return res.status(200).json({ data: data });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/**************** schedule task to copy approved file ********** */
const createSchedule = async(req, res)=>{
    try {
        if(res.local !== "admin" && res.local !== "creator"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const data = {
            isApproved: false,
            fromLocation: req.body.fromLocation,
            toLocation: req.body.toLocation,
            processName: req.body.processName,
            date: req.body.date,
            dipValue: req.body.dipValue,
        };
        const result = await BatchProcess.create(data);
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/*************  get all approved scheduled *************/
const getAllApproved = async( req, res )=> {
    try {
        if(res.local !== "admin" && res.local !== "approver"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result = await BatchProcess.find({ isApproved: true });
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/*************** get file scheduled by id ******** */
const getById = async( req, res ) => {
    try {
        if(res.local !== "admin" && res.local !== "approver" && res.local !== "creator"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const result = await BatchProcess.findOne({ _id: req.params.id });
        if(!result){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/**************** update schedule task date to copy and approved file ********** */
const updateSchedule = async(req, res)=>{
    try {
        if(res.local !== "admin" && res.local !== "creator"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const info = await BatchProcess.findOne({ _id: req.params.id });
        if(!info){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        info.date = req.body.date;
        const result = await BatchProcess.findByIdAndUpdate(
            { _id: req.params.id },
            info,
            { new: true }
        );
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/***************** approve file to compress *********** */
const toApproved = async(req, res)=>{
    try {
        if(res.local !== "admin" && res.local !== "approver"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const date = Date.now();
        const data = await BatchProcess.findOne({ _id: req.params.id });
        if(!data){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }
        if(data.date < date){
            return res.status(400).send({ data: MESSAGE.EXPIRED });
        }
        const result = await BatchProcess.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { isApproved: true } },
            { new: true }
        );
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/********** check not approved file till date *********/
const chekNotApprovedFile = async(req, res) => {
    try {
        if(res.local !== "admin" && res.local !== "approver"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const date = Date.now();
        const result = await BatchProcess.find({ date: { $gt: date }, isApproved: false });
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/******************* check expired file ************* */
const chekExpiredFile = async( req, res ) => {
    try {
        if(res.local !== "admin" && res.local !== "approver"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const date = Date.now();
        const result = await BatchProcess.find({ date: { $lt: date }});
        return res.status(200).json({ data: result });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/*************** download file ************* */
const downloadAFile = async(req, res) => {
    try {
        const result = await SuccessProcess.findOne({ _id: req.params.id });
        if(!result){
            return res.status(404).send({ data: MESSAGE.DATA_NOT_FOUND });
        }

        const directoryPath = global.__basedir ;
        if(req.query.download === "true"){
            const fileName = `${directoryPath}/${result.toLocation}/${result?.fileName}`;
            return res.download(fileName , (err) => {
                if (err) {
                    res.status(500).send({
                        message: "Could not download the file. " + err,
                    });
                }
            });
        }

        return res.status(200).send({
            Message: MESSAGE.SEND_STATUS,
            data: `${directoryPath}/${result.toLocation}/${result.fileName}`
        });
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

/************** clean folder ***************** */
const deleteFolder = async(req, res)=>{
    try {
        if(res.local !== "admin"){
            return res.status(400).send({ data: MESSAGE.PERMISSION_NOT_GIVEN });
        }
        const data = req.body.filePath;
        data.map( folderPath => {
            const pathToDir = path.join(global.__basedir, folderPath);
            removeDir(pathToDir);
        });
        return res.status(200).send({ data: "Delete Completed" });
    } catch (error) {
        res.status(500).send({ data: error.message });
    }
};

const removeDir = (path) =>{
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);

        if (files.length > 0) {
            files.forEach(function(filename) {
                if (fs.statSync(path + "/" + filename).isDirectory()) {
                    removeDir(path + "/" + filename);
                } else {
                    fs.unlinkSync(path + "/" + filename);
                }
            });
            fs.rmdirSync(path);
        } else {
            fs.rmdirSync(path);
        }
    } else {
        return false;
    }
};

/****************** real time compress file ************** */
const realtimeCompress = async(req, res) => {
    try {
        const info = {
            fileName: req.body.fileName,
            fromLocation: process.env.SOURCE,
            processName: "RealTime Compress"
        };
        await compress(info, process.env.DESTINATION, req.body.quality);
        setTimeout(() => {
            const fileName = getCompactedFileName(req.body.fileName);
            const downloadPath = path.join(global.__basedir, `${process.env.DESTINATION}/${fileName}`);
            if(req.query.download === "true"){
                const directoryPath = global.__basedir ;
                const data = `${directoryPath}/${process.env.DESTINATION}/${fileName}`;
                return res.download(data , (err) => {
                    if (err) {
                        res.status(500).send({
                            message: "Could not download the file. " + err,
                        });
                    }
                });
            }
            return res.status(200).json({ data: MESSAGE.SUCCESS_MESSAGE_COMPRESS, filePath: downloadPath });
        }, 5000);
    } catch (error) {
        return res.status(500).send({ data: error.message });
    }
};

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

module.exports = {
    fileTransfer,
    createSchedule,
    getById,
    updateSchedule,
    toApproved,
    chekNotApprovedFile,
    chekExpiredFile,
    deleteFolder,
    downloadAFile,
    realtimeCompress,
    getAllApproved,
};
