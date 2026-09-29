const express = require('express');
const app = express();
const router = require("./src/routes.js")
const cookieParser = require("cookie-parser")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api',router);


module.exports = app;
