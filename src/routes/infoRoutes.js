const router = require("express").Router();
const controller = require("../controllers/infoController");
const Info = require("../model/info");

/************create ********** */
router.post(
    "/info",
    controller(Info).create
);

/************ to get all ********** */
router.get(
    "/info",
    controller(Info).getAll
);

/************** get by id ********** */
router.get(
    "/info/:id",
    controller(Info).get
);


module.exports = router;
