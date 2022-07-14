const router = require("express").Router();
const controller = require("../controllers/formDetailController");
const FormData = require("../model/formDetail");
const validationMiddleware = require("../../middleware/validationMiddleware");
const validateParams = require("../../middleware/formDataValidation");

/************create ********** */
router.post(
    "/formDetail",
    validationMiddleware(validateParams.create()),
    controller(FormData).create
);

/************ to get all ********** */
router.get(
    "/formDetail",
    controller(FormData).getAll
);

/************** get by id ********** */
router.get(
    "/formDetail/:id",
    controller(FormData).get
);


module.exports = router;
