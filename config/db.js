const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.DB_CONFIG || "mongodb://localhost:27017/fileCompressor",
    { useNewUrlParser: true, useUnifiedTopology: true }
)
    .then(console.log("/ DataBase connected .." ))
    .catch(err => console.log("/ Error : ",err.message ));

module.exports = mongoose;