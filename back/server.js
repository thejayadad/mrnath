
const dotenv = require("dotenv");
const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/User.js");

const app = express();

dotenv.config({path : "./config.env"})
require("./db/conn.js")
const port = process.env.PORT;


app.get("/", (req, res) => {
    res.send("he");
})
app.use(express.json())
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());


app.post("/register", async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const createUser = new User({
            username : username,
            email : email,
            password : password
        })

        const created = await createUser.save();
        res.status(200).send("Registered");
    } catch (error) {
        res.status(400).send(error)

    }
})

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email : email});
        if(user){
            const isMatch = await bcryptjs.compare(password, user.password);
            if(isMatch){
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    expires : new Date(Date.now() + 86400000),
                    httpOnly : true
                })
                res.status(200).send("LoggedIn")
            } else {
                res.status(400).send("Invalid Credentials")
            }
        } else{
            res.status(400).send("Invalid Credentials");
        }

    } catch (error) {
        res.status(400).send(error);
    }
})

app.listen(port, () => {
    console.log("Server Listening");
})