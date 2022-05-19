const router = require("express").Router();
const controller = require("../controllers/loginController");

/************** login ************** */
router.post("/login", controller.login);

module.exports = router;
