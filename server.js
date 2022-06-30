const bodyParser = require("body-parser");
const express = require("express");
const fileRoutes = require("./src/routes/fileRoutes");
const loginRoutes = require("./src/routes/loginRoutes");
const failedCompressorRoutes =  require("./src/routes/failedFileLogsRoutes");
const successCompressorRoutes = require("./src/routes/successFileLogsRoutes");
const infoRoutes = require("./src/routes/infoRoutes");
const userRoutes = require("./src/routes/userRoutes");
require("./utils/middleware");
require("./utils/demoUser");
const app = express();
require("dotenv").config();
require("./config/db");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

global.__basedir = __dirname;
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(express.static("public"));
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(YAML.load(__dirname + "/api-docs.yml"))
);

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

/***************** routes *********************/
app.use("/file", express.static("compressLocation"));
app.use("/api", fileRoutes);
app.use("/api", loginRoutes);
app.use("/api", failedCompressorRoutes);
app.use("/api", successCompressorRoutes);
app.use("/api", userRoutes);
app.use("/api", infoRoutes);

const port = process.env.PORT || 8000;
app.listen(port,()=> { console.log(`server is running on port ${port} ....` );});
