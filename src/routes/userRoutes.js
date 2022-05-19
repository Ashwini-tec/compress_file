const router = require("express").Router();
const controller = require("../controllers/CRUDController");
const USER = require("../model/user");
const authenticate = require("../../utils/auth");

/************** create user ************** */
router.post(
    "/user",
    authenticate,
    controller(USER).create
);

/************ to get all ********** */
router.get(
    "/user",
    authenticate,
    controller(USER).getAll
);

/************** get by id ********** */
router.get(
    "/user/:id",
    authenticate,
    controller(USER).get
);

/************ update ********** */
router.put(
    "/user/:id",
    authenticate,
    controller(USER).update
);

/************ delete ************ */
router.delete(
    "/user/:id",
    authenticate,
    controller(USER).remove
);

module.exports = router;
