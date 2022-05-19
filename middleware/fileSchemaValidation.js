const Joi = require("joi");

module.exports = {

    register: () => {
        return Joi.object({
            processName: Joi.string().required(),
            dipValue: Joi.number().required(),
            date: Joi.number().required(),
            fromLocation: Joi.string().required(),
            toLocation: Joi.string().required(),
        });
    },

    update : () =>{
        return Joi.object({
            date: Joi.number().required(),
        });
    },

    deleteFolder: () => {
        return Joi.object({
            filePath: Joi.array(),
        });
    },

    realTimeCompress: ()=> {
        return Joi.object({
            fileName: Joi.string().required(),
            quality: Joi.number().required(),
        });
    },
};
