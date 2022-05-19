const mongoose = require("mongoose");

const successProcessSchema = new mongoose.Schema({

    processName: {
        type: String,
        required: true,
    },
    fromLocation:{
        type: String,
        require: true,
    },
    toLocation: {
        type: String,
        required: true,
    },
    fileName:{
        type: String,
        required: true,
    },
    date:{
        type: Number,
        required: true,
    },

}, { timestamps: true });

const SuccessProcess = mongoose.model("successFileCompress", successProcessSchema);

module.exports = SuccessProcess;