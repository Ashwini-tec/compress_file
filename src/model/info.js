const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({

    data: {},

}, { timestamps: true });

const Info = mongoose.model("info", infoSchema);

module.exports = Info;