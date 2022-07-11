const router = require("express").Router();
require("dotenv").config();
const controller = require("../controllers/compressQueueController");
const validationMiddleware = require("../../middleware/validationMiddleware");
const validateParams = require("../../middleware/compressQueueValidation");
const authenticate = require("../../utils/auth");

/********** create queue to compress file  ******** */
router.post(
    "/file/copmpressQueue",
    authenticate,
    validationMiddleware(validateParams.register()),
    controller.createQueue
);

/********** create queue to compress file  ******** */
router.get(
    "/file/copmpressQueue",
    authenticate,
    controller.getAll
);

/********** get queue to process to compress file  ******** */
router.get(
    "/file/copmpressQueue/:id",
    authenticate,
    controller.getById
);

module.exports = router;
