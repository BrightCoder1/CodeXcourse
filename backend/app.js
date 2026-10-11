const express = require('express');
const app = express();
const router = require("./src/routes.js")
const cookieParser = require("cookie-parser")
const cors = require("cors")


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api',router);


module.exports = app;
