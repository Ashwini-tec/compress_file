require("dotenv").config();
const { MESSAGE } =  require("../../utils/constant");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const bcrypt = require("bcrypt");

/************ login into system ******** */
const login = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).send({ status: 400, message: MESSAGE.INVALID_USER_PASSWORD });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send({ status: 400, message:MESSAGE. INVALID_USER_PASSWORD });
    }
    user.password = undefined;
    const userData = { role: user.role, email: user.email };
    user.role = undefined;
    res.status(200).send({ Message: MESSAGE.LOGIN_MESSAGE, data: user, token: generateToken(userData) });
};

/*********** Token Generate Function ******* */
const generateToken = (data) => {
    return jwt.sign({ data: data }, process.env.JWT_SECRETE_KEY);
};

module.exports = { login };
