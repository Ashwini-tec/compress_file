const mongoose = require("mongoose");

const batchProcess = new mongoose.Schema({

    processName: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false,
    },
    fromLocation:{
        type: String,
        require: true,
    },
    toLocation: {
        type: String,
        required: true,
    },
    date:{
        type: Number,
        required: true,
    },
    dipValue:{
        type: Number,
        required: true,
    },
    isCompressed:{
        type: Boolean,
        required: true,
        default: false,
    },

}, { timestamps: true });

const BatchProcess = mongoose.model("batchProcess", batchProcess);

module.exports = BatchProcess;