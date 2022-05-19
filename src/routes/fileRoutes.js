const router = require("express").Router();
require("dotenv").config();
const controller = require("../controllers/fileController");
const multer  = require("multer");
const validationMiddleware = require("../../middleware/validationMiddleware");
const validateParams = require("../../middleware/fileSchemaValidation");
const authenticate = require("../../utils/auth");

/*************** multer config ********** */
const storage = multer.diskStorage(
    {
        destination: `./${process.env.SOURCE}`,
        filename: function ( req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);

/************* check file is pdf or not *********** */
const fileFilter = function(req, file, cb) {
    const type = file.mimetype;
    if (type === "application/pdf") {
        cb(null, true);
    }
    else {
        req.error = "Error: This is not a pdf file.";
        cb();
    }
};

/************* upload file config ********** */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 30*1024*1000} // file size is n ot greater then 30 mb
});

/********** file transfer Routes ******** */
router.post(
    "/file/upload",
    upload.single("pdf"),
    controller.fileTransfer
);

/********** create schedule to compress file  ******** */
router.post(
    "/file/createSchedule",
    authenticate,
    validationMiddleware(validateParams.register()),
    controller.createSchedule
);

/********** create schedule to compress file  ******** */
router.get(
    "/file/approvedSchedule",
    authenticate,
    controller.getAllApproved
);


/********** get schedule to process to compress file  ******** */
router.get(
    "/file/fileSchedule/:id",
    authenticate,
    controller.getById
);

/********** update schedule process to compress file  ******** */
router.put(
    "/file/updateSchedule/:id",
    authenticate,
    validationMiddleware(validateParams.update()),
    controller.updateSchedule
);

/********** approve file to compress file at declared date ******** */
router.post(
    "/file/approve/:id",
    authenticate,
    controller.toApproved
);

/********** check not approved file till date ******** */
router.get(
    "/file/notApproved",
    authenticate,
    controller.chekNotApprovedFile
);

/********** check not approved file or expired date to compress ******** */
router.get(
    "/file/expired",
    authenticate,
    controller.chekExpiredFile
);

/*********** download a file ***************** */
router.get(
    "/file/download/:id",
    controller.downloadAFile
);

/**************** delete db and folder ********** */
router.delete(
    "/delete",
    authenticate,
    validationMiddleware(validateParams.deleteFolder()),
    controller.deleteFolder
);

/***************** real time compress ********* */
router.post(
    "/realtime/copmress",
    validationMiddleware(validateParams.realTimeCompress()),
    controller.realtimeCompress
);

module.exports = router;
