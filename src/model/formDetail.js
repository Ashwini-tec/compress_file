const mongoose = require("mongoose");

const formDataSchema = new mongoose.Schema({

    formName : {
        type: String,
        required: true,
    },
    formData :{
        type: Array,
        required: true,
    }

}, { timestamps: true });

const FormData = mongoose.model("formData", formDataSchema);

module.exports = FormData;