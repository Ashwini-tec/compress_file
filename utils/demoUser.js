const User = require("../src/model/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { MESSAGE } = require("../utils/constant");

/******************** create demo user every time when server starts ********** */
(async() => {
    try {
        const password = bcrypt.hashSync(process.env.PASSWORD, 10);
        const data = {
            email : process.env.USER,
            password : password,
            role : "admin",
            name: "Admin",
        };
        const result = await User.findOne({ email: data.email });
        if(!result){
            await User.create(data);
            console.log("Message : User Created");
        }
        console.log("user create error: ",MESSAGE.USER_ALREADY_EXIST);
    } catch (error) {
        console.log(">>>>>>>> error : ", error.message);
    }
})();

