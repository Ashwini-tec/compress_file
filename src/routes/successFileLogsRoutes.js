const router = require("express").Router();
const controller = require("../controllers/CRUDController");
const SuccessProcess = require("../model/successCompressFile");
const authenticate = require("../../utils/auth");

/************ to get all ********** */
router.get(
    "/successProcesses",
    authenticate,
    controller(SuccessProcess).getAll
);

/************** get by id ********** */
router.get(
    "/successProcess/:id",
    authenticate,
    controller(SuccessProcess).get
);

module.exports = router;
