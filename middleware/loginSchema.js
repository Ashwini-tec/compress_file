const Joi = require("joi");

module.exports = {
    login: () =>{
        return Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });
    },
};
