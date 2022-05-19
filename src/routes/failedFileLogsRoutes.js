const router = require("express").Router();
const controller = require("../controllers/CRUDController");
const FailedProcess = require("../model/errorFileCompressFile");
const authenticate = require("../../utils/auth");

/************ to get all ********** */
router.get(
    "/failedProcesses",
    authenticate,
    controller(FailedProcess).getAll
);

/************** get by id ********** */
router.get(
    "/failedProcess/:id",
    authenticate,
    controller(FailedProcess).get
);


module.exports = router;
