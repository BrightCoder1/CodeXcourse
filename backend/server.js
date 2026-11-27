const dotenv = require("dotenv")
dotenv.config()


const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const server = http.createServer(app);
const connectDB = require('./src/config/db.config.js')
const { startAutoAbsentAttendance } = require('./src/utils/autoAbsentAttendance.js');

const PORT = process.env.PORT || 5000;

mongoose.connection.once('connected', startAutoAbsentAttendance);
connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} and http://localhost:${PORT}/api`);
});

