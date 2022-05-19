const mongoose = require("mongoose");

const failedProcessSchema = new mongoose.Schema({

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

const FailedProcess = mongoose.model("failedFileCompress", failedProcessSchema);

module.exports = FailedProcess;