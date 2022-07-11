const Joi = require("joi");

module.exports = {

    register: () => {
        return Joi.object({
            dipValue: Joi.number().required(),
            sourceLocation: Joi.string().required(),
            toLocation: Joi.string().required(),
        });
    },

    update : () =>{
        return Joi.object({
            dipValue: Joi.number().required(),
            sourceLocation: Joi.string().required(),
            toLocation: Joi.string().required(),
        });
    },
};
