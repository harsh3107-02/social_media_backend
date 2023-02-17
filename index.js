const express = require("express");

const app = express();
const dotenv = require("dotenv")
dotenv.config();
const helmet = require("helmet")
const multer = require('multer')
const path = require("path")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { default: mongoose } = require("mongoose");
const morgan = require("morgan");

const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

const userroute = require("./Router/user")
const auth = require("./Router/auth")
const post = require("./Router/post");
const router = require("./Router/post");


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("database is connected")
    }
})
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploded successfully");
    } catch (error) {
        console.error(error);
    }
});

// app.get("/", function(req, res) {
//     res.send("thello")
// })
app.use("/api/users", userroute);
app.use("/api/auths", auth);
app.use("/api/post", post)

app.listen(8000, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected")
    }
})