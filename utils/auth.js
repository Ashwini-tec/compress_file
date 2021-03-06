const jwt = require("jsonwebtoken");
const User = require("../src/model/user");

/***************** authenticate with token *********************************/
const verifyUser = async (req, res, next) => {
    try {
        const bearerToken = req.headers?.authorization?.split(" ");
        const token = bearerToken[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRETE_KEY

        );
        const userData = await User.findOne({ email: decoded.data.email });
        if (!userData) {
            return res.status(404).send({ status: 404, message: "user not found" });
        }
        res.local = userData.role;
        next();

    } catch {
        res.status(401).send({ status: 401, message: "Un-authenticated User" });
    }
};

module.exports = verifyUser;