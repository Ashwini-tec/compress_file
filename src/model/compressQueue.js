const mongoose = require("mongoose");

const fileCompressQueueSchema = new mongoose.Schema({
    sourceLocation:{
        type:String,
        required: true,
    },
    toLocation:{
        type:String,
        required: true,
    },
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