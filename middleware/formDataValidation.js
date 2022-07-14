const Joi = require("joi");

module.exports = {
    create: () =>{
        return Joi.object({
            formName: Joi.string().required(),
            formData: Joi.array().required(),
        });
    },
};
