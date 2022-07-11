const mongoose = require("mongoose");

const fileCompressQueueSchema = new mongoose.Schema({
    filelog: {
        from:{
            type: Array,
            require: true,
        },
        to: {
            type: Array,
            require: true,
        }
    },
    fileErrorLog:{
        type: Array,
    },
    dipValue:{
        type: Number,
        required: true,
    },

}, { timestamps: true });

const FileCompressQueue = mongoose.model("fileCompressQueue", fileCompressQueueSchema);

module.exports = FileCompressQueue;